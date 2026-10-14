"""Extract the generated common UI icon sheet into transparent WebP assets."""
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "art_source" / "common-ui-icons-v1.png"
OUT = ROOT / "src" / "ui" / "common"

NAMES = ["lock", "crown", "speaker", "home", "worried", "happy", "bulb", "book"]


def main() -> None:
    im = Image.open(SHEET).convert("RGBA")
    w, h = im.size
    OUT.mkdir(parents=True, exist_ok=True)
    for idx, name in enumerate(NAMES):
        col, row = idx % 4, idx // 4
        x0, x1 = round(w * col / 4), round(w * (col + 1) / 4)
        y0, y1 = round(h * row / 2), round(h * (row + 1) / 2)
        tile = im.crop((x0, y0, x1, y1))
        bbox = tile.getchannel("A").getbbox()
        if bbox:
            tile = tile.crop(bbox)
        tile.thumbnail((112, 112), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        canvas.alpha_composite(tile, ((128 - tile.width) // 2, (128 - tile.height) // 2))
        canvas.save(OUT / f"{name}.webp", "WEBP", lossless=True, method=6)
    print(f"Extracted {len(NAMES)} icons to {OUT}")


if __name__ == "__main__":
    main()
