#!/usr/bin/env python3
"""
Traces the black/off-white fields out of the supplied reference comps so the
site's SVG backdrops follow the same composition instead of being guessed.
Outputs design/shapes.json. Sources are never modified.
"""
from PIL import Image
from collections import deque
import json, math, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "design" / "refs"

def binarise(im, w, thr):
    h = round(im.height * w / im.width)
    g = im.convert("L").resize((w, h), Image.LANCZOS)
    px = g.load()
    return [[1 if px[x, y] < thr else 0 for x in range(w)] for y in range(h)], w, h

def components(grid, w, h, value):
    seen = [[False]*w for _ in range(h)]
    out = []
    for sy in range(h):
        for sx in range(w):
            if seen[sy][sx] or grid[sy][sx] != value: continue
            q = deque([(sx, sy)]); seen[sy][sx] = True; cells = []
            touches_border = False
            while q:
                x, y = q.popleft(); cells.append((x, y))
                if x in (0, w-1) or y in (0, h-1): touches_border = True
                for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
                    nx, ny = x+dx, y+dy
                    if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and grid[ny][nx] == value:
                        seen[ny][nx] = True; q.append((nx, ny))
            out.append({"cells": cells, "border": touches_border})
    return out

def fill_holes(grid, w, h):
    for comp in components(grid, w, h, 0):
        if not comp["border"]:
            for x, y in comp["cells"]: grid[y][x] = 1
    return grid

# Moore-neighbour boundary tracing
NB = [(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1),(0,-1),(1,-1)]
def trace(mask, w, h, start):
    def on(x, y): return 0 <= x < w and 0 <= y < h and mask[y][x]
    cx, cy = start; b = 6
    path = [(cx, cy)]
    for _ in range(w*h*4):
        found = False
        for k in range(8):
            d = NB[(b+k) % 8]
            nx, ny = cx+d[0], cy+d[1]
            if on(nx, ny):
                b = (NB.index((-d[0], -d[1])) + 1) % 8
                cx, cy = nx, ny; path.append((cx, cy)); found = True; break
        if not found: break
        if (cx, cy) == start and len(path) > 3: break
    return path

def rdp_closed(pts, eps):
    """RDP on a closed ring: split at the point farthest from the start."""
    if len(pts) > 1 and pts[0] == pts[-1]: pts = pts[:-1]
    if len(pts) < 8: return pts
    x0, y0 = pts[0]
    far = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0]-x0, pts[i][1]-y0))
    a = rdp(pts[:far+1], eps)
    b = rdp(pts[far:] + [pts[0]], eps)
    return a[:-1] + b[:-1]

def rdp(pts, eps):
    if len(pts) < 3: return pts
    x1, y1 = pts[0]; x2, y2 = pts[-1]
    dx, dy = x2-x1, y2-y1; n = math.hypot(dx, dy) or 1
    worst, idx = 0.0, 0
    for i in range(1, len(pts)-1):
        px, py = pts[i]
        d = abs(dy*px - dx*py + x2*y1 - y2*x1) / n
        if d > worst: worst, idx = d, i
    if worst > eps:
        return rdp(pts[:idx+1], eps)[:-1] + rdp(pts[idx:], eps)
    return [pts[0], pts[-1]]

def bleed(pts, w, h, amount=0.09):
    """Push boundary points that sit on the frame outward so the field always
    bleeds past the viewport, whatever the crop."""
    bx, by = w*amount, h*amount
    out = []
    for x, y in pts:
        if x <= 1: x -= bx
        elif x >= w-2: x += bx
        if y <= 1: y -= by
        elif y >= h-2: y += by
        out.append((x, y))
    return out

def smooth_path(pts, sx, sy, tension=0.52, places=1):
    """closed catmull-rom -> cubic bezier"""
    p = [(x*sx, y*sy) for x, y in pts]
    n = len(p)
    f = lambda v: f"{round(v, places):g}"
    d = [f"M{f(p[0][0])} {f(p[0][1])}"]
    for i in range(n):
        p0 = p[(i-1) % n]; p1 = p[i]; p2 = p[(i+1) % n]; p3 = p[(i+2) % n]
        c1 = (p1[0] + (p2[0]-p0[0])*tension/3, p1[1] + (p2[1]-p0[1])*tension/3)
        c2 = (p2[0] - (p3[0]-p1[0])*tension/3, p2[1] - (p3[1]-p1[1])*tension/3)
        d.append(f"C{f(c1[0])} {f(c1[1])} {f(c2[0])} {f(c2[1])} {f(p2[0])} {f(p2[1])}")
    return "".join(d) + "Z"

def shapes(name, crop=None, work=460, thr=110, eps=4.2, min_area=0.012, vb=(1600, 900), keep=6):
    im = Image.open(SRC / name).convert("RGB")
    if crop: im = im.crop(crop)
    grid, w, h = binarise(im, work, thr)
    grid = fill_holes(grid, w, h)
    sx, sy = vb[0]/w, vb[1]/h
    out = []
    for comp in sorted(components(grid, w, h, 1), key=lambda c: -len(c["cells"])):
        if len(comp["cells"]) < min_area*w*h: continue
        mask = [[0]*w for _ in range(h)]
        for x, y in comp["cells"]: mask[y][x] = 1
        start = min(comp["cells"], key=lambda c: (c[1], c[0]))
        pts = bleed(rdp_closed(trace(mask, w, h, start), eps), w, h)
        if len(pts) < 6: continue
        out.append({"area": round(len(comp["cells"])/(w*h), 4), "n": len(pts),
                    "d": smooth_path(pts, sx, sy)})
        if len(out) >= keep: break
    return {"viewBox": f"0 0 {vb[0]} {vb[1]}", "source": name, "shapes": out}

res = {
  "desktop": shapes("desktop.png", vb=(1600, 900)),
  "nav":     shapes("full-screen nav.png", vb=(1600, 900)),
  "mobile":  shapes("mobile mockup.png", crop=(172, 62, 852, 1478), work=340,
                    eps=5.2, vb=(390, 800), min_area=0.010),
}
(ROOT / "design" / "shapes.json").write_text(json.dumps(res, indent=1))
for k, v in res.items():
    print(k, "->", [(s["area"], s["n"], len(s["d"])) for s in v["shapes"]])
