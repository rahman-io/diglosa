// Game Definitions, Weapons, Areas, Items, RPG Dialogues

export const WEAPONS: Record<string, any> = {
  ketapel: { n: 'Senjata Pemula', col: '#4fd8ff', sh: 'orb', dmg: 1, cd: .5, spd: 470, pack: 6, ai: -1, d: 'Senjata dasar. Mengisi energi sendiri pelan-pelan sampai 5.' },
  emas: { n: 'Senjata Emas', col: '#ffd24a', sh: 'orb', dmg: 1, cd: .32, spd: 500, pack: 8, ai: 0, d: 'Dari Desa Sapaan. Menembak lebih cepat.' },
  saus: { n: 'Senjata Cepat', col: '#ff7a3a', sh: 'orb', dmg: 1, cd: .24, spd: 420, pack: 10, ai: 1, d: 'Dari Pasar Rasa. Sangat cepat, isi paket banyak.' },
  biji: { n: 'Senjata Hijau', col: '#7cf04a', sh: 'orb', dmg: 1, cd: .55, spd: 540, pack: 6, ai: 2, pierce: 1, d: 'Dari Hutan Satwa. Tembakan menembus satu sasaran.' },
  kertas: { n: 'Senjata Langit', col: '#7fdcff', sh: 'laser', dmg: 1, cd: .45, spd: 600, pack: 6, ai: 3, d: 'Dari Gerbang Kota. Tembakan paling cepat.' },
  jarum: { n: 'Senjata Berat', col: '#ffb347', sh: 'big', dmg: 2, cd: .9, spd: 620, pack: 4, ai: 4, d: 'Dari Menara Waktu. Lambat tapi kuat (2 kerusakan).' },
  kristal: { n: 'Senjata Kristal', col: '#b57cff', sh: 'diamond', dmg: 1, cd: .6, spd: 500, pack: 6, ai: 5, spread: 3, d: 'Dari Gua Portal. Menembak tiga tembakan kipas sekaligus.' }
};

export const AREA_DEF: any[] = [
  { id: 'desa', name: 'Desa Sapaan', e: '🏡', cats: ['Salam & Dasar', 'Angka & Urutan', 'Warna', 'Keluarga & Orang', 'Tubuh'],
    npc: { n: 'Kakek Sapa', e: '👴', spr: 'kakek', x: 324, y: 332 }, go: [324, 392],
    say: [['Hello, traveler! Welcome to our village.', 'Halo, pengelana! Selamat datang di desa kami.'],
          ['Please help me learn greetings, numbers, colors, family and body words.', 'Tolong bantu aku mempelajari sapaan, angka, warna, keluarga, dan anggota tubuh.']] },
  { id: 'pasar', name: 'Pasar Rasa', e: '🍲', cats: ['Makanan', 'Minuman & Dapur', 'Pakaian & Barang', 'Belanja & Kesehatan'],
    npc: { n: 'Koki Mimi', e: '🧑‍🍳', spr: 'mimi', x: 265, y: 515 }, go: [310, 520],
    say: [['Hi! I am hungry. I need food and drinks.', 'Hai! Aku lapar. Aku butuh makanan dan minuman.'],
          ['Can you learn the food, clothes and shopping words with me?', 'Bisakah kamu belajar kata makanan, pakaian, dan belanja bersamaku?']] },
  { id: 'hutan', name: 'Hutan Satwa', e: '🦊', cats: ['Hewan', 'Alam & Cuaca', 'Hobi & Hiburan'],
    npc: { n: 'Rimba', e: '🦊', spr: 'rimba', x: 770, y: 182 }, go: [770, 240],
    say: [['Shh! The animals are lost in the forest.', 'Sst! Hewan-hewan tersesat di hutan.'],
          ['Learn their names, the weather and the fun things to do.', 'Pelajari nama mereka, cuaca, dan kegiatan seru.']] },
  { id: 'kota', name: 'Gerbang Kota', e: '🏘️', cats: ['Rumah', 'Sekolah & Kantor', 'Pekerjaan', 'Kota & Tempat', 'Transportasi'],
    npc: { n: 'Penjaga Gerbang', e: '💂', spr: 'gerbang', x: 523, y: 478 }, go: [523, 535],
    say: [['Stop! Where are you going?', 'Berhenti! Kamu mau ke mana?'],
          ['Learn the words for homes, schools, jobs, places and cars.', 'Pelajari kata untuk rumah, sekolah, pekerjaan, tempat, dan kendaraan.']] },
  { id: 'menara', name: 'Menara Waktu', e: '⏳', cats: ['Waktu', 'Kata Kerja', 'Kata Sifat', 'Kata Keterangan'],
    npc: { n: 'Penjaga Waktu', e: '🧙', spr: 'waktu', x: 281, y: 160 }, go: [281, 218],
    say: [['Time is very important here.', 'Waktu sangat penting di sini.'],
          ['Learn the days, months, verbs, adjectives and adverbs.', 'Pelajari hari, bulan, kata kerja, kata sifat, dan kata keterangan.']] },
  { id: 'portal', name: 'Gua Portal', e: '🔮', cats: ['Tanya, Depan & Sambung', 'Kata Ganti & Penentu', 'Kata Bantu & Dasar Tambahan', 'Pelengkap Topik A1', 'Persiapan IELTS A1'],
    npc: { n: 'Nyonya Portal', e: '🧙‍♀️', spr: 'portal', x: 523, y: 160 }, go: [523, 218],
    say: [['I feel something strange about this portal.', 'Aku merasakan sesuatu yang aneh pada portal ini.'],
          ['Can you help me? Learn the small words that connect every sentence.', 'Bisakah kamu membantuku? Pelajari kata-kata kecil yang menyambung setiap kalimat.']] }
];

export const ITEMS: Record<string, any> = {
  pedang: { e: '🗡️', n: 'Pedang Kata', d: 'Jawaban benar di duel memberi 2 kerusakan, bukan 1.' },
  perisai: { e: '🛡️', n: 'Perisai Panci', d: 'Jawaban salah pertama di tiap duel tidak mengurangi nyawa.' },
  peluit: { e: '🎵', n: 'Peluit Rimba', d: 'Sekali per duel, menghapus satu pilihan yang salah (gratis).' },
  sepatu: { e: '👟', n: 'Sepatu Angin', d: 'Waktu AMBIL! bertambah 1 detik.' },
  jam: { e: '⏳', n: 'Jam Pasir Emas', d: 'Sekali per duel, membekukan monster saat kamu terlambat.' },
  kompas: { e: '🧭', n: 'Kompas Tanya', d: 'Menandai kata yang sering kamu salahi di soal duel.' }
};

export const STORY: Record<string, any> = {   /* area yang dimenangkan memberi satu benda, satu pecahan mahkota, dan satu pita merah dari Lila */
  desa: { item: 'pedang', piece: 1, ribbon: ['Hello, brother. My name is Lila. I am your sister. Say hello to me.', 'Halo, Kak. Namaku Lila. Aku adikmu. Sapalah aku.'] },
  pasar: { item: 'perisai', piece: 2, ribbon: ['I ate rice and soup in the market. It was good. Are you hungry, brother? Please eat.', 'Aku makan nasi dan sup di pasar. Enak. Apakah kamu lapar, Kak? Tolong makanlah.'] },
  hutan: { item: 'peluit', piece: 3, ribbon: ['It was sunny and rainy at the same time. I saw a rainbow in the forest. I was happy for one minute.', 'Hari itu cerah dan hujan sekaligus. Aku melihat pelangi di hutan. Aku bahagia selama satu menit.'] },
  kota: { item: 'sepatu', piece: 4, ribbon: ['I took the bus to the castle. The driver did not know his job. I told him: you are a driver. He smiled.', 'Aku naik bus ke istana. Sopirnya lupa pekerjaannya. Kubilang: kamu seorang sopir. Ia tersenyum.'] },
  menara: { item: 'jam', piece: 5, ribbon: ['Time stopped, but I did not stop. I walked up eighty stairs. I am tired, but I am happy.', 'Waktu berhenti, tapi aku tidak berhenti. Aku menaiki delapan puluh anak tangga. Aku lelah, tapi aku bahagia.'] },
  portal: { item: 'kompas', piece: 6, ribbon: ['I am in the castle. The King is kind. Come, brother. My name is Lila. I am your sister. I am waiting.', 'Aku di istana. Raja itu baik. Datanglah, Kak. Namaku Lila. Aku adikmu. Aku menunggu.'] }
};

export const THANKS: Record<string, any> = {   /* dialog penduduk setelah areanya selamat */
  desa: [['Rani! My dear Rani! Thank you. The village says hello again.', 'Rani! Cucuku tersayang! Terima kasih. Desa ini kembali saling menyapa.']],
  pasar: [['Mama is well again. The market smells of soup! Thank you.', 'Mama sudah sehat lagi. Pasar harum sup! Terima kasih.']],
  hutan: [['Kiki is free! The animals sing again. Thank you, friend.', 'Kiki bebas! Hewan-hewan bernyanyi lagi. Terima kasih, Kawan.']],
  kota: [['Dewi is safe at school. The gate is open. Thank you!', 'Dewi selamat di sekolah. Gerbang terbuka. Terima kasih!']],
  menara: [['Time moves again. I could say goodbye to my student. Thank you.', 'Waktu bergerak lagi. Aku bisa berpamitan pada muridku. Terima kasih.']],
  portal: [['My voice is back! You freed the cave. Thank you.', 'Suaraku kembali! Kamu membebaskan gua. Terima kasih.']]
};

export const RPG_LILA: string[][] = [
  ['Brother, it is Lila. Bad monsters came to the castle at night.', 'Kak, ini Lila. Monster jahat datang ke istana pada malam hari.', 'lila'],
  ['There are many. Some have weapons. They want the castle.', 'Jumlah mereka banyak. Ada yang membawa senjata. Mereka ingin menguasai istana.', 'lila'],
  ['They broke the crown. They took our words, so we cannot join together.', 'Mereka memecahkan mahkota. Mereka mengambil kata-kata kita, jadi kita tidak bisa bersatu.', 'lila'],
  ['The king and I are behind the Purple Door. I am afraid, but I am waiting for you.', 'Raja dan aku ada di balik Pintu Ungu. Aku takut, tapi aku menunggumu.', 'lila']];

export const RPG_RAJA: string[][] = [
  ['Traveler, I am King Aksara. Thank you for coming.', 'Pengelana, aku Raja Aksara. Terima kasih sudah datang.', 'raja'],
  ['The monsters took our words. I have only a few words left.', 'Para monster mengambil kata-kata kami. Hanya sedikit kata yang tersisa padaku.', 'raja'],
  ['Six places are on the road to the castle. Each place has a big monster and a crown piece.', 'Ada enam tempat di jalan menuju istana. Tiap tempat punya monster besar dan satu pecahan mahkota.', 'raja'],
  ['A big boss leads all the monsters in the castle.', 'Seorang bos besar memimpin semua monster di istana.', 'raja'],
  ['Beat the monsters, and the words go home. Then the road to the castle opens.', 'Kalahkan para monster, dan kata-kata pulang. Lalu jalan ke istana terbuka.', 'raja'],
  ['But you have no weapon. Look near the road and find one first.', 'Tapi kamu belum punya senjata. Lihatlah di dekat jalan dan temukan satu dulu.', 'raja'],
  ['Please save my land, my queen, and Lila.', 'Tolong selamatkan negeriku, ratuku, dan Lila.', 'raja']];

export const RPG_HINT: string[][] = [
  ['Hoot! You have no weapon yet. Look for it among the hearts and gems.', 'Hoot! Kamu belum punya senjata. Carilah di antara hati dan berlian.', 'hoot'],
  ['Walk to it to take it. You also get five bullets.', 'Dekati untuk mengambilnya. Kamu juga mendapat lima peluru.', 'hoot'],
  ['Move with the stick. Tap a person to talk.', 'Gerakkan dengan tongkat. Ketuk seseorang untuk berbicara.', 'hoot']];

export const RPG_DEFEAT: Record<string, any> = [['Oh, I am sorry. You lost this time.', 'Oh, maafkan aku. Kamu kalah kali ini.'], ['But please do not give up. We need you.', 'Tapi tolong jangan menyerah. Kami membutuhkanmu.'], ['Rest a little. Then come back and help us, please.', 'Istirahatlah sebentar. Lalu kembali dan bantu kami, tolong.']];

export const CAVE_ENT: any[] = [
  { id: 'npc', t: 'npc', av: '🧙‍♀️', npc: { n: 'Nyonya Portal', e: '🧙‍♀️', spr: 'portal', x: 500, y: 375 }, go: [500, 433] },
  { id: 'kolam', t: 'door', mode: 'cards', av: '💧', npc: { n: 'Kolam Ingatan', e: '💧', x: 262, y: 392 }, go: [318, 398] },
  { id: 'kilat', t: 'door', mode: 'duel', av: '⚡', npc: { n: 'Lorong Kilat', e: '⚡', x: 195, y: 205 }, go: [205, 262] },
  { id: 'gema', t: 'door', mode: 'listen', av: '🔔', npc: { n: 'Lorong Gema', e: '🔔', x: 830, y: 205 }, go: [830, 262] },
  { id: 'huruf', t: 'door', mode: 'type', av: '🌉', npc: { n: 'Jembatan Huruf', e: '🌉', x: 718, y: 375 }, go: [670, 390] },
  { id: 'teka', t: 'door', mode: 'match', av: '🚪', npc: { n: 'Pintu Teka-Teki', e: '🚪', x: 505, y: 236 }, go: [505, 285] },
  { id: 'exit', t: 'exit', av: '⬅️', npc: { n: 'Keluar Gua', e: '⬅️', x: 500, y: 590 }, go: [500, 540] }
];

export const VIL_ENT: any[] = [
  { id: 'npc', t: 'npc', av: '👴', npc: { n: 'Kakek Sapa', e: '👴', spr: 'kakek', x: 501, y: 352 }, go: [500, 400] },
  { id: 'sumur', t: 'door', mode: 'cards', av: '💧', npc: { n: 'Sumur Tua', e: '💧', x: 172, y: 425 }, go: [220, 470] },
  { id: 'jembatan', t: 'door', mode: 'duel', av: '⚡', npc: { n: 'Jembatan Batu', e: '⚡', x: 268, y: 160 }, go: [320, 190] },
  { id: 'lumbung', t: 'door', mode: 'listen', av: '🔔', npc: { n: 'Lumbung', e: '🔔', x: 795, y: 255 }, go: [790, 290] },
  { id: 'parit', t: 'door', mode: 'type', av: '🌉', npc: { n: 'Parit', e: '🌉', x: 794, y: 452 }, go: [710, 490] },
  { id: 'rani', t: 'door', mode: 'match', av: '🚪', npc: { n: 'Rumah Rani', e: '🚪', x: 487, y: 222 }, go: [490, 240] },
  { id: 'portal', t: 'portal', av: '🌀', npc: { n: 'Portal Kecil', e: '🌀', x: 875, y: 105 }, go: [820, 280] },
  { id: 'exit', t: 'exit', av: '⬅️', npc: { n: 'Jalan Keluar', e: '⬅️', x: 501, y: 598 }, go: [500, 570] }
];

export const MKT_ENT: any[] = [
  { id: 'npc', t: 'npc', av: '👩‍🍳', npc: { n: 'Koki Mimi', e: '👩‍🍳', spr: 'mimi', x: 498, y: 352 }, go: [500, 400] },
  { id: 'panci', t: 'door', mode: 'cards', av: '🍲', npc: { n: 'Panci Bening', e: '🍲', x: 165, y: 395 }, go: [250, 470] },
  { id: 'lorong', t: 'door', mode: 'duel', av: '⚡', npc: { n: 'Lorong Lapak', e: '⚡', x: 222, y: 205 }, go: [230, 260] },
  { id: 'gudang', t: 'door', mode: 'listen', av: '🔔', npc: { n: 'Gudang Bawah', e: '🔔', x: 738, y: 235 }, go: [730, 260] },
  { id: 'sungai', t: 'door', mode: 'type', av: '🌉', npc: { n: 'Sungai Kuah', e: '🌉', x: 820, y: 435 }, go: [830, 410] },
  { id: 'lemari', t: 'door', mode: 'match', av: '🚪', npc: { n: 'Lemari Bumbu', e: '🚪', x: 498, y: 225 }, go: [500, 240] },
  { id: 'portal', t: 'portal', av: '🌀', npc: { n: 'Portal Kecil', e: '🌀', x: 875, y: 100 }, go: [800, 130] },
  { id: 'exit', t: 'exit', av: '⬅️', npc: { n: 'Jalan Keluar', e: '⬅️', x: 500, y: 598 }, go: [500, 570] }
];

export const SAT_ENT: any[] = [
  { id: 'npc', t: 'npc', av: '🦊', npc: { n: 'Rimba', e: '🦊', spr: 'rimba', x: 500, y: 355 }, go: [500, 400] },
  { id: 'genangan', t: 'door', mode: 'cards', av: '💧', npc: { n: 'Genangan', e: '💧', x: 190, y: 405 }, go: [300, 480] },
  { id: 'jalur', t: 'door', mode: 'duel', av: '⚡', npc: { n: 'Jalur Semak', e: '⚡', x: 215, y: 205 }, go: [210, 250] },
  { id: 'ceruk', t: 'door', mode: 'listen', av: '🔔', npc: { n: 'Ceruk Pohon', e: '🔔', x: 745, y: 215 }, go: [740, 280] },
  { id: 'batang', t: 'door', mode: 'type', av: '🌉', npc: { n: 'Batang Tumbang', e: '🌉', x: 860, y: 440 }, go: [800, 470] },
  { id: 'akar', t: 'door', mode: 'match', av: '🚪', npc: { n: 'Akar Berpola', e: '🚪', x: 500, y: 215 }, go: [500, 240] },
  { id: 'portal', t: 'portal', av: '🌀', npc: { n: 'Portal Kecil', e: '🌀', x: 885, y: 95 }, go: [870, 140] },
  { id: 'exit', t: 'exit', av: '⬅️', npc: { n: 'Jalan Keluar', e: '⬅️', x: 500, y: 598 }, go: [500, 570] }
];

export const KOT_ENT: any[] = [
  { id: 'npc', t: 'npc', av: '💂', npc: { n: 'Penjaga Gerbang', e: '💂', spr: 'gerbang', x: 501, y: 358 }, go: [500, 400] },
  { id: 'peta', t: 'door', mode: 'cards', av: '🗺️', npc: { n: 'Papan Peta', e: '🗺️', x: 155, y: 395 }, go: [250, 470] },
  { id: 'bus', t: 'door', mode: 'duel', av: '🚌', npc: { n: 'Jalan Bus', e: '🚌', x: 190, y: 195 }, go: [190, 240] },
  { id: 'stasiun', t: 'door', mode: 'listen', av: '🚂', npc: { n: 'Terowongan', e: '🚂', x: 745, y: 235 }, go: [700, 290] },
  { id: 'layang', t: 'door', mode: 'type', av: '🌉', npc: { n: 'Titian Layang', e: '🌉', x: 840, y: 440 }, go: [740, 470] },
  { id: 'sekolah', t: 'door', mode: 'match', av: '🏫', npc: { n: 'Pintu Sekolah', e: '🏫', x: 500, y: 222 }, go: [500, 260] },
  { id: 'portal', t: 'portal', av: '🌀', npc: { n: 'Portal Kecil', e: '🌀', x: 905, y: 75 }, go: [860, 160] },
  { id: 'exit', t: 'exit', av: '⬅️', npc: { n: 'Jalan Keluar', e: '⬅️', x: 500, y: 598 }, go: [500, 570] }
];

export const WKT_ENT: any[] = [
  { id: 'npc', t: 'npc', av: '🧙', npc: { n: 'Penjaga Waktu', e: '🧙', spr: 'waktu', x: 495, y: 348 }, go: [490, 400] },
  { id: 'permukaan', t: 'door', mode: 'cards', av: '🕰️', npc: { n: 'Permukaan Jam', e: '🕰️', x: 165, y: 425 }, go: [310, 390] },
  { id: 'roda', t: 'door', mode: 'duel', av: '⚙️', npc: { n: 'Lorong Roda', e: '⚙️', x: 225, y: 180 }, go: [230, 250] },
  { id: 'lonceng', t: 'door', mode: 'listen', av: '🔔', npc: { n: 'Ruang Lonceng', e: '🔔', x: 715, y: 195 }, go: [700, 240] },
  { id: 'bandul', t: 'door', mode: 'type', av: '⏱️', npc: { n: 'Bandul Panjang', e: '⏱️', x: 790, y: 425 }, go: [700, 380] },
  { id: 'pintujam', t: 'door', mode: 'match', av: '🚪', npc: { n: 'Pintu Jam', e: '🚪', x: 500, y: 165 }, go: [500, 220] },
  { id: 'portal', t: 'portal', av: '🌀', npc: { n: 'Portal Kecil', e: '🌀', x: 905, y: 75 }, go: [880, 190] },
  { id: 'exit', t: 'exit', av: '⬅️', npc: { n: 'Jalan Keluar', e: '⬅️', x: 500, y: 545 }, go: [500, 460] }
];

export const DOOR = { id: 'door', name: 'Portal Istana', e: '🏰', npc: { n: 'Portal Ungu', e: '🔮', x: 526, y: 58 }, go: [526, 100], say: [['This purple portal leads to the IELTS Castle.', 'Portal ungu ini menuju Istana IELTS.'], ['Only heroes who have explored the forest can enter.', 'Hanya pahlawan yang telah menjelajah hutan yang boleh masuk.']] };
export const INNER_MAPS = ['desa', 'pasar', 'satwa', 'kota', 'waktu', 'portal'];
