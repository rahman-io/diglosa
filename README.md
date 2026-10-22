# Diglosa (React Edition)

Game petualangan belajar bahasa Inggris A1: **Hutan Kata** (826 kosakata terstruktur dalam 26 bab) dan **Istana IELTS** (simulasi ujian resmi Listening, Reading, Writing, Speaking), dilengkapi monster berkeliaran, nyawa, berlian, duel kata interaktif, mekanik penembak senjata blaster, dan bos bertingkat.

Aplikasi ini telah ditulis ulang sepenuhnya (*rewritten*) sebagai aplikasi **React + TypeScript + Vite + Tailwind CSS**.

## Fitur Utama

- **Hutan Kata & 6 Dunia Dalam**:
  - Hutan Kata (Forest Hub)
  - Desa Sapaan (Kakek Sapa • Bos: Gumpal Salam)
  - Pasar Rasa (Koki Mimi • Bos: Lendir Kuali)
  - Hutan Satwa (Rimba • Bos: Semak Gigit)
  - Gerbang Kota (Penjaga Gerbang • Bos: Bayangan Gerbang)
  - Menara Waktu (Penjaga Waktu • Bos: Jam Pasir Liar)
  - Gua Portal (Nyonya Portal • Bos: Hantu Portal)
- **Minigame & Mode Latihan Kosakata**:
  - 🃏 **Kartu Kilat (Flashcards)**: Animasi kartu bolak-balik dengan audio pengucapan.
  - ⚡ **Kuis Kilat (Quiz)**: Pilihan ganda dengan umpan balik instan dan batas waktu.
  - 🎧 **Telinga Tajam (Listening)**: Latihan pemahaman audio suara bahasa Inggris.
  - ✍️ **Jago Ejaan (Spelling/Type)**: Mengetik ejaan bahasa Inggris dengan petunjuk huruf.
  - 🧩 **Pasang Kartu (Matching Pairs)**: Mencocokkan 8 pasang kosakata Inggris - Indonesia.
- **Duel Rebutan & Pertarungan Bos**:
  - Tombol *AMBIL!* dengan timer reaksi sebelum monster menyerang.
  - Jalur arena duel dengan animasi proyektil tembakan dan serangan monster.
  - Mekanik khas bos di setiap area (lendir penutup kata di Pasar, regenerasi nyawa di Hutan Satwa, gembok jawaban di Gerbang Kota, pemutar waktu di Menara Waktu).
  - Pusaka penjelajah (Pedang Kata, Perisai Panci, Peluit Rimba, dsb.).
- **Senjata Blaster & Peluru**:
  - 7 blaster: Pemula, Emas, Cepat, Hijau, Langit, Berat, Kristal.
  - Pose menembak animasi dan proyektil dengan suara WebAudio.
- **Istana IELTS**:
  - 4 modul pengujian lengkap: Listening, Reading, Writing, dan Speaking bersama penguji istana (Sera, Bima, Rangga, Ayu).
  - Rapor nilai resmi dan kalkulasi *Overall Band Score* (Band 1.0 sampai 9.0).
- **Audio & Efek**:
  - Suara efek murni disintesis melalui Web Audio API bawaan peramban (tanpa berkas audio eksternal).
  - Pengucapan kata menggunakan Web SpeechSynthesis.

## Menjalankan Proyek

```bash
# Menjalankan server pengembangan (port 3000)
npm run dev

# Membangun produksi
npm run build
```
