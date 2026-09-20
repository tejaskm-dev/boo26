#!/usr/bin/env python3
"""
Cuts the BOO! asset sheets into individual transparent assets.

The sheets are not grids. Rows hold different numbers of items, items are
staggered, and several pieces are made of parts that do not touch — a cat and
its floating "!!", the "zzz" over a sleeping cat, the spray specks around a
graffiti mark. Cutting squares, or running one connected-component pass, gets
both wrong: a tight grouping shatters a cat away from its marks, a loose one
welds neighbours together.

So segmentation runs on the *empty space* instead of the ink:

  1. project alpha across the full width, and split into row bands wherever
     there is a clean run of empty rows
  2. project each band down its own height, and split into cells at the empty
     columns — done per band, so a row of three and a row of four both work
  3. everything inside one cell is one asset, which groups a character with
     its detached marks for free

Segmentation uses a strict alpha so soft glow halos cannot bridge a gap;
the final crop uses a loose one so those glows survive in the cut.

  python3 scripts/slice-sprite.py --contact   # number every cell, per sheet
  python3 scripts/slice-sprite.py             # cut what sprite-map.json names
"""
from PIL import Image, ImageDraw, ImageFilter
import json, pathlib, shutil, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
DESIGN = ROOT / "design"
OUT = ROOT / "public" / "assets"
MAP = DESIGN / "sprite-map.json"
OVERRIDES = DESIGN / "sprite-overrides.json"

SOLID = 48      # alpha that counts as "ink" when looking for empty space
FAINT = 8       # alpha that counts as "present" when cropping, keeps glows
MIN_RUN_Y = 5   # empty rows needed to call it a row break
MIN_RUN_X = 6   # empty columns needed to call it a cell break
MIN_CELL = 34   # anything smaller is a stray speck, not an asset
NOISE = 0.004   # share of a line that may carry ink and still count as empty
ERODE = 8       # px of ink shaved off before profiling, to clear the aisles


def mask(im, threshold):
    return im.getchannel("A").point(lambda v: 255 if v > threshold else 0)


def erode(m, px):
    """
    Shrink the ink before looking for gaps.

    These sheets are covered in loose spray specks and hanging drips that are
    only a few pixels across but sit right in the aisles between pieces. A
    projection sees them as a wall. Eroding first deletes anything thinner than
    `px` so the aisles open up, while the pieces themselves — hundreds of
    pixels across — barely change. The crop still comes off the untouched
    alpha, so every speck stays in the asset it belongs to.
    """
    out = m
    step = 2  # MinFilter(5) removes 2px per pass
    for _ in range(max(0, px // step)):
        out = out.filter(ImageFilter.MinFilter(5))
    return out


def runs(profile, min_run):
    """Index ranges of content, split wherever the profile stays empty."""
    spans, start, gap = [], None, 0
    for i, blank in enumerate(profile):
        if not blank:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_run:
                spans.append((start, i - gap + 1))
                start, gap = None, 0
    if start is not None:
        spans.append((start, len(profile)))
    return spans


def _empty(counts, samples):
    """
    A line is 'empty' if it carries almost no ink. Testing for *any* ink makes
    a single stray anti-aliased pixel bridge a real gap, and these renders
    leave plenty of those, so allow a small fraction through.
    """
    tol = max(1, round(samples * NOISE))
    return [c <= tol for c in counts]


def profile_y(m, box):
    """Ink density on each row of this box, as an emptiness flag."""
    px = m.load()
    x0, y0, x1, y1 = box
    xs = range(x0, x1, 2)
    n = len(xs)
    return _empty([sum(1 for x in xs if px[x, y]) for y in range(y0, y1)], n)


def profile_x(m, box):
    """Ink density on each column of this box, as an emptiness flag."""
    px = m.load()
    x0, y0, x1, y1 = box
    ys = range(y0, y1, 2)
    n = len(ys)
    return _empty([sum(1 for y in ys if px[x, y]) for x in range(x0, x1)], n)


def widest_gap(profile, min_run):
    """
    Longest empty run *between* the first and last ink. Margins are not
    separators, so they are excluded before measuring.
    """
    ink = [i for i, blank in enumerate(profile) if not blank]
    if len(ink) < 2:
        return 0
    best = run = 0
    for blank in profile[ink[0]:ink[-1] + 1]:
        run = run + 1 if blank else 0
        best = max(best, run)
    return best if best >= min_run else 0


def xy_cut(m, box, depth=0):
    """
    Recursive X-Y cut. At each step take whichever axis has the more confident
    run of empty space, split on it, and recurse into the pieces. Rows that
    interlock vertically still separate on the column pass, and a staggered row
    of three beside a row of four still separates on the row pass, because each
    branch is measured on its own region rather than the whole sheet.
    """
    if depth > 6:
        return [box]
    x0, y0, x1, y1 = box

    cols = runs(profile_x(m, box), MIN_RUN_X)
    rows = runs(profile_y(m, box), MIN_RUN_Y)
    gap_x = widest_gap(profile_x(m, box), MIN_RUN_X) if len(cols) > 1 else 0
    gap_y = widest_gap(profile_y(m, box), MIN_RUN_Y) if len(rows) > 1 else 0

    if not gap_x and not gap_y:
        return [box]

    out = []
    if gap_x >= gap_y:
        for a, b in cols:
            out += xy_cut(m, (x0 + a, y0, x0 + b, y1), depth + 1)
    else:
        for a, b in rows:
            out += xy_cut(m, (x0, y0 + a, x1, y0 + b), depth + 1)
    return out


def grow(box, faint, cores, step=4, limit=600):
    """
    Put back what erosion took.

    Eroding to find the aisles also eats anything thin — a safety pin's wire, a
    whisker, a drip — so a cell can come back smaller than the piece it holds.
    Each edge is pushed outward while there is still ink against it in the
    untouched alpha, and stopped the moment it would reach into another cell's
    core. That recovers the thin parts without welding neighbours together.
    """
    px = faint.load()
    x0, y0, x1, y1 = box
    others = [c for c in cores if c != box]

    def blocked(nb):
        return any(nb[0] < o[2] and o[0] < nb[2] and nb[1] < o[3] and o[1] < nb[3]
                   for o in others)

    for _ in range(limit // step):
        moved = False
        # left
        if x0 - step >= 0 and any(px[x, y] for x in range(max(0, x0 - step), x0)
                                  for y in range(y0, y1)):
            nb = (x0 - step, y0, x1, y1)
            if not blocked(nb):
                x0 -= step; moved = True
        # right
        if x1 + step <= faint.width and any(px[x, y] for x in range(x1, min(faint.width, x1 + step))
                                            for y in range(y0, y1)):
            nb = (x0, y0, x1 + step, y1)
            if not blocked(nb):
                x1 += step; moved = True
        # top
        if y0 - step >= 0 and any(px[x, y] for y in range(max(0, y0 - step), y0)
                                  for x in range(x0, x1)):
            nb = (x0, y0 - step, x1, y1)
            if not blocked(nb):
                y0 -= step; moved = True
        # bottom
        if y1 + step <= faint.height and any(px[x, y] for y in range(y1, min(faint.height, y1 + step))
                                             for x in range(x0, x1)):
            nb = (x0, y0, x1, y1 + step)
            if not blocked(nb):
                y1 += step; moved = True
        if not moved:
            break
    return (x0, y0, x1, y1)


def cells(im, erode_px=ERODE):
    solid = erode(mask(im, SOLID), erode_px)
    # start from the ink, not the canvas — empty margins are not separators
    start = solid.getbbox() or (0, 0, im.width, im.height)
    faint = mask(im, FAINT)
    cores = []
    for box in xy_cut(solid, start):
        sub = mask(im.crop(box), FAINT).getbbox()
        if not sub:
            continue
        b = (box[0] + sub[0], box[1] + sub[1], box[0] + sub[2], box[1] + sub[3])
        if b[2] - b[0] >= MIN_CELL and b[3] - b[1] >= MIN_CELL:
            cores.append(b)

    out = [grow(b, faint, cores) for b in cores]
    # reading order: top-to-bottom in bands, left-to-right inside them
    out.sort(key=lambda b: (round(b[1] / 90), b[0]))
    return out


def rules_for(sheet):
    if not OVERRIDES.exists():
        return {}
    return json.load(open(OVERRIDES)).get(sheet, {})


def apply_overrides(sheet, boxes):
    """
    Hand corrections for what measuring empty space cannot settle: pieces that
    genuinely overlap in the render, and marks the erosion separated that are
    really one thing.

    Every index refers to the *raw* segmentation — the numbering on the contact
    sheet — so rules never have to account for how earlier rules renumbered
    things. Each original cell becomes a list of boxes, the rules edit those
    lists in place, and the result is flattened at the end.
    """
    rules = rules_for(sheet)
    slots = [[b] for b in boxes]

    for a, b in rules.get("merge", []):
        if a >= len(slots) or b >= len(slots) or not slots[a] or not slots[b]:
            continue
        ax, ay, ax1, ay1 = slots[a][0]
        bx, by, bx1, by1 = slots[b][0]
        slots[a][0] = (min(ax, bx), min(ay, by), max(ax1, bx1), max(ay1, by1))
        slots[b] = []

    for k, x in rules.get("split_x", {}).items():
        i = int(k)
        if i < len(slots) and slots[i]:
            x0, y0, x1, y1 = slots[i][0]
            slots[i] = [(x0, y0, x, y1), (x, y0, x1, y1)]

    for k, y in rules.get("split_y", {}).items():
        i = int(k)
        if i < len(slots) and slots[i]:
            x0, y0, x1, y1 = slots[i][0]
            slots[i] = [(x0, y0, x1, y), (x0, y, x1, y1)]

    for k, boxlist in rules.get("replace", {}).items():
        i = int(k)
        if i < len(slots):
            slots[i] = [tuple(b) for b in boxlist]

    for i in rules.get("drop", []):
        if i < len(slots):
            slots[i] = []

    return [b for slot in slots for b in slot]


def sheets():
    found = {}
    for p in sorted(DESIGN.glob("*.PNG")) + sorted(DESIGN.glob("*.png")):
        if p.name.startswith("sprite-"):
            continue
        im = Image.open(p).convert("RGBA")
        if im.getchannel("A").getextrema()[0] == 255:
            continue  # no transparency, not an asset sheet
        found[p.stem] = im
    return found


def components(im, thr=SOLID):
    """Connected runs of ink, biggest first."""
    w, h = im.size
    a = im.getchannel("A").tobytes()
    seen = bytearray(w * h)
    out = []
    for start in range(w * h):
        if seen[start] or a[start] <= thr:
            continue
        stack = [start]; seen[start] = 1; px = []
        while stack:
            i = stack.pop(); px.append(i)
            x, y = i % w, i // w
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < w and 0 <= ny < h:
                    j = ny * w + nx
                    if not seen[j] and a[j] > thr:
                        seen[j] = 1; stack.append(j)
        out.append(px)
    return sorted(out, key=len, reverse=True), w, h


def sliced_by_frame(px, w, h):
    """
    True when the crop cut straight through this shape.

    A piece that merely reaches the edge of its own bounding box touches it at
    a point. A piece the frame cut in half runs flat along that edge for most
    of its width, which is the tell for a neighbour leaking in.
    """
    xs = [i % w for i in px]; ys = [i // w for i in px]
    cw, ch = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1
    edges = ((sorted(i % w for i in px if i // w <= 1), cw),
             (sorted(i % w for i in px if i // w >= h - 2), cw),
             (sorted(i // w for i in px if i % w <= 1), ch),
             (sorted(i // w for i in px if i % w >= w - 2), ch))
    for coords, extent in edges:
        best = run = 0; prev = None
        for c in coords:
            run = run + 1 if prev is not None and c - prev <= 1 else 1
            prev = c; best = max(best, run)
        if best >= 10 and best >= 0.55 * extent:
            return True
    return False


def declutter(im):
    """
    Drop shapes that belong to the piece next door.

    Only for cells the map opts into: on the graffiti the loose spray really is
    part of the mark, and a rule that cannot tell one from the other would eat
    it. Keeping the call explicit means the judgement stays where it is
    readable, in sprite-map.json.
    """
    parts, w, h = components(im)
    if len(parts) < 2:
        return im
    keep = [p for p in parts[1:] if len(p) > 0.08 * len(parts[0])
            or not sliced_by_frame(p, w, h)]
    if len(keep) == len(parts) - 1:
        return im
    px = im.load()
    for p in parts[1:]:
        if p in keep:
            continue
        for i in p:
            x, y = i % w, i // w
            px[x, y] = (0, 0, 0, 0)
    return im.crop(im.getchannel("A").point(lambda v: 255 if v > FAINT else 0).getbbox())


def enhance(im, factor=2.0):
    """
    Upscale so the page can render these at their intended size at 1:1 device
    pixels, with a restrained sharpen so the soft 3D renders keep their edges.
    """
    w, h = im.size
    big = im.resize((round(w * factor), round(h * factor)), Image.LANCZOS)
    rgb = Image.merge("RGB", big.split()[:3])
    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.6, percent=58, threshold=2))
    return Image.merge("RGBA", (*rgb.split(), big.split()[3]))


def save(im, name, quality=92):
    png = OUT / f"{name}.png"
    im.save(png)
    webp = OUT / f"{name}.webp"
    if shutil.which("cwebp"):
        subprocess.run(["cwebp", "-quiet", "-q", str(quality), "-alpha_q", "100",
                        str(png), "-o", str(webp)], check=True)
        png.unlink()
    else:
        im.save(webp, quality=quality, method=6); png.unlink()
    return webp


def contact(found):
    index = {}
    for stem, im in found.items():
        boxes = apply_overrides(stem, cells(im, rules_for(stem).get("erode", ERODE)))
        index[stem] = [{"i": i, "box": list(b), "size": [b[2] - b[0], b[3] - b[1]]}
                       for i, b in enumerate(boxes)]
        flat = Image.new("RGB", im.size, (52, 52, 52))
        flat.paste(im, (0, 0), im)
        d = ImageDraw.Draw(flat)
        for i, b in enumerate(boxes):
            d.rectangle(b, outline=(255, 60, 60), width=3)
            d.text((b[0] + 5, b[1] + 5), str(i), fill=(255, 210, 60))
        flat.save(DESIGN / f"sprite-contact-{stem[:8]}.png")
        print(f"{stem[:8]}  {im.size[0]}x{im.size[1]}  ->  {len(boxes)} cells")
    json.dump(index, open(DESIGN / "sprite-boxes.json", "w"), indent=1)


def cut_all(found):
    if not MAP.exists():
        sys.exit("no design/sprite-map.json — run --contact first, then name the cells")
    OUT.mkdir(parents=True, exist_ok=True)
    boxes = {stem: apply_overrides(stem, cells(im, rules_for(stem).get("erode", ERODE)))
             for stem, im in found.items()}
    for name, ref in json.load(open(MAP)).items():
        if name.startswith("_"):
            continue
        stem = ref["sheet"]
        match = next((s for s in found if s.startswith(stem)), None)
        if match is None:
            print(f"  !! {name}: no sheet {stem}"); continue
        # A few pieces are single hairlines - a spider web, a small star. Erosion
        # deletes them before the gaps are even measured, so they never become a
        # cell. Those are named by box instead of by cell.
        box = tuple(ref["box"]) if "box" in ref else tuple(boxes[match][ref["cell"]])
        raw = found[match].crop(box)
        asset = enhance(declutter(raw) if ref.get("clean") else raw)
        path = save(asset, name)
        print(f"  {name:22} {asset.size[0]:4}x{asset.size[1]:<4} {path.stat().st_size/1024:6.1f} kB")


found = sheets()
if not found:
    sys.exit(f"no transparent sheets in {DESIGN}")
contact(found) if "--contact" in sys.argv else cut_all(found)
