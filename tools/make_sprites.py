"""Membangun src/hero-shoot.webp (6 pose menembak) dan src/weapons.webp (7 blaster + baterai energi)
dari dua gambar sumber AI di art_source/. Latar magenta dihapus, tiap benda dipotong dan diskalakan ke
ukuran game (4 px per satuan dunia). Jalankan: python3 tools/make_sprites.py  (butuh Pillow dan numpy)."""
import os, numpy as np
from PIL import Image
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def key(path):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]
    alpha = np.clip((np.sqrt((r - 255) ** 2 + g ** 2 + (b - 255) ** 2) - 70) / 80, 0, 1)
    m = np.minimum(r, b) - g; spill = (m > 25) & (alpha > 0)
    return Image.fromarray(np.dstack([np.clip(np.where(spill, r - m * .85, r), 0, 255), g, np.clip(np.where(spill, b - m * .85, b), 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
def bbox(c):
    ys, xs = np.where(np.asarray(c)[..., 3] > 40); return int(xs.min()), int(ys.min()), int(xs.max() + 1), int(ys.max() + 1)
# --- 6 pose menembak: 3 kolom (lurus, atas, bawah) x 2 baris (membidik, hentakan), kotak sumber 512 x 512 ---
full = key(os.path.join(BASE, 'art_source', 'pose-menembak-ai.png')); F = 360 / 486.0; CWo, CHo, AX = 340, 368, 150; cells = []
for row in range(2):
    for col in range(3):
        c = full.crop((col * 512, row * 512, col * 512 + 512, row * 512 + 512)); x0, y0, x1, y1 = bbox(c); h = y1 - y0
        al = np.asarray(c)[..., 3] > 40; anchor = float(np.where(al[int(y1 - .12 * h):y1, :])[1].mean())   # titik tengah kedua sepatu
        fig = c.crop((x0, y0, x1, y1)).resize((round((x1 - x0) * F), round((y1 - y0) * F)), Image.LANCZOS)
        cell = Image.new('RGBA', (CWo, CHo), (0, 0, 0, 0)); cell.alpha_composite(fig, (int(round(AX - (anchor - x0) * F)), CHo - 4 - fig.height)); cells.append(cell)
sheet = Image.new('RGBA', (CWo * 6, CHo), (0, 0, 0, 0))
for i, c in enumerate(cells): sheet.alpha_composite(c, (i * CWo, 0))
sheet.save(os.path.join(BASE, 'src', 'hero-shoot.webp'), 'WEBP', quality=82, alpha_quality=90, method=6)
# --- 7 blaster + baterai: 4 kolom x 2 baris, kotak sumber 384 x 512, skala 0,4 ---
full = key(os.path.join(BASE, 'art_source', 'senjata-ai.png')); S = 0.4; CW, CH = 384, 512; WW, WH = 160, 136; out = []
for i in range(8):
    rr, cc = divmod(i, 4); c = full.crop((cc * CW, rr * CH, cc * CW + CW, rr * CH + CH)); x0, y0, x1, y1 = bbox(c)
    it = c.crop((x0, y0, x1, y1)).resize((round((x1 - x0) * S), round((y1 - y0) * S)), Image.LANCZOS)
    cell = Image.new('RGBA', (WW, WH), (0, 0, 0, 0)); cell.alpha_composite(it, (6, 6)); out.append(cell)
sheet = Image.new('RGBA', (WW * 4, WH * 2), (0, 0, 0, 0))
for i, c in enumerate(out): sheet.alpha_composite(c, ((i % 4) * WW, (i // 4) * WH))
sheet.save(os.path.join(BASE, 'src', 'weapons.webp'), 'WEBP', quality=88, alpha_quality=92, method=6)
print('hero-shoot.webp dan weapons.webp dibuat. Titik genggam senjata ada di WCELL.grips dan HERO_GRIP pada src/template.html.')
