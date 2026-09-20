#!/usr/bin/env python3
"""
Derives optimised web assets from the supplied source art in design/refs/.
Sources are never modified. Run: python3 scripts/build-assets.py
"""
from PIL import Image
import subprocess, shutil, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC  = ROOT / "design" / "refs"
OUT  = ROOT / "public" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

OFFWHITE = (243, 240, 231)

def trim(im: Image.Image, threshold: int = 8) -> tuple[Image.Image, tuple[int, int, int, int]]:
    box = im.getchannel("A").point(lambda v: 255 if v > threshold else 0).getbbox()
    return im.crop(box), box

def save(im: Image.Image, name: str, quality: int = 92) -> None:
    png = OUT / f"{name}.png"
    im.save(png)
    webp = OUT / f"{name}.webp"
    if shutil.which("cwebp"):
        subprocess.run(["cwebp", "-quiet", "-q", str(quality), "-alpha_q", "100",
                        str(png), "-o", str(webp)], check=True)
    else:
        im.save(webp, quality=quality, method=6)
    png.unlink()
    print(f"  {webp.name:24} {im.size[0]}x{im.size[1]}  {webp.stat().st_size/1024:6.1f} kB")

def recolour(im: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    out = Image.new("RGBA", im.size, (*rgb, 255))
    out.putalpha(im.getchannel("A"))
    return out

def main() -> None:
    if not SRC.exists():
        sys.exit(f"missing source folder: {SRC}")

    print("building assets…")
    lockup, box = trim(Image.open(SRC / "center logo.png").convert("RGBA"))
    print(f"  center logo trimmed from {box}")
    save(lockup, "boo-lockup")

    cat, box = trim(Image.open(SRC / "cat peeking.png").convert("RGBA"))
    print(f"  cat peeking trimmed from {box}")
    save(cat, "cat")

    mark, box = trim(Image.open(SRC / "header-logo.png").convert("RGBA"))
    print(f"  header logo trimmed from {box}")
    save(mark, "wordmark")
    save(recolour(mark, OFFWHITE), "wordmark-light")

main()
