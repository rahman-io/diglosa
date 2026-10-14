"""Extract the generated forest UI icon sheet into small transparent WebP assets."""
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "art_source" / "forest-ui-icons-v1.png"
OUT = ROOT / "src" / "ui" / "forest"

# The image generator keeps a regular 4x4 layout, but its final canvas is not
# always exactly square. Derive tile edges from the actual output dimensions.
NAMES = [
    "talk", "portal", "target", "bag",
    "message", "quest", "map", "settings",
    "village", "market", "forest", "city",
    "clock", "cave", "castle", "exit",
]


def main() -> None:
    im = Image.open(SHEET).convert("RGBA")
    w, h = im.size
    OUT.mkdir(parents=True, exist_ok=True)
    for idx, name in enumerate(NAMES):
        col, row = idx % 4, idx // 4
        x0, x1 = round(w * col / 4), round(w * (col + 1) / 4)
        y0, y1 = round(h * row / 4), round(h * (row + 1) / 4)
        tile = im.crop((x0, y0, x1, y1))
        alpha = tile.getchannel("A")
        bbox = alpha.getbbox()
        if bbox:
            tile = tile.crop(bbox)
        tile.thumbnail((112, 112), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        px = (128 - tile.width) // 2
        py = (128 - tile.height) // 2
        canvas.alpha_composite(tile, (px, py))
        canvas.save(OUT / f"{name}.webp", "WEBP", lossless=True, method=6)
    print(f"Extracted {len(NAMES)} icons to {OUT}")


if __name__ == "__main__":
    main()
