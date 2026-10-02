#!/usr/bin/env python3
"""
Cuts the art the coming-soon page uses.

Three sources, three treatments:

  1. Pieces on the old asset boards whose files shipped empty — every pixel
     transparent, from a declutter bug that's fixed in slice-sprite.py — plus
     a few drawings on the same board nobody had cut yet. These go through
     slice-sprite.py's own pipeline, so they match every other sprite.

  2. design/teaser/sheet.png: generated on a flat grey, with no alpha. Keyed
     here by how far each pixel is from that grey — a difference matte — with
     the grey taken back out of the soft edges, so a lime glow keeps its lime
     over the site's ink instead of carrying a grey rim onto it.

  3. design/teaser/door-smashed.png and window.png: generated with their own
     transparency, at full size. Their "solid" pixels come out at 248-253
     rather than 255, which is squared off, and they're brought down to the
     size the page draws them at.

Some pieces are frames of one animation — the bulb off and on, the four bat
poses — and are placed on a shared canvas lined up by a fixed point, so
swapping one for the next never makes the art jump.

  python3 scripts/cut-teaser-assets.py
"""
from PIL import Image, ImageChops, ImageDraw, ImageFilter
import importlib.util, pathlib, json

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEASER = ROOT / "design" / "teaser"

spec = importlib.util.spec_from_file_location("slicer", ROOT / "scripts" / "slice-sprite.py")
slicer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(slicer)


# ------------------------------------------------------------------ 1. boards
BOARD = {
    # the six that shipped empty, by the cells sprite-map.json already names
    "cat-sneak": ("updatesprite", 8),
    "cat-witch": ("updatesprite", 17),
    "cat-pumpkin": ("updatesprite", 18),
    "ghost": ("updatesprite", 22),
    "tape-dark": ("9E31BFFF", 7),
    "tape-lime": ("9E31BFFF", 8),
    # drawn on the same board, never cut
    "cat-away": ("updatesprite", 10),
    "bubble-q": ("updatesprite", 13),
    "cat-oneeye": ("updatesprite", 20),
    "door-peek": ("updatesprite", 23),
}


def cut_boards():
    found = {k: v for k, v in slicer.sheets().items() if not k.startswith(("door-smashed", "window"))}
    boxes = {}
    for name, (stem, cell) in BOARD.items():
        match = next(s for s in found if s.startswith(stem))
        if match not in boxes:
            im = found[match]
            boxes[match] = slicer.apply_overrides(match, slicer.cells(im, slicer.rules_for(match).get("erode", slicer.ERODE)))
        raw = found[match].crop(tuple(boxes[match][cell]))
        asset = slicer.enhance(slicer.declutter(raw))
        path = slicer.save(asset, name)
        print(f"  board  {name:14} {asset.size[0]:4}x{asset.size[1]:<4} {path.stat().st_size/1024:6.1f} kB")


# ------------------------------------------------------------ 2. grey sheet
GREY = (121, 121, 121)
LO, HI = 6, 42  # distance from the grey: below LO is background, above HI is solid

SHEET = {
    "cctv": (60, 26, 326, 254),
    "cctv-mount": (332, 120, 536, 292),
    "clock-empty": (598, 20, 914, 342),
    "bulb-off": (1018, 10, 1144, 354),
    "bulb-on": (1264, 10, 1406, 360),
    "bat-up": (48, 348, 334, 522),
    "bat-level": (340, 370, 710, 524),
    "bat-down": (738, 372, 1010, 532),
    "bat-folded": (1076, 374, 1248, 568),
    "spider": (1332, 352, 1504, 574),
    "candy": (16, 544, 236, 668),
    "lollipop": (262, 554, 384, 762),
    "candy-corn": (388, 570, 466, 692),
    "cat-skeleton": (446, 568, 808, 980),
    "tv": (832, 612, 1164, 974),
}
# grey that's inside a piece and meant to be see-through
HOLES = {"tv": [(975, 790)]}


def key(src, box, holes=(), pad=10):
    x0, y0, x1, y1 = box
    im = src.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad))
    w, h = im.size
    d = ImageChops.difference(im, Image.new("RGB", im.size, GREY))
    r, g, b = d.split()
    dist = ImageChops.lighter(ImageChops.lighter(r, g), b)
    # background is whatever near-grey the edges (and any named hole) reach
    reg = dist.point(lambda v: 255 if v < HI else 0)
    seeds = [(x, y) for x in range(w) for y in (0, h - 1)] + [(x, y) for y in range(h) for x in (0, w - 1)]
    seeds += [(sx - (x0 - pad), sy - (y0 - pad)) for sx, sy in holes]
    for p in seeds:
        if reg.getpixel(p) == 255:
            ImageDraw.floodfill(reg, p, 128)
    ip, dp, rp = im.load(), dist.load(), reg.load()
    out = Image.new("RGBA", im.size)
    op = out.load()
    for y in range(h):
        for x in range(w):
            c = ip[x, y]
            if rp[x, y] != 128:
                op[x, y] = c + (255,)
                continue
            v = dp[x, y]
            a = 0.0 if v <= LO else min(1.0, (v - LO) / (HI - LO))
            if a <= 0:
                op[x, y] = (0, 0, 0, 0)
                continue
            # take the grey back out of the edge: c = a*fg + (1-a)*grey
            op[x, y] = tuple(max(0, min(255, round((c[i] - (1 - a) * GREY[i]) / a))) for i in range(3)) + (round(a * 255),)
    return only_biggest(out)


def only_biggest(im):
    """Neighbours' edges can reach into a crop; keep the one piece it's for."""
    m = im.getchannel("A").point(lambda v: 255 if v > 0 else 0)
    mp = m.load()
    w, h = im.size
    sizes, label = {}, 1
    for y in range(h):
        for x in range(w):
            if mp[x, y] == 255 and label < 250:
                before = m.histogram()[255]
                ImageDraw.floodfill(m, (x, y), label)
                sizes[label] = before - m.histogram()[255]
                label += 1
    keep = max(sizes, key=sizes.get)
    a = im.getchannel("A")
    ap = a.load()
    for y in range(h):
        for x in range(w):
            if mp[x, y] != keep:
                ap[x, y] = 0
    im.putalpha(a)
    return im.crop(im.getbbox())


def lime_centre(im, region=None):
    """The middle of the glowing lime in a piece — a bat's eyes, a bulb's cap row."""
    px = im.load()
    w, h = im.size
    x0, y0, x1, y1 = region or (0, 0, w, h)
    xs = ys = n = 0
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b, a = px[x, y]
            if a > 200 and g > 190 and r > 150 and b < 140:
                xs += x; ys += y; n += 1
    return (xs / n, ys / n) if n else (w / 2, h / 2)


def top_centre(im):
    """Middle of the topmost solid row: where a hanging thing hangs from."""
    a = im.getchannel("A").load()
    w, h = im.size
    for y in range(h):
        xs = [x for x in range(w) if a[x, y] > 200]
        if len(xs) > 6:
            return (sum(xs) / len(xs), y)
    return (w / 2, 0)


def register(pieces, anchor):
    """Put frames on one canvas, lined up on `anchor(piece)`."""
    points = {k: anchor(v) for k, v in pieces.items()}
    left = max(p[0] for p in points.values())
    top = max(p[1] for p in points.values())
    right = max(v.width - points[k][0] for k, v in pieces.items())
    bottom = max(v.height - points[k][1] for k, v in pieces.items())
    W, H = round(left + right) + 2, round(top + bottom) + 2
    out = {}
    for k, v in pieces.items():
        canvas = Image.new("RGBA", (W, H))
        canvas.paste(v, (round(left - points[k][0]), round(top - points[k][1])), v)
        out[k] = canvas
    return out


def cut_sheet():
    src = Image.open(TEASER / "sheet.png").convert("RGB")
    pieces = {name: key(src, box, HOLES.get(name, ())) for name, box in SHEET.items()}

    bulbs = register({k: pieces[k] for k in ("bulb-off", "bulb-on")}, top_centre)
    bats = register(
        {k: pieces[k] for k in ("bat-up", "bat-level", "bat-down", "bat-folded")},
        lambda im: lime_centre(im, (0, 0, im.width, round(im.height * 0.8))),
    )
    pieces.update(bulbs)
    pieces.update(bats)

    for name, im in pieces.items():
        path = slicer.save(im, name)
        print(f"  sheet  {name:14} {im.size[0]:4}x{im.size[1]:<4} {path.stat().st_size/1024:6.1f} kB")


# --------------------------------------------------------- 3. full-size art
FULL = {"door-smashed": 820, "window": 860}  # px wide, the size the page draws them at 2x


def cut_full():
    for name, width in FULL.items():
        im = Image.open(TEASER / f"{name}.png").convert("RGBA")
        r, g, b, a = im.split()
        # "solid" came out at 248-253: square it off, and drop the dust at the bottom
        a = a.point(lambda v: 255 if v >= 236 else (0 if v <= 6 else v))
        im = Image.merge("RGBA", (r, g, b, a))
        im = im.crop(im.getbbox())
        h = round(im.height * width / im.width)
        im = im.resize((width, h), Image.LANCZOS)
        rgb = Image.merge("RGB", im.split()[:3]).filter(ImageFilter.UnsharpMask(radius=1.2, percent=40, threshold=2))
        im = Image.merge("RGBA", (*rgb.split(), im.split()[3]))
        # wood grain and ivy at 92 came to ~270 kB each; at 78 the difference
        # can't be seen at the size they're drawn, and a phone isn't made to
        # wait for it
        path = slicer.save(im, name, quality=78)
        print(f"  full   {name:14} {im.size[0]:4}x{im.size[1]:<4} {path.stat().st_size/1024:6.1f} kB")


if __name__ == "__main__":
    cut_boards()
    cut_sheet()
    cut_full()
