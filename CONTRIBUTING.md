# Cara bekerja di repositori ini

## Aturan cabang
- `main` hanya berisi versi yang sudah disetujui. Jangan commit langsung ke `main`.
- Satu versi satu cabang, bernama `vMAJOR.MINOR` (contoh `v2.22`).
- Perubahan kecil di dalam satu versi boleh memakai cabang turunan, misalnya `v2.22-perbaiki-kolam`, lalu digabung ke cabang versinya.
- Setelah versi disetujui, buat Pull Request dari cabang versi ke `main`, tunggu uji hijau, lalu Merge. Beri tag `vMAJOR.MINOR` pada hasil penggabungan.

## Alur harian
```
git switch main && git pull
git switch -c v2.22
# ... ubah berkas di src/ dan tests/ ...
python build.py                       # membuat dist/diglosa.html; buka berkasnya di peramban
cd tests && npm ci && npm test        # semua rangkaian uji harus OK
cd ..
git add . && git commit -m "feat: short summary of the change"
git push -u origin v2.22
```
Lalu buka Pull Request di GitHub. Alur kerja "Uji" menjalankan semuanya lagi.

## Pesan commit (bahasa Inggris)
Semua pesan commit, judul Pull Request, dan pesan tag ditulis dalam **bahasa Inggris**. Antarmuka dan teks game tetap berbahasa Indonesia.
- Format judul: `type: short summary` (huruf kecil, kalimat perintah, tanpa titik, paling banyak sekitar 72 karakter).
- Jenis (`type`): `feat` (fitur baru), `fix` (perbaikan), `docs` (dokumentasi), `test` (uji), `refactor` (rapikan tanpa mengubah perilaku), `chore` (urusan rutin seperti versi atau konfigurasi).
- Isi tambahan (opsional) lewat `-m` kedua, menjelaskan alasan perubahan, bukan sekadar apa yang berubah.
- Contoh:
```
git commit -m "feat: add item rewards that affect word duels"
git commit -m "fix: keep the hero inside the cave floor near the pool"
git commit -m "test: cover the locked round door in the Portal Cave"
git commit -m "docs: explain the branch and tag rules"
git commit -m "chore: bump version to v2.22"
```
- Tag versi: `git tag -a v2.22 -m "Diglosa v2.22"`.

## Struktur
- `src/`: sumber game (templat HTML, CSS, JS, kosakata, gambar WebP).
- `build.py`: menggabungkan semuanya menjadi satu berkas `dist/diglosa.html`.
- `tests/`: rangkaian uji (jsdom). Tiap berkas bernomor mewakili satu bagian game.
- Detail teknis tiap fitur ada di `README.md`.

## Aturan penting
- Jangan menyimpan token, kata sandi, atau kunci apa pun di repositori.
- Berkas besar (gambar) cukup berupa WebP di `src/`; jangan menyimpan berkas hasil bangunan.
- Setiap perubahan perilaku game disertai perubahan atau penambahan uji.

## Tayang
Setiap penggabungan ke `main` otomatis diterbitkan oleh alur kerja "Terbitkan ke GitHub Pages" ke `https://NAMAAKUN.github.io/diglosa/`. Cabang versi tidak tayang sebelum digabung.
