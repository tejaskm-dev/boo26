#!/usr/bin/env python3
"""
Measures the cat's eyes in the supplied artwork so src/lib/eyes.ts can pin an
interactive pupil exactly over the painted one. Prints trimmed-space geometry.
Sources are never modified.
"""
from PIL import Image
from collections import defaultdict
import pathlib

SRC = pathlib.Path(__file__).resolve().parent.parent / "design" / "refs"
LIME = (228, 249, 62)

def trim_origin(im):
    return im.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()[:2]

def eye_boxes(im, step=2, cell=12, keep=2):
    """Largest solid-lime clusters in the image are the two eyes."""
    px = im.load(); w, h = im.size
    cells = defaultdict(list)
    for y in range(0, h, step):
        for x in range(0, w, step):
            r, g, b, a = px[x, y]
            if a > 200 and g > 190 and 150 < r < 250 and b < 120 and g - b > 110:
                cells[(x // cell, y // cell)].append((x, y))
    parent = {k: k for k in cells}
    def find(k):
        while parent[k] != k: parent[k] = parent[parent[k]]; k = parent[k]
        return k
    for cx, cy in list(cells):
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if (cx + dx, cy + dy) in cells:
                    a, b = find((cx, cy)), find((cx + dx, cy + dy))
                    if a != b: parent[a] = b
    groups = defaultdict(list)
    for k in cells: groups[find(k)].extend(cells[k])
    cand = []
    for v in sorted(groups.values(), key=len, reverse=True)[:8]:
        xs = [p[0] for p in v]; ys = [p[1] for p in v]
        bx = (min(xs), min(ys), max(xs), max(ys))
        bw, bh = bx[2] - bx[0], bx[3] - bx[1]
        # an eye is a compact blob, not the drip glow running under the wordmark
        if bw > w * 0.24 or bh > h * 0.24 or bw < w * 0.03: continue
        if not 0.55 < bw / max(bh, 1) < 1.9: continue
        cand.append((len(v), bx))
    cand.sort(reverse=True, key=lambda c: c[0])
    return sorted([b for _, b in cand[:keep]], key=lambda b: b[0])

def pupil_box(im, box, inset=0.86):
    x0, y0, x1, y1 = box
    cx, cy, rx, ry = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
    px = im.load(); xs = []; ys = []
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if ((x - cx) / (rx * inset)) ** 2 + ((y - cy) / (ry * inset)) ** 2 > 1: continue
            r, g, b, a = px[x, y]
            if a > 200 and r < 70 and g < 70 and b < 70: xs.append(x); ys.append(y)
    return min(xs), min(ys), max(xs), max(ys)

for name in ("center logo.png", "cat peeking.png"):
    im = Image.open(SRC / name).convert("RGBA")
    ox, oy = trim_origin(im)
    print(f"== {name}  trim origin ({ox},{oy})")
    for box in eye_boxes(im):
        ex0, ey0, ex1, ey1 = box
        px0, py0, px1, py1 = pupil_box(im, box)
        print(f"   eye  c=({(ex0+ex1)/2-ox:.0f},{(ey0+ey1)/2-oy:.0f}) "
              f"r=({(ex1-ex0)/2:.0f},{(ey1-ey0)/2:.0f})")
        print(f"   pupil c=({(px0+px1)/2-ox:.0f},{(py0+py1)/2-oy:.0f}) "
              f"r=({(px1-px0)/2:.0f},{(py1-py0)/2:.0f})")
