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


def mask(im, threshold):
    return im.getchannel("A").point(lambda v: 255 if v > threshold else 0)


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


def cells(im):
    solid = mask(im, SOLID)
    # start from the ink, not the canvas — empty margins are not separators
    start = solid.getbbox() or (0, 0, im.width, im.height)
    out = []
    for box in xy_cut(solid, start):
        # tighten to what is actually there, glow included
        sub = mask(im.crop(box), FAINT).getbbox()
        if not sub:
            continue
        b = (box[0] + sub[0], box[1] + sub[1], box[0] + sub[2], box[1] + sub[3])
        if b[2] - b[0] >= MIN_CELL and b[3] - b[1] >= MIN_CELL:
            out.append(b)
    # reading order: top-to-bottom in bands, left-to-right inside them
    out.sort(key=lambda b: (round(b[1] / 90), b[0]))
    return out


def apply_overrides(sheet, boxes):
    """
    Hand corrections for the cases the projection cannot see: two pieces that
    touch and must be split, or a cell that should have been one asset.
    """
    if not OVERRIDES.exists():
        return boxes
    rules = json.load(open(OVERRIDES)).get(sheet, {})
    for at in sorted((int(k) for k in rules.get("split_x", {})), reverse=True):
        x = rules["split_x"][str(at)]
        b = boxes[at]
        boxes[at:at + 1] = [(b[0], b[1], x, b[3]), (x, b[1], b[2], b[3])]
    for a, b in rules.get("merge", []):
        boxes[a] = (min(boxes[a][0], boxes[b][0]), min(boxes[a][1], boxes[b][1]),
                    max(boxes[a][2], boxes[b][2]), max(boxes[a][3], boxes[b][3]))
    for i in sorted(rules.get("drop", []), reverse=True):
        del boxes[i]
    return boxes


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
        boxes = apply_overrides(stem, cells(im))
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
    boxes = {stem: apply_overrides(stem, cells(im)) for stem, im in found.items()}
    for name, ref in json.load(open(MAP)).items():
        stem, idx = ref["sheet"], ref["cell"]
        match = next((s for s in found if s.startswith(stem)), None)
        if match is None:
            print(f"  !! {name}: no sheet {stem}"); continue
        asset = enhance(found[match].crop(tuple(boxes[match][idx])))
        path = save(asset, name)
        print(f"  {name:22} {asset.size[0]:4}x{asset.size[1]:<4} {path.stat().st_size/1024:6.1f} kB")


found = sheets()
if not found:
    sys.exit(f"no transparent sheets in {DESIGN}")
contact(found) if "--contact" in sys.argv else cut_all(found)
