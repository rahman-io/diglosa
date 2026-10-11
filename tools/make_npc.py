"""Mengubah lembar pose tokoh dari AI (4 pose berjajar di latar magenta rata) menjadi berkas sprite game.
Pakai:  python3 tools/make_npc.py <lembar.png> <nama> <x0,y0,x1,y1>
  lembar.png  empat pose berjajar kiri ke kanan: diam (idle), kedip (mata tertutup), minta tolong (help), senang (happy)
  nama        nama berkas, mis. kakek  ->  src/npc/kakek-idle.webp, kakek-help.webp, kakek-happy.webp, kakek-blink.webp, kakek-head.webp, kakek.json
  x0,y0,x1,y1 kotak mata pada pose diam, dalam piksel kanvas penuh (--info menyimpan gambar kanvasnya untuk diukur); hanya kotak ini yang dipakai untuk kedipan
  opsional: body=80 (tinggi badan di dunia game, bawaan 86), call=8 (detik antar panggilan minta tolong, bawaan 11), done=9 (detik antar pose senang), hop=1.4 (pengali tinggi lompatan)
Langkah: buang latar magenta (matte lembut + buang sisa merah muda di tepi), pisahkan pose, samakan garis tanah dan sepatu kiri (titik pijak),
pakai satu kanvas untuk semua pose, kecilkan, simpan WebP. Kedipan hanya tambalan kecil di sekitar mata (seperti kedipan Hoot), bukan gambar penuh."""
import sys, os, json
import numpy as np
from PIL import Image, ImageFilter

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'src', 'npc')
NAMES = ['idle', 'blink', 'help', 'happy']
SCALE = 0.5          # ukuran akhir terhadap gambar asli
BODY_UNITS = 86      # tinggi badan (topi sampai sepatu, pose diam) dalam satuan dunia game

def key(path):
    """Buang latar rata. Piksel dekat latar (cincin 5 px di tepi tokoh) dipisahkan dengan memproyeksikan warnanya ke garis latar-tokoh, memakai warna tokoh terdekat dari bagian dalam sebagai acuan; hasilnya tepi tanpa lingkaran merah muda, juga pada bulu oranye."""
    from scipy import ndimage as ndi
    im = np.array(Image.open(path).convert('RGB')).astype(np.float32)
    border = np.concatenate([im[:6].reshape(-1, 3), im[-6:].reshape(-1, 3), im[:, :6].reshape(-1, 3), im[:, -6:].reshape(-1, 3)])
    BG = np.median(border, axis=0)
    bgm = np.sqrt(((im - BG) ** 2).sum(-1)) < 70                 # pasti latar
    bgm = ndi.binary_opening(bgm, iterations=1) | (bgm & ~ndi.binary_dilation(~bgm, iterations=2))   # buang bintik latar palsu di dalam tokoh
    zone_out = ndi.binary_dilation(bgm, iterations=5)
    solid = ~zone_out                                             # pasti tokoh (bagian dalam)
    idx = ndi.distance_transform_edt(~solid, return_distances=False, return_indices=True)
    Fn = im[idx[0], idx[1]]                                       # warna tokoh terdekat dari dalam
    v = Fn - BG; a = np.clip(((im - BG) * v).sum(-1) / ((v * v).sum(-1) + 1e-6), 0, 1)
    alpha = np.where(solid, 1.0, np.where(bgm, 0.0, a))
    color = np.where(solid[..., None], im, Fn)
    edge = ndi.binary_dilation(alpha < 0.5, iterations=9)                 # dekat tepi: buang sisa magenta (biru lebih tinggi dari hijau tidak ada pada bulu, kulit, kain, kulit sepatu)
    spill = edge & (color[..., 2] > color[..., 1]) & (color[..., 0] > color[..., 1])
    color[..., 2] = np.where(spill, np.minimum(color[..., 2], color[..., 1]), color[..., 2])
    color[..., 0] = np.where(spill, np.minimum(color[..., 0], color[..., 1] + (color[..., 0] - color[..., 1]) * 0.5 + 0), color[..., 0])
    return np.dstack([np.clip(color, 0, 255), alpha * 255]).astype(np.uint8)

def split(rgba):
    m = rgba[..., 3] > 128
    cols = np.where(m.any(0))[0]; runs = []; s = p = cols[0]
    for c in cols[1:]:
        if c - p > 3: runs.append((s, p)); s = c
        p = c
    runs.append((s, p))
    return runs

def build(sheet, name, eyes, info=False, opts=None):
    opts = opts or {}; body_units = float(opts.get('body', BODY_UNITS))
    rgba = key(sheet); runs = split(rgba)
    assert len(runs) == 4, 'butuh tepat 4 pose terpisah, ditemukan %d: %s' % (len(runs), runs)
    subs, meta = [], []
    for x0, x1 in runs:
        xs = max(0, x0 - 6); s = rgba[:, xs:x1 + 7].copy(); m = s[..., 3] > 128
        ys = np.where(m.any(1))[0]; bot = ys.max()
        band = m[bot - 40:bot + 1].any(0); cols = np.where(band)[0]; run = [cols[0]]
        for c in cols[1:]:
            if c - run[-1] > 6: break
            run.append(c)
        subs.append(s); meta.append((bot, (run[0] + run[-1]) / 2))
    BY = max(b for b, _ in meta)
    pos = {n: [-bx, BY - bot] for n, (bot, bx) in zip(NAMES, meta)}
    mi, mb = subs[0][..., 3] > 128, subs[1][..., 3] > 128; best = (0, 0, 0)       # kedip: rapatkan ke pose diam
    for dx in range(-14, 15):
        for dy in range(-6, 7):
            a = np.roll(np.roll(mb, dx, 1), dy, 0); w = min(mi.shape[1], a.shape[1])
            iou = (mi[:, :w] & a[:, :w]).sum() / ((mi[:, :w] | a[:, :w]).sum() + 1)
            if iou > best[0]: best = (iou, dx, dy)
    pos['blink'] = [pos['idle'][0] - best[1], pos['idle'][1] - best[2]]
    L = min(pos[n][0] for n in NAMES); R = max(pos[n][0] + subs[i].shape[1] for i, n in enumerate(NAMES))
    Wc, Hc = int(np.ceil(R - L)), int(BY + 4)
    fr = {}
    for i, n in enumerate(NAMES):
        c = np.zeros((Hc, Wc, 4), np.uint8); s = subs[i]; ox = int(round(pos[n][0] - L)); oy = int(round(pos[n][1]))
        y0, y1, x0, x1 = max(0, oy), min(Hc, oy + s.shape[0]), max(0, ox), min(Wc, ox + s.shape[1])
        c[y0:y1, x0:x1] = s[y0 - oy:y1 - oy, x0 - ox:x1 - ox]; fr[n] = c
    ax = -L
    allm = np.zeros((Hc, Wc), bool)
    for n in NAMES: allm |= fr[n][..., 3] > 128
    ys, xs = np.where(allm); cx0, cx1, cy0, cy1 = max(0, xs.min() - 3), min(Wc, xs.max() + 4), max(0, ys.min() - 3), min(Hc, ys.max() + 4)     # satu kotak potong untuk semua pose
    idle_m = fr['idle'][..., 3] > 128; iy = np.where(idle_m.any(1))[0]; body_h = iy.max() - iy.min() + 1
    if info:
        print('kanvas penuh %dx%d, potong x %d..%d y %d..%d, tinggi badan pose diam %d, titik pijak x=%.1f, garis tanah y=%d' % (Wc, Hc, cx0, cx1, cy0, cy1, body_h, ax, BY))
        print('kotak kepala pose diam (kasar): y %d..%d' % (iy.min(), iy.min() + 260))
        for n in ('idle', 'blink'): Image.fromarray(fr[n]).save(os.path.join(os.environ.get('TMPDIR', '/tmp'), '%s-%s-canvas.png' % (name, n)))
        print('kanvas pose diam dan kedip disimpan di %s/ (%s-idle-canvas.png): ukur kotak mata dari gambar itu' % (os.environ.get('TMPDIR', '/tmp'), name)); return
    os.makedirs(OUT, exist_ok=True)
    sc = SCALE; out = {}
    def save(arr, fn, q=84):
        im = Image.fromarray(arr)
        if sc != 1: im = im.resize((max(1, round(im.width * sc)), max(1, round(im.height * sc))), Image.LANCZOS)
        im.save(os.path.join(OUT, fn), 'WEBP', quality=q, method=6); return im.size
    crop = lambda a: a[cy0:cy1, cx0:cx1]
    for n in ['idle', 'help', 'happy']: sz = save(crop(fr[n]), '%s-%s.webp' % (name, n))
    # kedip: tambalan kotak mata dari pose kedip, digeser agar kulit sekitar mata cocok dengan pose diam, tepi dilembutkan
    ex0, ey0, ex1, ey1 = eyes
    a = fr['idle'][..., :3].astype(np.float32).mean(-1); b = fr['blink'][..., :3].astype(np.float32).mean(-1)
    rx0, ry0, rx1, ry1 = ex0 - 40, ey0 - 25, ex1 + 40, ey1 + 40; ref = np.ones((ry1 - ry0, rx1 - rx0), bool)
    ref[ey0 - ry0 - 6:ey1 - ry0 + 6, ex0 - rx0 - 6:ex1 - rx0 + 6] = False        # abaikan mata sendiri saat mencocokkan kulit
    bs = (1e18, 0, 0)
    for dy in range(-10, 11):
        for dx in range(-10, 11):
            blk = b[ry0 + dy:ry1 + dy, rx0 + dx:rx1 + dx]; d = ((a[ry0:ry1, rx0:rx1] - blk) ** 2)[ref].mean()
            if d < bs[0]: bs = (d, dx, dy)
    dx, dy = bs[1], bs[2]
    patch = fr['blink'][ey0 + dy:ey1 + dy, ex0 + dx:ex1 + dx].copy()
    h, w = patch.shape[:2]; mk = np.zeros((h, w), np.float32); f = 6
    mk[f:h - f, f:w - f] = 1; mk = np.array(Image.fromarray((mk * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(f / 2.2))).astype(np.float32) / 255
    patch[..., 3] = (patch[..., 3].astype(np.float32) * mk).astype(np.uint8)
    pw, ph = save(patch, '%s-blink.webp' % name, 88)
    # kepala untuk kotak dialog: bagian atas pose diam, persegi
    hy0 = iy.min(); hh = int(body_h * 0.50); cxh = (fr['idle'][..., 3] > 128)[hy0:hy0 + hh].any(0); hx = np.where(cxh)[0]
    hcx = (hx.min() + hx.max()) // 2; side = max(hh, hx.max() - hx.min() + 1); side = int(side * 1.0)
    hx0 = max(0, hcx - side // 2); head = fr['idle'][hy0:hy0 + side, hx0:hx0 + side]
    Image.fromarray(head).resize((128, 128), Image.LANCZOS).save(os.path.join(OUT, '%s-head.webp' % name), 'WEBP', quality=86, method=6)
    u = body_units / (body_h * sc)                                                # satuan dunia per piksel akhir
    meta = {'w': round(float(sz[0] * u), 2), 'h': round(float(sz[1] * u), 2), 'ax': round(float((ax - cx0) * sc * u), 2), 'gy': round(float((BY - cy0) * sc * u), 2), 'body': round(body_units),
            'blink': {'x': round(float((ex0 + dx - cx0) * sc * u), 2), 'y': round(float((ey0 + dy - cy0) * sc * u), 2), 'w': round(float(pw * u), 2), 'h': round(float(ph * u), 2)}}
    for k in ('call', 'done', 'hop'):          # watak gerak (opsional): detik antar panggilan, detik antar pose senang, pengali tinggi lompatan
        if k in opts: meta[k] = float(opts[k])
    json.dump(meta, open(os.path.join(OUT, name + '.json'), 'w'), indent=1)
    print('selesai', name, meta, 'geser kulit', (dx, dy))

if __name__ == '__main__':
    a = sys.argv[1:]
    kv = dict(x.split('=', 1) for x in a if '=' in x and not x.startswith('-')); a = [x for x in a if '=' not in x or x.startswith('-')]
    if len(a) >= 2 and a[-1] == '--info': build(a[0], a[1], (0, 0, 0, 0), True, kv)
    else: build(a[0], a[1], tuple(int(v) for v in a[2].split(',')), False, kv)
