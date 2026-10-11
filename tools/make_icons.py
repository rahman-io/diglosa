"""Membuat ikon aplikasi (src/pwa/icon-*.png) dari lukisan halaman depan dan kepala pemain.
Pakai: python3 tools/make_icons.py   (perlu Pillow)"""
import os
from PIL import Image, ImageDraw, ImageFilter
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(BASE, 'src'); OUT = os.path.join(S, 'pwa'); os.makedirs(OUT, exist_ok=True)

def art(size, safe):
    """safe = bagian tengah yang aman dari pemotongan (1.0 = seluruh gambar; 0.8 = ikon 'maskable')."""
    bg = Image.open(os.path.join(S, 'title-bg.webp')).convert('RGB')
    w, h = bg.size; side = min(w, h)
    # potongan persegi di tengah-kanan: kastil dan matahari terbenam
    x0 = int(w * .40); box = (x0 - side // 4, 0, x0 - side // 4 + side, side)
    box = (max(0, box[0]), 0, max(0, box[0]) + side, side)
    im = bg.crop(box).resize((size, size), Image.LANCZOS)
    head = Image.open(os.path.join(S, 'hero-head.webp')).convert('RGBA')
    hs = int(size * .56 * safe); head = head.resize((hs, hs), Image.LANCZOS)
    ring = int(hs * 1.16); cx, cy = size // 2, int(size * .58)
    sh = Image.new('RGBA', (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    d.ellipse((cx - ring // 2, cy - ring // 2 + int(size * .018), cx + ring // 2, cy + ring // 2 + int(size * .018)), fill=(40, 20, 6, 150))
    sh = sh.filter(ImageFilter.GaussianBlur(size * .015)); im = Image.alpha_composite(im.convert('RGBA'), sh)
    d = ImageDraw.Draw(im)
    d.ellipse((cx - ring // 2, cy - ring // 2, cx + ring // 2, cy + ring // 2), fill=(255, 241, 208, 255), outline=(138, 75, 28, 255), width=max(3, size // 60))
    inner = ring - 2 * max(3, size // 60)   # kepala dipotong mengikuti lingkaran supaya tepi bawahnya rapi
    m = Image.new('L', (size, size), 0); ImageDraw.Draw(m).ellipse((cx - inner // 2, cy - inner // 2, cx + inner // 2, cy + inner // 2), fill=255)
    lay = Image.new('RGBA', (size, size), (0, 0, 0, 0)); lay.alpha_composite(head, (cx - hs // 2, cy - hs // 2)); lay.putalpha(Image.composite(lay.getchannel('A'), Image.new('L', (size, size), 0), m))
    im.alpha_composite(lay)
    return im.convert('RGB')

for n, size, safe in (('icon-512.png', 512, 1.0), ('icon-192.png', 192, 1.0), ('icon-180.png', 180, 1.0), ('icon-maskable-512.png', 512, .8)):
    art(size, safe).quantize(colors=192, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG).save(os.path.join(OUT, n), optimize=True)
print('ikon dibuat di', OUT)
