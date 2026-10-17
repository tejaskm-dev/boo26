"""Cut the ghost sticker sheet into six sprites by connected shapes.
usage: python3 -I scripts/cut-ghosts.py "design/Cute Neon Ghost Sticker Pack.png" <outdir>

Each ghost and the marks round it (the "!"s, the steam, the flash) are
found as connected shapes and given to the nearest ghost, edge to edge: the
sheet's rows and columns aren't cleanly separable (tails and steam cross the
gaps). Writes PNGs; the site's WebPs are saved from them at quality 88, and
the sprite map (src/lib/sprites.ts) gives them half their pixel size, as
for every sprite (files ship at 2x)."""
import sys
from collections import deque
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGBA")
W, H = im.size
alpha = im.split()[3].tobytes()
mask = bytearray(1 if a > 16 else 0 for a in alpha)
label = [0] * (W * H)
comps = []  # (size, x0, y0, x1, y1, id)
cid = 0
for start in range(W * H):
    if not mask[start] or label[start]:
        continue
    cid += 1
    q = deque([start])
    label[start] = cid
    n = 0
    x0, y0, x1, y1 = W, H, 0, 0
    while q:
        p = q.popleft()
        n += 1
        x, y = p % W, p // W
        if x < x0: x0 = x
        if x > x1: x1 = x
        if y < y0: y0 = y
        if y > y1: y1 = y
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < W and 0 <= ny < H:
                np_ = ny * W + nx
                if mask[np_] and not label[np_]:
                    label[np_] = cid
                    q.append(np_)
    comps.append((n, x0, y0, x1, y1, cid))

comps.sort(reverse=True)
bodies = comps[:6]
print("largest", [(c[0], c[1:5]) for c in comps[:10]])
# order the bodies: top row left to right, then bottom row
bodies.sort(key=lambda c: (0 if (c[2] + c[4]) / 2 < H / 2 else 1, (c[1] + c[3]) / 2))
owner = {}
for i, b in enumerate(bodies):
    owner[b[5]] = i
centre = [((b[1] + b[3]) / 2, (b[2] + b[4]) / 2) for b in bodies]
for c in comps[6:]:
    if c[0] < 12:
        continue  # specks
    cx, cy = (c[1] + c[3]) / 2, (c[2] + c[4]) / 2
    # the body whose box is nearest, edge to edge (a mark beside a ghost, or overlapping its box)
    def gap(b):
        dx = max(b[1] - c[3], c[1] - b[3], 0)
        dy = max(b[2] - c[4], c[2] - b[4], 0)
        return dx * dx + dy * dy
    best = min((gap(b), i) for i, b in enumerate(bodies))
    owner[c[5]] = best[1]

names = ["ghost-wave", "ghost-headset", "ghost-camera", "ghost-megaphone", "ghost-snacks", "ghost-torch"]
rgba = im.load()
for i, name in enumerate(names):
    ids = {k for k, v in owner.items() if v == i}
    x0, y0, x1, y1 = W, H, 0, 0
    for c in comps:
        if c[5] in ids:
            x0, y0, x1, y1 = min(x0, c[1]), min(y0, c[2]), max(x1, c[3]), max(y1, c[4])
    pad = 6
    x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W - 1, x1 + pad), min(H - 1, y1 + pad)
    piece = Image.new("RGBA", (x1 - x0 + 1, y1 - y0 + 1), (0, 0, 0, 0))
    pp = piece.load()
    for y in range(y0, y1 + 1):
        row = y * W
        for x in range(x0, x1 + 1):
            l = label[row + x]
            # its own shapes, and the faint antialiased edge round them
            if (l and owner.get(l) == i) or (not l and alpha[row + x] > 0 and any(
                owner.get(label[(y + dy) * W + (x + dx)]) == i
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))
                if 0 <= x + dx < W and 0 <= y + dy < H)):
                pp[x - x0, y - y0] = rgba[x, y]
    piece.save(f"{out}/{name}.png")
    print(name, piece.size)
