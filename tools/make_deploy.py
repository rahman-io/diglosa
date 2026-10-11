"""Membuat berkas siap-unggah (GitHub Pages) dari hasil bangunan game.
Pakai: python3 tools/make_deploy.py [dist/diglosa.html] [folder-keluaran] [kode-goatcounter]
Hasil: index.html (nama IELTS diganti nama netral, ditandai tidak diindeks, kode statistik GoatCounter, huruf lokal, tag aplikasi),
robots.txt, .nojekyll, serta berkas untuk main tanpa internet: fonts/, manifest.webmanifest, sw.js, icon-*.png dan precache.json."""
import sys, os, re, glob, json, hashlib, shutil
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); SRC = os.path.join(BASE, 'src')
src = sys.argv[1] if len(sys.argv) > 1 else 'dist/diglosa.html'
out = sys.argv[2] if len(sys.argv) > 2 else 'deploy'
gc = sys.argv[3] if len(sys.argv) > 3 else 'diglosa'
h = open(src, encoding='utf-8').read()
RULES = [
 ("Persiapan IELTS A1", "Persiapan Ujian A1"),
 ("showIELTS", "showExam"),   # nama fungsi di dalam kode
 ("This purple portal leads to the IELTS Castle.", "This purple portal leads to the Exam Castle."),
 ("Welcome to the IELTS Academy, traveler!", "Welcome to the Exam Academy, traveler!"),
 ("Istana IELTS", "Istana Ujian"), ("Akademi IELTS", "Akademi Ujian"), ("Info IELTS", "Info Ujian"),
 ("bergaya IELTS", "bergaya ujian internasional"), ("ke band IELTS", "ke skor ujian resmi"), ("dari IELTS asli", "dari ujian resmi"),
 ("my IELTS Writing practice", "my English writing practice"), ("Use the 4 IELTS criteria", "Use these 4 criteria"),
 ("<h2>Apa itu IELTS?</h2>", "<h2>Apa itu ujian bahasa Inggris internasional?</h2>"),
 ("<p>IELTS adalah singkatan dari <b>International English Language Testing System</b>, yaitu sistem pengujian bahasa Inggris internasional untuk kamu yang berencana kuliah, bekerja, atau menetap di luar negeri. Tes ini dikenal berbasis <b>British English</b> dan berasal dari Cambridge (Inggris) dan Australia.</p>",
  "<p>Ini adalah ujian kemampuan bahasa Inggris yang diakui secara internasional untuk kamu yang berencana kuliah, bekerja, atau menetap di luar negeri. Tes ini dikenal berbasis <b>British English</b>.</p>"),
 ("Menurut ielts.org yang dikutip artikel, sekitar 3 juta orang mendaftar setiap tahun. Sertifikat resmi dikeluarkan oleh <b>British Council</b>, <b>Cambridge Assessment English</b>, dan <b>IDP</b>.",
  "Sertifikat resmi dikeluarkan oleh lembaga penyelenggara ujian, bukan oleh game ini. Game ini bukan ujian resmi dan tidak berafiliasi dengan penyelenggara ujian mana pun."),
 ("Sepengetahuan saya, format resmi IELTS Reading adalah 40 soal dalam 60 menit. Cek ielts.org untuk memastikan.", "Sepengetahuan saya, format resmi Reading adalah 40 soal dalam 60 menit. Cek situs penyelenggara ujian untuk memastikan."),
]
for a, b in RULES:
    assert a in h, 'aturan tidak cocok: ' + a[:60]
    h = h.replace(a, b)
assert 'IELTS' not in h, 'masih ada IELTS: ' + h[h.index('IELTS') - 60:h.index('IELTS') + 60]
assert 'ielts.org' not in h
VP = re.search(r'<meta name="viewport"[^>]*>', h); assert VP
h = h.replace(VP.group(0), VP.group(0) + '\n<meta name="robots" content="noindex, nofollow">', 1)
GC = '<script data-goatcounter="https://%s.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>\n' % gc
assert h.count('</body>') == 1
h = h.replace('</body>', GC + '</body>')
# huruf: dari berkas lokal (fonts/), bukan Google Fonts
h, nf = re.subn(r'<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\n?', '', h); assert nf == 3, 'tautan huruf Google tidak ditemukan: %d' % nf
assert 'fonts.googleapis.com' not in h and 'fonts.gstatic.com' not in h.replace('//gc.zgo.at', '')
FAM = {'nunito': 'Nunito', 'cinzel': 'Cinzel', 'fredoka': 'Fredoka', 'lilita-one': 'Lilita One'}
fonts = sorted(glob.glob(os.path.join(SRC, 'fonts', '*.woff2'))); assert len(fonts) >= 10
css = ''
for f in fonts:
    m = re.match(r'(.+)-latin-(\d+)-normal\.woff2$', os.path.basename(f)); assert m and m.group(1) in FAM, f
    css += "@font-face{font-family:'%s';font-style:normal;font-weight:%s;font-display:swap;src:url(%s) format('woff2')}\n" % (FAM[m.group(1)], m.group(2), os.path.basename(f))
# berkas yang diunduh pemain saat memilih "Pasang di HP"
PWA_FILES = ['manifest.webmanifest', 'sw.js', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png']
for n in PWA_FILES: assert os.path.exists(os.path.join(SRC, 'pwa', n)), n
build = hashlib.sha1(h.encode('utf-8')).hexdigest()[:10]
extra = [('manifest.webmanifest', os.path.join(SRC, 'pwa', 'manifest.webmanifest'))] + [(n, os.path.join(SRC, 'pwa', n)) for n in PWA_FILES if n.startswith('icon-')] + [('fonts/fonts.css', None)] + [('fonts/' + os.path.basename(f), f) for f in fonts]
size = lambda path, data=None: len(data) if data is not None else os.path.getsize(path)
html_bytes = len(h.encode('utf-8')) + 400
mb = (html_bytes + sum(size(p, css.encode() if n == 'fonts/fonts.css' else None) for n, p in extra if not n.startswith('icon-'))) / 1048576
VP2 = re.search(r'<meta name="viewport"[^>]*>', h)
h = h.replace(VP2.group(0), VP2.group(0) + '\n<meta name="dg-pwa" content="%s" data-mb="%.1f">\n<link rel="manifest" href="manifest.webmanifest">\n<link rel="apple-touch-icon" href="icon-180.png">\n<link rel="stylesheet" href="fonts/fonts.css">' % (build, mb), 1)
os.makedirs(os.path.join(out, 'fonts'), exist_ok=True)
open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write(h)
open(os.path.join(out, 'fonts', 'fonts.css'), 'w', encoding='utf-8').write(css)
for n, p in extra:
    if p: shutil.copyfile(p, os.path.join(out, n))
shutil.copyfile(os.path.join(SRC, 'pwa', 'sw.js'), os.path.join(out, 'sw.js'))
fh = lambda n: hashlib.sha1(open(os.path.join(out, n), 'rb').read()).hexdigest()[:10]   # sidik tiap berkas: pembaruan hanya mengunduh yang berubah
files = [{'u': n, 's': os.path.getsize(os.path.join(out, n)), 'h': fh(n)} for n in ['index.html'] + [n for n, _ in extra if not n.startswith('icon-')]]   # ikon dilayani langsung dari server (Android memperbaruinya sendiri), tidak perlu disimpan
json.dump({'v': build, 'files': files}, open(os.path.join(out, 'precache.json'), 'w'), indent=1)
open(os.path.join(out, 'robots.txt'), 'w').write('User-agent: *\nDisallow: /\n')
open(os.path.join(out, '.nojekyll'), 'w').write('')
left = sorted(set(re.findall(r'[A-Za-z_.\'"-]{0,12}ielts[A-Za-z_.\'"-]{0,12}', h)))
print('index.html dibuat (%d KB, versi %s, unduhan offline sekitar %.1f MB). Sisa "ielts" huruf kecil (hanya penamaan di dalam kode): %s' % (len(h.encode('utf-8')) // 1024, build, mb, left))
