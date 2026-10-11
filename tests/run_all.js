// Menjalankan semua uji berurutan. Jalankan: npm ci && python3 ../build.py && npm test
// Uji yang gagal diulang satu kali: sebagian uji berjalan dalam waktu nyata dan kadang goyah di mesin yang lebih lambat.
// Uji yang lolos pada percobaan kedua ditandai di keluaran; uji yang gagal dua kali menggagalkan seluruh proses.
const { spawnSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const files = fs.readdirSync(__dirname).filter(f => /^\d\d_.*\.js$/.test(f)).sort();
const run = f => {
  const r = spawnSync('node', [path.join(__dirname, f)], { encoding: 'utf8' });
  const out = (r.stdout + r.stderr).split('\n').filter(l => !/wc1 ok/.test(l)).join('\n').trim().split('\n').slice(-6).join(' | ');
  const ok = r.status === 0 && !/FAIL|EXC|Error/.test(r.stdout + r.stderr.replace(/ExperimentalWarning.*/g, ''));
  return { ok, out };
};
let fail = 0;
for (const f of files) {
  let a = run(f), note = '';
  if (!a.ok) {
    const b = run(f);
    if (b.ok) { note = '  [lolos pada percobaan ulang; percobaan pertama: ' + a.out.slice(0, 160) + ']'; a = b; }
    else a = { ok: false, out: 'percobaan 1: ' + a.out.slice(0, 190) + ' || percobaan 2: ' + b.out.slice(0, 190) };
  }
  if (!a.ok) fail++;
  console.log((a.ok ? 'OK    ' : 'GAGAL ') + f + '  ' + a.out.slice(0, 400) + note);
}
process.exit(fail ? 1 : 0);
