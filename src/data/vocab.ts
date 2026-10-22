export interface Category { id: number; idName: string; enName: string; }
export interface Word { cat: number; en: string; id: string; }

export const CATEGORIES: Category[] = [
  {
    "id": 0,
    "idName": "Salam & Dasar",
    "enName": "👋"
  },
  {
    "id": 1,
    "idName": "Angka & Urutan",
    "enName": "🔢"
  },
  {
    "id": 2,
    "idName": "Warna",
    "enName": "🎨"
  },
  {
    "id": 3,
    "idName": "Keluarga & Orang",
    "enName": "👨‍👩‍👧"
  },
  {
    "id": 4,
    "idName": "Tubuh",
    "enName": "🧍"
  },
  {
    "id": 5,
    "idName": "Makanan",
    "enName": "🍎"
  },
  {
    "id": 6,
    "idName": "Minuman & Dapur",
    "enName": "🥤"
  },
  {
    "id": 7,
    "idName": "Hewan",
    "enName": "🐶"
  },
  {
    "id": 8,
    "idName": "Rumah",
    "enName": "🏠"
  },
  {
    "id": 9,
    "idName": "Pakaian & Barang",
    "enName": "👕"
  },
  {
    "id": 10,
    "idName": "Sekolah & Kantor",
    "enName": "🎒"
  },
  {
    "id": 11,
    "idName": "Pekerjaan",
    "enName": "💼"
  },
  {
    "id": 12,
    "idName": "Kota & Tempat",
    "enName": "🏙️"
  },
  {
    "id": 13,
    "idName": "Transportasi",
    "enName": "🚗"
  },
  {
    "id": 14,
    "idName": "Alam & Cuaca",
    "enName": "☀️"
  },
  {
    "id": 15,
    "idName": "Waktu",
    "enName": "⏰"
  },
  {
    "id": 16,
    "idName": "Kata Kerja",
    "enName": "🏃"
  },
  {
    "id": 17,
    "idName": "Kata Sifat",
    "enName": "✨"
  },
  {
    "id": 18,
    "idName": "Tanya, Depan & Sambung",
    "enName": "❓"
  },
  {
    "id": 19,
    "idName": "Kata Ganti & Penentu",
    "enName": "👤"
  },
  {
    "id": 20,
    "idName": "Kata Keterangan",
    "enName": "⚡"
  },
  {
    "id": 21,
    "idName": "Hobi & Hiburan",
    "enName": "⚽"
  },
  {
    "id": 22,
    "idName": "Belanja & Kesehatan",
    "enName": "💰"
  },
  {
    "id": 23,
    "idName": "Kata Bantu & Dasar Tambahan",
    "enName": "🧩"
  },
  {
    "id": 24,
    "idName": "Pelengkap Topik A1",
    "enName": "🧺"
  },
  {
    "id": 25,
    "idName": "Persiapan IELTS A1",
    "enName": "🎓"
  }
];

export const WORDS: Word[] = [
  {
    "cat": 0,
    "en": "hello",
    "id": "halo"
  },
  {
    "cat": 0,
    "en": "hi",
    "id": "hai"
  },
  {
    "cat": 0,
    "en": "goodbye",
    "id": "selamat tinggal"
  },
  {
    "cat": 0,
    "en": "bye",
    "id": "dadah"
  },
  {
    "cat": 0,
    "en": "please",
    "id": "tolong / silakan"
  },
  {
    "cat": 0,
    "en": "thank you",
    "id": "terima kasih"
  },
  {
    "cat": 0,
    "en": "sorry",
    "id": "maaf"
  },
  {
    "cat": 0,
    "en": "excuse me",
    "id": "permisi"
  },
  {
    "cat": 0,
    "en": "welcome",
    "id": "selamat datang"
  },
  {
    "cat": 0,
    "en": "yes",
    "id": "ya"
  },
  {
    "cat": 0,
    "en": "no",
    "id": "tidak"
  },
  {
    "cat": 0,
    "en": "okay",
    "id": "oke / baik"
  },
  {
    "cat": 0,
    "en": "good morning",
    "id": "selamat pagi"
  },
  {
    "cat": 0,
    "en": "good afternoon",
    "id": "selamat siang"
  },
  {
    "cat": 0,
    "en": "good evening",
    "id": "selamat malam"
  },
  {
    "cat": 0,
    "en": "good night",
    "id": "selamat tidur"
  },
  {
    "cat": 0,
    "en": "name",
    "id": "nama"
  },
  {
    "cat": 0,
    "en": "nice to meet you",
    "id": "senang bertemu denganmu"
  },
  {
    "cat": 0,
    "en": "how are you",
    "id": "apa kabar"
  },
  {
    "cat": 0,
    "en": "fine",
    "id": "baik-baik saja"
  },
  {
    "cat": 0,
    "en": "see you",
    "id": "sampai jumpa"
  },
  {
    "cat": 0,
    "en": "question",
    "id": "pertanyaan"
  },
  {
    "cat": 0,
    "en": "word",
    "id": "kata"
  },
  {
    "cat": 0,
    "en": "language",
    "id": "bahasa"
  },
  {
    "cat": 0,
    "en": "English",
    "id": "bahasa Inggris"
  },
  {
    "cat": 0,
    "en": "example",
    "id": "contoh"
  },
  {
    "cat": 1,
    "en": "zero",
    "id": "nol"
  },
  {
    "cat": 1,
    "en": "one",
    "id": "satu"
  },
  {
    "cat": 1,
    "en": "two",
    "id": "dua"
  },
  {
    "cat": 1,
    "en": "three",
    "id": "tiga"
  },
  {
    "cat": 1,
    "en": "four",
    "id": "empat"
  },
  {
    "cat": 1,
    "en": "five",
    "id": "lima"
  },
  {
    "cat": 1,
    "en": "six",
    "id": "enam"
  },
  {
    "cat": 1,
    "en": "seven",
    "id": "tujuh"
  },
  {
    "cat": 1,
    "en": "eight",
    "id": "delapan"
  },
  {
    "cat": 1,
    "en": "nine",
    "id": "sembilan"
  },
  {
    "cat": 1,
    "en": "ten",
    "id": "sepuluh"
  },
  {
    "cat": 1,
    "en": "eleven",
    "id": "sebelas"
  },
  {
    "cat": 1,
    "en": "twelve",
    "id": "dua belas"
  },
  {
    "cat": 1,
    "en": "thirteen",
    "id": "tiga belas"
  },
  {
    "cat": 1,
    "en": "fourteen",
    "id": "empat belas"
  },
  {
    "cat": 1,
    "en": "fifteen",
    "id": "lima belas"
  },
  {
    "cat": 1,
    "en": "sixteen",
    "id": "enam belas"
  },
  {
    "cat": 1,
    "en": "seventeen",
    "id": "tujuh belas"
  },
  {
    "cat": 1,
    "en": "eighteen",
    "id": "delapan belas"
  },
  {
    "cat": 1,
    "en": "nineteen",
    "id": "sembilan belas"
  },
  {
    "cat": 1,
    "en": "twenty",
    "id": "dua puluh"
  },
  {
    "cat": 1,
    "en": "thirty",
    "id": "tiga puluh"
  },
  {
    "cat": 1,
    "en": "forty",
    "id": "empat puluh"
  },
  {
    "cat": 1,
    "en": "fifty",
    "id": "lima puluh"
  },
  {
    "cat": 1,
    "en": "hundred",
    "id": "seratus"
  },
  {
    "cat": 1,
    "en": "thousand",
    "id": "seribu"
  },
  {
    "cat": 1,
    "en": "first",
    "id": "pertama"
  },
  {
    "cat": 1,
    "en": "second",
    "id": "kedua"
  },
  {
    "cat": 1,
    "en": "third",
    "id": "ketiga"
  },
  {
    "cat": 1,
    "en": "number",
    "id": "nomor / angka"
  },
  {
    "cat": 2,
    "en": "color",
    "id": "warna"
  },
  {
    "cat": 2,
    "en": "red",
    "id": "merah"
  },
  {
    "cat": 2,
    "en": "blue",
    "id": "biru"
  },
  {
    "cat": 2,
    "en": "green",
    "id": "hijau"
  },
  {
    "cat": 2,
    "en": "yellow",
    "id": "kuning"
  },
  {
    "cat": 2,
    "en": "orange",
    "id": "oranye / jeruk"
  },
  {
    "cat": 2,
    "en": "purple",
    "id": "ungu"
  },
  {
    "cat": 2,
    "en": "pink",
    "id": "merah muda"
  },
  {
    "cat": 2,
    "en": "black",
    "id": "hitam"
  },
  {
    "cat": 2,
    "en": "white",
    "id": "putih"
  },
  {
    "cat": 2,
    "en": "brown",
    "id": "cokelat (warna)"
  },
  {
    "cat": 2,
    "en": "gray",
    "id": "abu-abu"
  },
  {
    "cat": 3,
    "en": "family",
    "id": "keluarga"
  },
  {
    "cat": 3,
    "en": "mother",
    "id": "ibu"
  },
  {
    "cat": 3,
    "en": "father",
    "id": "ayah"
  },
  {
    "cat": 3,
    "en": "mom",
    "id": "mama"
  },
  {
    "cat": 3,
    "en": "dad",
    "id": "papa"
  },
  {
    "cat": 3,
    "en": "parents",
    "id": "orang tua"
  },
  {
    "cat": 3,
    "en": "brother",
    "id": "saudara laki-laki"
  },
  {
    "cat": 3,
    "en": "sister",
    "id": "saudara perempuan"
  },
  {
    "cat": 3,
    "en": "son",
    "id": "putra"
  },
  {
    "cat": 3,
    "en": "daughter",
    "id": "putri"
  },
  {
    "cat": 3,
    "en": "grandmother",
    "id": "nenek"
  },
  {
    "cat": 3,
    "en": "grandfather",
    "id": "kakek"
  },
  {
    "cat": 3,
    "en": "uncle",
    "id": "paman"
  },
  {
    "cat": 3,
    "en": "aunt",
    "id": "bibi"
  },
  {
    "cat": 3,
    "en": "husband",
    "id": "suami"
  },
  {
    "cat": 3,
    "en": "wife",
    "id": "istri"
  },
  {
    "cat": 3,
    "en": "baby",
    "id": "bayi"
  },
  {
    "cat": 3,
    "en": "child",
    "id": "anak"
  },
  {
    "cat": 3,
    "en": "boy",
    "id": "anak laki-laki"
  },
  {
    "cat": 3,
    "en": "girl",
    "id": "anak perempuan"
  },
  {
    "cat": 3,
    "en": "man",
    "id": "pria"
  },
  {
    "cat": 3,
    "en": "woman",
    "id": "wanita"
  },
  {
    "cat": 3,
    "en": "people",
    "id": "orang-orang"
  },
  {
    "cat": 3,
    "en": "person",
    "id": "orang"
  },
  {
    "cat": 3,
    "en": "friend",
    "id": "teman"
  },
  {
    "cat": 3,
    "en": "neighbor",
    "id": "tetangga"
  },
  {
    "cat": 4,
    "en": "body",
    "id": "tubuh"
  },
  {
    "cat": 4,
    "en": "head",
    "id": "kepala"
  },
  {
    "cat": 4,
    "en": "hair",
    "id": "rambut"
  },
  {
    "cat": 4,
    "en": "face",
    "id": "wajah"
  },
  {
    "cat": 4,
    "en": "eye",
    "id": "mata"
  },
  {
    "cat": 4,
    "en": "ear",
    "id": "telinga"
  },
  {
    "cat": 4,
    "en": "nose",
    "id": "hidung"
  },
  {
    "cat": 4,
    "en": "mouth",
    "id": "mulut"
  },
  {
    "cat": 4,
    "en": "lip",
    "id": "bibir"
  },
  {
    "cat": 4,
    "en": "tooth",
    "id": "gigi"
  },
  {
    "cat": 4,
    "en": "tongue",
    "id": "lidah"
  },
  {
    "cat": 4,
    "en": "neck",
    "id": "leher"
  },
  {
    "cat": 4,
    "en": "shoulder",
    "id": "bahu"
  },
  {
    "cat": 4,
    "en": "arm",
    "id": "lengan"
  },
  {
    "cat": 4,
    "en": "hand",
    "id": "tangan"
  },
  {
    "cat": 4,
    "en": "finger",
    "id": "jari"
  },
  {
    "cat": 4,
    "en": "chest",
    "id": "dada"
  },
  {
    "cat": 4,
    "en": "back",
    "id": "punggung"
  },
  {
    "cat": 4,
    "en": "stomach",
    "id": "perut"
  },
  {
    "cat": 4,
    "en": "leg",
    "id": "kaki"
  },
  {
    "cat": 4,
    "en": "foot",
    "id": "telapak kaki"
  },
  {
    "cat": 4,
    "en": "knee",
    "id": "lutut"
  },
  {
    "cat": 4,
    "en": "heart",
    "id": "jantung / hati"
  },
  {
    "cat": 4,
    "en": "skin",
    "id": "kulit"
  },
  {
    "cat": 5,
    "en": "food",
    "id": "makanan"
  },
  {
    "cat": 5,
    "en": "bread",
    "id": "roti"
  },
  {
    "cat": 5,
    "en": "rice",
    "id": "nasi"
  },
  {
    "cat": 5,
    "en": "noodles",
    "id": "mi"
  },
  {
    "cat": 5,
    "en": "egg",
    "id": "telur"
  },
  {
    "cat": 5,
    "en": "meat",
    "id": "daging"
  },
  {
    "cat": 5,
    "en": "cheese",
    "id": "keju"
  },
  {
    "cat": 5,
    "en": "butter",
    "id": "mentega"
  },
  {
    "cat": 5,
    "en": "sugar",
    "id": "gula"
  },
  {
    "cat": 5,
    "en": "salt",
    "id": "garam"
  },
  {
    "cat": 5,
    "en": "pepper",
    "id": "merica"
  },
  {
    "cat": 5,
    "en": "soup",
    "id": "sup"
  },
  {
    "cat": 5,
    "en": "salad",
    "id": "salad"
  },
  {
    "cat": 5,
    "en": "sandwich",
    "id": "sandwich"
  },
  {
    "cat": 5,
    "en": "pizza",
    "id": "pizza"
  },
  {
    "cat": 5,
    "en": "cake",
    "id": "kue"
  },
  {
    "cat": 5,
    "en": "cookie",
    "id": "biskuit"
  },
  {
    "cat": 5,
    "en": "ice cream",
    "id": "es krim"
  },
  {
    "cat": 5,
    "en": "chocolate",
    "id": "cokelat (makanan)"
  },
  {
    "cat": 5,
    "en": "candy",
    "id": "permen"
  },
  {
    "cat": 5,
    "en": "apple",
    "id": "apel"
  },
  {
    "cat": 5,
    "en": "banana",
    "id": "pisang"
  },
  {
    "cat": 5,
    "en": "grape",
    "id": "anggur"
  },
  {
    "cat": 5,
    "en": "mango",
    "id": "mangga"
  },
  {
    "cat": 5,
    "en": "strawberry",
    "id": "stroberi"
  },
  {
    "cat": 5,
    "en": "watermelon",
    "id": "semangka"
  },
  {
    "cat": 5,
    "en": "lemon",
    "id": "lemon"
  },
  {
    "cat": 5,
    "en": "tomato",
    "id": "tomat"
  },
  {
    "cat": 5,
    "en": "potato",
    "id": "kentang"
  },
  {
    "cat": 5,
    "en": "carrot",
    "id": "wortel"
  },
  {
    "cat": 5,
    "en": "onion",
    "id": "bawang merah"
  },
  {
    "cat": 5,
    "en": "garlic",
    "id": "bawang putih"
  },
  {
    "cat": 5,
    "en": "corn",
    "id": "jagung"
  },
  {
    "cat": 5,
    "en": "bean",
    "id": "kacang"
  },
  {
    "cat": 5,
    "en": "vegetable",
    "id": "sayuran"
  },
  {
    "cat": 5,
    "en": "fruit",
    "id": "buah"
  },
  {
    "cat": 5,
    "en": "breakfast",
    "id": "sarapan"
  },
  {
    "cat": 5,
    "en": "lunch",
    "id": "makan siang"
  },
  {
    "cat": 5,
    "en": "dinner",
    "id": "makan malam"
  },
  {
    "cat": 5,
    "en": "snack",
    "id": "camilan"
  },
  {
    "cat": 5,
    "en": "meal",
    "id": "hidangan"
  },
  {
    "cat": 5,
    "en": "honey",
    "id": "madu"
  },
  {
    "cat": 6,
    "en": "water",
    "id": "air"
  },
  {
    "cat": 6,
    "en": "milk",
    "id": "susu"
  },
  {
    "cat": 6,
    "en": "juice",
    "id": "jus"
  },
  {
    "cat": 6,
    "en": "tea",
    "id": "teh"
  },
  {
    "cat": 6,
    "en": "coffee",
    "id": "kopi"
  },
  {
    "cat": 6,
    "en": "cup",
    "id": "cangkir"
  },
  {
    "cat": 6,
    "en": "glass",
    "id": "gelas"
  },
  {
    "cat": 6,
    "en": "bottle",
    "id": "botol"
  },
  {
    "cat": 6,
    "en": "plate",
    "id": "piring"
  },
  {
    "cat": 6,
    "en": "bowl",
    "id": "mangkuk"
  },
  {
    "cat": 6,
    "en": "fork",
    "id": "garpu"
  },
  {
    "cat": 6,
    "en": "spoon",
    "id": "sendok"
  },
  {
    "cat": 6,
    "en": "knife",
    "id": "pisau"
  },
  {
    "cat": 7,
    "en": "animal",
    "id": "hewan"
  },
  {
    "cat": 7,
    "en": "dog",
    "id": "anjing"
  },
  {
    "cat": 7,
    "en": "cat",
    "id": "kucing"
  },
  {
    "cat": 7,
    "en": "bird",
    "id": "burung"
  },
  {
    "cat": 7,
    "en": "fish",
    "id": "ikan"
  },
  {
    "cat": 7,
    "en": "chicken",
    "id": "ayam"
  },
  {
    "cat": 7,
    "en": "duck",
    "id": "bebek"
  },
  {
    "cat": 7,
    "en": "horse",
    "id": "kuda"
  },
  {
    "cat": 7,
    "en": "cow",
    "id": "sapi"
  },
  {
    "cat": 7,
    "en": "pig",
    "id": "babi"
  },
  {
    "cat": 7,
    "en": "sheep",
    "id": "domba"
  },
  {
    "cat": 7,
    "en": "goat",
    "id": "kambing"
  },
  {
    "cat": 7,
    "en": "rabbit",
    "id": "kelinci"
  },
  {
    "cat": 7,
    "en": "mouse",
    "id": "tikus"
  },
  {
    "cat": 7,
    "en": "monkey",
    "id": "monyet"
  },
  {
    "cat": 7,
    "en": "elephant",
    "id": "gajah"
  },
  {
    "cat": 7,
    "en": "tiger",
    "id": "harimau"
  },
  {
    "cat": 7,
    "en": "lion",
    "id": "singa"
  },
  {
    "cat": 7,
    "en": "bear",
    "id": "beruang"
  },
  {
    "cat": 7,
    "en": "snake",
    "id": "ular"
  },
  {
    "cat": 7,
    "en": "frog",
    "id": "katak"
  },
  {
    "cat": 7,
    "en": "butterfly",
    "id": "kupu-kupu"
  },
  {
    "cat": 7,
    "en": "bee",
    "id": "lebah"
  },
  {
    "cat": 7,
    "en": "ant",
    "id": "semut"
  },
  {
    "cat": 7,
    "en": "spider",
    "id": "laba-laba"
  },
  {
    "cat": 7,
    "en": "turtle",
    "id": "kura-kura"
  },
  {
    "cat": 7,
    "en": "whale",
    "id": "paus"
  },
  {
    "cat": 7,
    "en": "owl",
    "id": "burung hantu"
  },
  {
    "cat": 7,
    "en": "pet",
    "id": "hewan peliharaan"
  },
  {
    "cat": 7,
    "en": "insect",
    "id": "serangga"
  },
  {
    "cat": 8,
    "en": "house",
    "id": "rumah (bangunan)"
  },
  {
    "cat": 8,
    "en": "home",
    "id": "rumah (tempat tinggal)"
  },
  {
    "cat": 8,
    "en": "room",
    "id": "ruangan"
  },
  {
    "cat": 8,
    "en": "bedroom",
    "id": "kamar tidur"
  },
  {
    "cat": 8,
    "en": "bathroom",
    "id": "kamar mandi"
  },
  {
    "cat": 8,
    "en": "kitchen",
    "id": "dapur"
  },
  {
    "cat": 8,
    "en": "living room",
    "id": "ruang tamu"
  },
  {
    "cat": 8,
    "en": "garden",
    "id": "kebun"
  },
  {
    "cat": 8,
    "en": "door",
    "id": "pintu"
  },
  {
    "cat": 8,
    "en": "window",
    "id": "jendela"
  },
  {
    "cat": 8,
    "en": "wall",
    "id": "dinding"
  },
  {
    "cat": 8,
    "en": "floor",
    "id": "lantai"
  },
  {
    "cat": 8,
    "en": "roof",
    "id": "atap"
  },
  {
    "cat": 8,
    "en": "table",
    "id": "meja"
  },
  {
    "cat": 8,
    "en": "chair",
    "id": "kursi"
  },
  {
    "cat": 8,
    "en": "bed",
    "id": "tempat tidur"
  },
  {
    "cat": 8,
    "en": "sofa",
    "id": "sofa"
  },
  {
    "cat": 8,
    "en": "lamp",
    "id": "lampu"
  },
  {
    "cat": 8,
    "en": "television",
    "id": "televisi"
  },
  {
    "cat": 8,
    "en": "clock",
    "id": "jam dinding"
  },
  {
    "cat": 8,
    "en": "mirror",
    "id": "cermin"
  },
  {
    "cat": 8,
    "en": "key",
    "id": "kunci"
  },
  {
    "cat": 8,
    "en": "box",
    "id": "kotak"
  },
  {
    "cat": 8,
    "en": "blanket",
    "id": "selimut"
  },
  {
    "cat": 8,
    "en": "shower",
    "id": "pancuran / mandi"
  },
  {
    "cat": 8,
    "en": "toilet",
    "id": "toilet"
  },
  {
    "cat": 8,
    "en": "soap",
    "id": "sabun"
  },
  {
    "cat": 8,
    "en": "towel",
    "id": "handuk"
  },
  {
    "cat": 8,
    "en": "phone",
    "id": "telepon"
  },
  {
    "cat": 8,
    "en": "computer",
    "id": "komputer"
  },
  {
    "cat": 8,
    "en": "address",
    "id": "alamat"
  },
  {
    "cat": 8,
    "en": "stairs",
    "id": "tangga"
  },
  {
    "cat": 9,
    "en": "clothes",
    "id": "pakaian"
  },
  {
    "cat": 9,
    "en": "shirt",
    "id": "kemeja"
  },
  {
    "cat": 9,
    "en": "T-shirt",
    "id": "kaus"
  },
  {
    "cat": 9,
    "en": "pants",
    "id": "celana panjang"
  },
  {
    "cat": 9,
    "en": "jeans",
    "id": "jin"
  },
  {
    "cat": 9,
    "en": "dress",
    "id": "gaun"
  },
  {
    "cat": 9,
    "en": "skirt",
    "id": "rok"
  },
  {
    "cat": 9,
    "en": "jacket",
    "id": "jaket"
  },
  {
    "cat": 9,
    "en": "coat",
    "id": "mantel"
  },
  {
    "cat": 9,
    "en": "shoes",
    "id": "sepatu"
  },
  {
    "cat": 9,
    "en": "socks",
    "id": "kaus kaki"
  },
  {
    "cat": 9,
    "en": "hat",
    "id": "topi"
  },
  {
    "cat": 9,
    "en": "cap",
    "id": "topi baseball"
  },
  {
    "cat": 9,
    "en": "gloves",
    "id": "sarung tangan"
  },
  {
    "cat": 9,
    "en": "belt",
    "id": "ikat pinggang"
  },
  {
    "cat": 9,
    "en": "glasses",
    "id": "kacamata"
  },
  {
    "cat": 9,
    "en": "ring",
    "id": "cincin"
  },
  {
    "cat": 9,
    "en": "umbrella",
    "id": "payung"
  },
  {
    "cat": 9,
    "en": "bag",
    "id": "tas"
  },
  {
    "cat": 9,
    "en": "wallet",
    "id": "dompet"
  },
  {
    "cat": 9,
    "en": "pocket",
    "id": "saku"
  },
  {
    "cat": 9,
    "en": "uniform",
    "id": "seragam"
  },
  {
    "cat": 10,
    "en": "school",
    "id": "sekolah"
  },
  {
    "cat": 10,
    "en": "class",
    "id": "kelas"
  },
  {
    "cat": 10,
    "en": "teacher",
    "id": "guru"
  },
  {
    "cat": 10,
    "en": "student",
    "id": "murid"
  },
  {
    "cat": 10,
    "en": "lesson",
    "id": "pelajaran"
  },
  {
    "cat": 10,
    "en": "homework",
    "id": "pekerjaan rumah"
  },
  {
    "cat": 10,
    "en": "exam",
    "id": "ujian"
  },
  {
    "cat": 10,
    "en": "test",
    "id": "tes"
  },
  {
    "cat": 10,
    "en": "book",
    "id": "buku"
  },
  {
    "cat": 10,
    "en": "notebook",
    "id": "buku catatan"
  },
  {
    "cat": 10,
    "en": "pen",
    "id": "pena"
  },
  {
    "cat": 10,
    "en": "pencil",
    "id": "pensil"
  },
  {
    "cat": 10,
    "en": "eraser",
    "id": "penghapus"
  },
  {
    "cat": 10,
    "en": "ruler",
    "id": "penggaris"
  },
  {
    "cat": 10,
    "en": "paper",
    "id": "kertas"
  },
  {
    "cat": 10,
    "en": "board",
    "id": "papan tulis"
  },
  {
    "cat": 10,
    "en": "desk",
    "id": "meja belajar"
  },
  {
    "cat": 10,
    "en": "library",
    "id": "perpustakaan"
  },
  {
    "cat": 10,
    "en": "dictionary",
    "id": "kamus"
  },
  {
    "cat": 10,
    "en": "page",
    "id": "halaman"
  },
  {
    "cat": 10,
    "en": "letter",
    "id": "huruf / surat"
  },
  {
    "cat": 10,
    "en": "story",
    "id": "cerita"
  },
  {
    "cat": 10,
    "en": "office",
    "id": "kantor"
  },
  {
    "cat": 10,
    "en": "meeting",
    "id": "rapat"
  },
  {
    "cat": 10,
    "en": "email",
    "id": "surel"
  },
  {
    "cat": 11,
    "en": "job",
    "id": "pekerjaan"
  },
  {
    "cat": 11,
    "en": "doctor",
    "id": "dokter"
  },
  {
    "cat": 11,
    "en": "nurse",
    "id": "perawat"
  },
  {
    "cat": 11,
    "en": "driver",
    "id": "sopir"
  },
  {
    "cat": 11,
    "en": "farmer",
    "id": "petani"
  },
  {
    "cat": 11,
    "en": "chef",
    "id": "koki"
  },
  {
    "cat": 11,
    "en": "waiter",
    "id": "pelayan"
  },
  {
    "cat": 11,
    "en": "police officer",
    "id": "polisi"
  },
  {
    "cat": 11,
    "en": "firefighter",
    "id": "pemadam kebakaran"
  },
  {
    "cat": 11,
    "en": "pilot",
    "id": "pilot"
  },
  {
    "cat": 11,
    "en": "engineer",
    "id": "insinyur"
  },
  {
    "cat": 11,
    "en": "lawyer",
    "id": "pengacara"
  },
  {
    "cat": 11,
    "en": "artist",
    "id": "seniman"
  },
  {
    "cat": 11,
    "en": "singer",
    "id": "penyanyi"
  },
  {
    "cat": 11,
    "en": "actor",
    "id": "aktor"
  },
  {
    "cat": 11,
    "en": "writer",
    "id": "penulis"
  },
  {
    "cat": 11,
    "en": "manager",
    "id": "manajer"
  },
  {
    "cat": 11,
    "en": "boss",
    "id": "bos"
  },
  {
    "cat": 11,
    "en": "worker",
    "id": "pekerja"
  },
  {
    "cat": 11,
    "en": "dentist",
    "id": "dokter gigi"
  },
  {
    "cat": 12,
    "en": "city",
    "id": "kota"
  },
  {
    "cat": 12,
    "en": "town",
    "id": "kota kecil"
  },
  {
    "cat": 12,
    "en": "village",
    "id": "desa"
  },
  {
    "cat": 12,
    "en": "country",
    "id": "negara"
  },
  {
    "cat": 12,
    "en": "street",
    "id": "jalan (di kota)"
  },
  {
    "cat": 12,
    "en": "road",
    "id": "jalan raya"
  },
  {
    "cat": 12,
    "en": "building",
    "id": "gedung"
  },
  {
    "cat": 12,
    "en": "shop",
    "id": "toko"
  },
  {
    "cat": 12,
    "en": "supermarket",
    "id": "supermarket"
  },
  {
    "cat": 12,
    "en": "market",
    "id": "pasar"
  },
  {
    "cat": 12,
    "en": "bank",
    "id": "bank"
  },
  {
    "cat": 12,
    "en": "hospital",
    "id": "rumah sakit"
  },
  {
    "cat": 12,
    "en": "pharmacy",
    "id": "apotek"
  },
  {
    "cat": 12,
    "en": "hotel",
    "id": "hotel"
  },
  {
    "cat": 12,
    "en": "restaurant",
    "id": "restoran"
  },
  {
    "cat": 12,
    "en": "park",
    "id": "taman"
  },
  {
    "cat": 12,
    "en": "beach",
    "id": "pantai"
  },
  {
    "cat": 12,
    "en": "airport",
    "id": "bandara"
  },
  {
    "cat": 12,
    "en": "station",
    "id": "stasiun"
  },
  {
    "cat": 12,
    "en": "bridge",
    "id": "jembatan"
  },
  {
    "cat": 12,
    "en": "mosque",
    "id": "masjid"
  },
  {
    "cat": 12,
    "en": "church",
    "id": "gereja"
  },
  {
    "cat": 12,
    "en": "cinema",
    "id": "bioskop"
  },
  {
    "cat": 12,
    "en": "museum",
    "id": "museum"
  },
  {
    "cat": 12,
    "en": "zoo",
    "id": "kebun binatang"
  },
  {
    "cat": 12,
    "en": "farm",
    "id": "peternakan"
  },
  {
    "cat": 12,
    "en": "map",
    "id": "peta"
  },
  {
    "cat": 12,
    "en": "left",
    "id": "kiri"
  },
  {
    "cat": 12,
    "en": "right",
    "id": "kanan"
  },
  {
    "cat": 12,
    "en": "straight",
    "id": "lurus"
  },
  {
    "cat": 12,
    "en": "near",
    "id": "dekat"
  },
  {
    "cat": 12,
    "en": "far",
    "id": "jauh"
  },
  {
    "cat": 12,
    "en": "north",
    "id": "utara"
  },
  {
    "cat": 12,
    "en": "south",
    "id": "selatan"
  },
  {
    "cat": 13,
    "en": "car",
    "id": "mobil"
  },
  {
    "cat": 13,
    "en": "bus",
    "id": "bus"
  },
  {
    "cat": 13,
    "en": "train",
    "id": "kereta api"
  },
  {
    "cat": 13,
    "en": "plane",
    "id": "pesawat"
  },
  {
    "cat": 13,
    "en": "bicycle",
    "id": "sepeda"
  },
  {
    "cat": 13,
    "en": "motorcycle",
    "id": "sepeda motor"
  },
  {
    "cat": 13,
    "en": "taxi",
    "id": "taksi"
  },
  {
    "cat": 13,
    "en": "boat",
    "id": "perahu"
  },
  {
    "cat": 13,
    "en": "ship",
    "id": "kapal"
  },
  {
    "cat": 13,
    "en": "truck",
    "id": "truk"
  },
  {
    "cat": 13,
    "en": "ticket",
    "id": "tiket"
  },
  {
    "cat": 13,
    "en": "trip",
    "id": "perjalanan singkat"
  },
  {
    "cat": 13,
    "en": "passport",
    "id": "paspor"
  },
  {
    "cat": 13,
    "en": "traffic",
    "id": "lalu lintas"
  },
  {
    "cat": 13,
    "en": "flight",
    "id": "penerbangan"
  },
  {
    "cat": 13,
    "en": "engine",
    "id": "mesin"
  },
  {
    "cat": 14,
    "en": "weather",
    "id": "cuaca"
  },
  {
    "cat": 14,
    "en": "sun",
    "id": "matahari"
  },
  {
    "cat": 14,
    "en": "moon",
    "id": "bulan (di langit)"
  },
  {
    "cat": 14,
    "en": "star",
    "id": "bintang"
  },
  {
    "cat": 14,
    "en": "sky",
    "id": "langit"
  },
  {
    "cat": 14,
    "en": "cloud",
    "id": "awan"
  },
  {
    "cat": 14,
    "en": "rain",
    "id": "hujan"
  },
  {
    "cat": 14,
    "en": "wind",
    "id": "angin"
  },
  {
    "cat": 14,
    "en": "snow",
    "id": "salju"
  },
  {
    "cat": 14,
    "en": "storm",
    "id": "badai"
  },
  {
    "cat": 14,
    "en": "tree",
    "id": "pohon"
  },
  {
    "cat": 14,
    "en": "flower",
    "id": "bunga"
  },
  {
    "cat": 14,
    "en": "grass",
    "id": "rumput"
  },
  {
    "cat": 14,
    "en": "leaf",
    "id": "daun"
  },
  {
    "cat": 14,
    "en": "river",
    "id": "sungai"
  },
  {
    "cat": 14,
    "en": "lake",
    "id": "danau"
  },
  {
    "cat": 14,
    "en": "sea",
    "id": "laut"
  },
  {
    "cat": 14,
    "en": "mountain",
    "id": "gunung"
  },
  {
    "cat": 14,
    "en": "forest",
    "id": "hutan"
  },
  {
    "cat": 14,
    "en": "island",
    "id": "pulau"
  },
  {
    "cat": 14,
    "en": "fire",
    "id": "api"
  },
  {
    "cat": 14,
    "en": "earth",
    "id": "bumi"
  },
  {
    "cat": 14,
    "en": "air",
    "id": "udara"
  },
  {
    "cat": 14,
    "en": "world",
    "id": "dunia"
  },
  {
    "cat": 15,
    "en": "time",
    "id": "waktu"
  },
  {
    "cat": 15,
    "en": "day",
    "id": "hari"
  },
  {
    "cat": 15,
    "en": "week",
    "id": "pekan (7 hari)"
  },
  {
    "cat": 15,
    "en": "month",
    "id": "bulan (kalender)"
  },
  {
    "cat": 15,
    "en": "year",
    "id": "tahun"
  },
  {
    "cat": 15,
    "en": "today",
    "id": "hari ini"
  },
  {
    "cat": 15,
    "en": "tomorrow",
    "id": "besok"
  },
  {
    "cat": 15,
    "en": "yesterday",
    "id": "kemarin"
  },
  {
    "cat": 15,
    "en": "morning",
    "id": "pagi"
  },
  {
    "cat": 15,
    "en": "afternoon",
    "id": "siang / sore"
  },
  {
    "cat": 15,
    "en": "evening",
    "id": "sore menjelang malam"
  },
  {
    "cat": 15,
    "en": "night",
    "id": "malam"
  },
  {
    "cat": 15,
    "en": "hour",
    "id": "jam (satuan waktu)"
  },
  {
    "cat": 15,
    "en": "minute",
    "id": "menit"
  },
  {
    "cat": 15,
    "en": "Monday",
    "id": "Senin"
  },
  {
    "cat": 15,
    "en": "Tuesday",
    "id": "Selasa"
  },
  {
    "cat": 15,
    "en": "Wednesday",
    "id": "Rabu"
  },
  {
    "cat": 15,
    "en": "Thursday",
    "id": "Kamis"
  },
  {
    "cat": 15,
    "en": "Friday",
    "id": "Jumat"
  },
  {
    "cat": 15,
    "en": "Saturday",
    "id": "Sabtu"
  },
  {
    "cat": 15,
    "en": "Sunday",
    "id": "Minggu (nama hari)"
  },
  {
    "cat": 15,
    "en": "January",
    "id": "Januari"
  },
  {
    "cat": 15,
    "en": "February",
    "id": "Februari"
  },
  {
    "cat": 15,
    "en": "March",
    "id": "Maret"
  },
  {
    "cat": 15,
    "en": "April",
    "id": "April"
  },
  {
    "cat": 15,
    "en": "May",
    "id": "Mei"
  },
  {
    "cat": 15,
    "en": "June",
    "id": "Juni"
  },
  {
    "cat": 15,
    "en": "July",
    "id": "Juli"
  },
  {
    "cat": 15,
    "en": "August",
    "id": "Agustus"
  },
  {
    "cat": 15,
    "en": "September",
    "id": "September"
  },
  {
    "cat": 15,
    "en": "October",
    "id": "Oktober"
  },
  {
    "cat": 15,
    "en": "November",
    "id": "November"
  },
  {
    "cat": 15,
    "en": "December",
    "id": "Desember"
  },
  {
    "cat": 15,
    "en": "weekend",
    "id": "akhir pekan"
  },
  {
    "cat": 15,
    "en": "birthday",
    "id": "ulang tahun"
  },
  {
    "cat": 15,
    "en": "holiday",
    "id": "hari libur"
  },
  {
    "cat": 15,
    "en": "summer",
    "id": "musim panas"
  },
  {
    "cat": 15,
    "en": "winter",
    "id": "musim dingin"
  },
  {
    "cat": 15,
    "en": "season",
    "id": "musim"
  },
  {
    "cat": 15,
    "en": "date",
    "id": "tanggal"
  },
  {
    "cat": 16,
    "en": "be",
    "id": "adalah / berada"
  },
  {
    "cat": 16,
    "en": "have",
    "id": "punya"
  },
  {
    "cat": 16,
    "en": "do",
    "id": "melakukan"
  },
  {
    "cat": 16,
    "en": "go",
    "id": "pergi"
  },
  {
    "cat": 16,
    "en": "come",
    "id": "datang"
  },
  {
    "cat": 16,
    "en": "eat",
    "id": "makan"
  },
  {
    "cat": 16,
    "en": "drink",
    "id": "minum"
  },
  {
    "cat": 16,
    "en": "sleep",
    "id": "tidur"
  },
  {
    "cat": 16,
    "en": "wake up",
    "id": "bangun"
  },
  {
    "cat": 16,
    "en": "walk",
    "id": "berjalan"
  },
  {
    "cat": 16,
    "en": "run",
    "id": "berlari"
  },
  {
    "cat": 16,
    "en": "jump",
    "id": "melompat"
  },
  {
    "cat": 16,
    "en": "sit",
    "id": "duduk"
  },
  {
    "cat": 16,
    "en": "stand",
    "id": "berdiri"
  },
  {
    "cat": 16,
    "en": "read",
    "id": "membaca"
  },
  {
    "cat": 16,
    "en": "write",
    "id": "menulis"
  },
  {
    "cat": 16,
    "en": "speak",
    "id": "berbicara"
  },
  {
    "cat": 16,
    "en": "talk",
    "id": "mengobrol"
  },
  {
    "cat": 16,
    "en": "say",
    "id": "berkata"
  },
  {
    "cat": 16,
    "en": "ask",
    "id": "bertanya"
  },
  {
    "cat": 16,
    "en": "answer",
    "id": "menjawab"
  },
  {
    "cat": 16,
    "en": "listen",
    "id": "mendengarkan"
  },
  {
    "cat": 16,
    "en": "hear",
    "id": "mendengar"
  },
  {
    "cat": 16,
    "en": "see",
    "id": "melihat"
  },
  {
    "cat": 16,
    "en": "look",
    "id": "memandang"
  },
  {
    "cat": 16,
    "en": "watch",
    "id": "menonton"
  },
  {
    "cat": 16,
    "en": "think",
    "id": "berpikir"
  },
  {
    "cat": 16,
    "en": "know",
    "id": "tahu"
  },
  {
    "cat": 16,
    "en": "learn",
    "id": "belajar"
  },
  {
    "cat": 16,
    "en": "teach",
    "id": "mengajar"
  },
  {
    "cat": 16,
    "en": "understand",
    "id": "mengerti"
  },
  {
    "cat": 16,
    "en": "remember",
    "id": "mengingat"
  },
  {
    "cat": 16,
    "en": "forget",
    "id": "lupa"
  },
  {
    "cat": 16,
    "en": "like",
    "id": "suka"
  },
  {
    "cat": 16,
    "en": "love",
    "id": "mencintai"
  },
  {
    "cat": 16,
    "en": "want",
    "id": "ingin"
  },
  {
    "cat": 16,
    "en": "need",
    "id": "butuh"
  },
  {
    "cat": 16,
    "en": "give",
    "id": "memberi"
  },
  {
    "cat": 16,
    "en": "take",
    "id": "mengambil"
  },
  {
    "cat": 16,
    "en": "bring",
    "id": "membawa"
  },
  {
    "cat": 16,
    "en": "buy",
    "id": "membeli"
  },
  {
    "cat": 16,
    "en": "sell",
    "id": "menjual"
  },
  {
    "cat": 16,
    "en": "pay",
    "id": "membayar"
  },
  {
    "cat": 16,
    "en": "open",
    "id": "membuka"
  },
  {
    "cat": 16,
    "en": "close",
    "id": "menutup"
  },
  {
    "cat": 16,
    "en": "start",
    "id": "mulai"
  },
  {
    "cat": 16,
    "en": "stop",
    "id": "berhenti"
  },
  {
    "cat": 16,
    "en": "finish",
    "id": "selesai"
  },
  {
    "cat": 16,
    "en": "wait",
    "id": "menunggu"
  },
  {
    "cat": 16,
    "en": "meet",
    "id": "bertemu"
  },
  {
    "cat": 16,
    "en": "play",
    "id": "bermain"
  },
  {
    "cat": 16,
    "en": "sing",
    "id": "bernyanyi"
  },
  {
    "cat": 16,
    "en": "dance",
    "id": "menari"
  },
  {
    "cat": 16,
    "en": "swim",
    "id": "berenang"
  },
  {
    "cat": 16,
    "en": "drive",
    "id": "mengemudi"
  },
  {
    "cat": 16,
    "en": "fly",
    "id": "terbang"
  },
  {
    "cat": 16,
    "en": "cook",
    "id": "memasak"
  },
  {
    "cat": 16,
    "en": "wash",
    "id": "mencuci"
  },
  {
    "cat": 16,
    "en": "make",
    "id": "membuat"
  },
  {
    "cat": 16,
    "en": "draw",
    "id": "menggambar"
  },
  {
    "cat": 16,
    "en": "call",
    "id": "menelepon"
  },
  {
    "cat": 16,
    "en": "send",
    "id": "mengirim"
  },
  {
    "cat": 16,
    "en": "wear",
    "id": "memakai"
  },
  {
    "cat": 16,
    "en": "put",
    "id": "meletakkan"
  },
  {
    "cat": 16,
    "en": "use",
    "id": "menggunakan"
  },
  {
    "cat": 16,
    "en": "find",
    "id": "menemukan"
  },
  {
    "cat": 16,
    "en": "help",
    "id": "membantu"
  },
  {
    "cat": 16,
    "en": "try",
    "id": "mencoba"
  },
  {
    "cat": 16,
    "en": "work",
    "id": "bekerja"
  },
  {
    "cat": 16,
    "en": "live",
    "id": "tinggal / hidup"
  },
  {
    "cat": 16,
    "en": "laugh",
    "id": "tertawa"
  },
  {
    "cat": 16,
    "en": "cry",
    "id": "menangis"
  },
  {
    "cat": 16,
    "en": "smile",
    "id": "tersenyum"
  },
  {
    "cat": 16,
    "en": "tell",
    "id": "memberi tahu"
  },
  {
    "cat": 16,
    "en": "feel",
    "id": "merasa"
  },
  {
    "cat": 16,
    "en": "study",
    "id": "mempelajari"
  },
  {
    "cat": 16,
    "en": "climb",
    "id": "memanjat"
  },
  {
    "cat": 16,
    "en": "fall",
    "id": "jatuh"
  },
  {
    "cat": 16,
    "en": "visit",
    "id": "mengunjungi"
  },
  {
    "cat": 16,
    "en": "travel",
    "id": "bepergian"
  },
  {
    "cat": 17,
    "en": "big",
    "id": "besar"
  },
  {
    "cat": 17,
    "en": "small",
    "id": "kecil"
  },
  {
    "cat": 17,
    "en": "tall",
    "id": "tinggi (orang)"
  },
  {
    "cat": 17,
    "en": "short",
    "id": "pendek"
  },
  {
    "cat": 17,
    "en": "long",
    "id": "panjang"
  },
  {
    "cat": 17,
    "en": "fat",
    "id": "gemuk"
  },
  {
    "cat": 17,
    "en": "thin",
    "id": "kurus"
  },
  {
    "cat": 17,
    "en": "old",
    "id": "tua"
  },
  {
    "cat": 17,
    "en": "young",
    "id": "muda"
  },
  {
    "cat": 17,
    "en": "new",
    "id": "baru"
  },
  {
    "cat": 17,
    "en": "good",
    "id": "bagus"
  },
  {
    "cat": 17,
    "en": "bad",
    "id": "buruk"
  },
  {
    "cat": 17,
    "en": "nice",
    "id": "menyenangkan"
  },
  {
    "cat": 17,
    "en": "beautiful",
    "id": "cantik / indah"
  },
  {
    "cat": 17,
    "en": "ugly",
    "id": "jelek"
  },
  {
    "cat": 17,
    "en": "happy",
    "id": "senang"
  },
  {
    "cat": 17,
    "en": "sad",
    "id": "sedih"
  },
  {
    "cat": 17,
    "en": "angry",
    "id": "marah"
  },
  {
    "cat": 17,
    "en": "tired",
    "id": "lelah"
  },
  {
    "cat": 17,
    "en": "hungry",
    "id": "lapar"
  },
  {
    "cat": 17,
    "en": "thirsty",
    "id": "haus"
  },
  {
    "cat": 17,
    "en": "sick",
    "id": "sakit"
  },
  {
    "cat": 17,
    "en": "hot",
    "id": "panas"
  },
  {
    "cat": 17,
    "en": "cold",
    "id": "dingin"
  },
  {
    "cat": 17,
    "en": "warm",
    "id": "hangat"
  },
  {
    "cat": 17,
    "en": "wet",
    "id": "basah"
  },
  {
    "cat": 17,
    "en": "dry",
    "id": "kering"
  },
  {
    "cat": 17,
    "en": "clean",
    "id": "bersih"
  },
  {
    "cat": 17,
    "en": "dirty",
    "id": "kotor"
  },
  {
    "cat": 17,
    "en": "fast",
    "id": "cepat"
  },
  {
    "cat": 17,
    "en": "slow",
    "id": "lambat"
  },
  {
    "cat": 17,
    "en": "easy",
    "id": "mudah"
  },
  {
    "cat": 17,
    "en": "difficult",
    "id": "sulit"
  },
  {
    "cat": 17,
    "en": "hard",
    "id": "keras (tidak lunak)"
  },
  {
    "cat": 17,
    "en": "soft",
    "id": "lembut"
  },
  {
    "cat": 17,
    "en": "heavy",
    "id": "berat"
  },
  {
    "cat": 17,
    "en": "light",
    "id": "ringan"
  },
  {
    "cat": 17,
    "en": "strong",
    "id": "kuat"
  },
  {
    "cat": 17,
    "en": "weak",
    "id": "lemah"
  },
  {
    "cat": 17,
    "en": "rich",
    "id": "kaya"
  },
  {
    "cat": 17,
    "en": "poor",
    "id": "miskin"
  },
  {
    "cat": 17,
    "en": "cheap",
    "id": "murah"
  },
  {
    "cat": 17,
    "en": "expensive",
    "id": "mahal"
  },
  {
    "cat": 17,
    "en": "full",
    "id": "penuh"
  },
  {
    "cat": 17,
    "en": "empty",
    "id": "kosong"
  },
  {
    "cat": 17,
    "en": "correct",
    "id": "benar"
  },
  {
    "cat": 17,
    "en": "wrong",
    "id": "salah"
  },
  {
    "cat": 17,
    "en": "same",
    "id": "sama"
  },
  {
    "cat": 17,
    "en": "different",
    "id": "berbeda"
  },
  {
    "cat": 17,
    "en": "important",
    "id": "penting"
  },
  {
    "cat": 17,
    "en": "interesting",
    "id": "menarik"
  },
  {
    "cat": 17,
    "en": "boring",
    "id": "membosankan"
  },
  {
    "cat": 17,
    "en": "funny",
    "id": "lucu"
  },
  {
    "cat": 17,
    "en": "kind",
    "id": "baik hati"
  },
  {
    "cat": 17,
    "en": "busy",
    "id": "sibuk"
  },
  {
    "cat": 17,
    "en": "free",
    "id": "gratis / bebas"
  },
  {
    "cat": 17,
    "en": "quiet",
    "id": "tenang"
  },
  {
    "cat": 17,
    "en": "loud",
    "id": "nyaring"
  },
  {
    "cat": 17,
    "en": "dark",
    "id": "gelap"
  },
  {
    "cat": 17,
    "en": "early",
    "id": "awal"
  },
  {
    "cat": 17,
    "en": "late",
    "id": "terlambat"
  },
  {
    "cat": 17,
    "en": "ready",
    "id": "siap"
  },
  {
    "cat": 17,
    "en": "safe",
    "id": "aman"
  },
  {
    "cat": 17,
    "en": "dangerous",
    "id": "berbahaya"
  },
  {
    "cat": 17,
    "en": "sweet",
    "id": "manis (rasa)"
  },
  {
    "cat": 17,
    "en": "spicy",
    "id": "pedas"
  },
  {
    "cat": 17,
    "en": "delicious",
    "id": "lezat"
  },
  {
    "cat": 17,
    "en": "fresh",
    "id": "segar"
  },
  {
    "cat": 17,
    "en": "high",
    "id": "tinggi (benda)"
  },
  {
    "cat": 17,
    "en": "low",
    "id": "rendah"
  },
  {
    "cat": 18,
    "en": "what",
    "id": "apa"
  },
  {
    "cat": 18,
    "en": "who",
    "id": "siapa"
  },
  {
    "cat": 18,
    "en": "where",
    "id": "di mana"
  },
  {
    "cat": 18,
    "en": "when",
    "id": "kapan"
  },
  {
    "cat": 18,
    "en": "why",
    "id": "mengapa"
  },
  {
    "cat": 18,
    "en": "how",
    "id": "bagaimana"
  },
  {
    "cat": 18,
    "en": "which",
    "id": "yang mana"
  },
  {
    "cat": 18,
    "en": "how much",
    "id": "berapa (harga / jumlah)"
  },
  {
    "cat": 18,
    "en": "how many",
    "id": "berapa banyak (bisa dihitung)"
  },
  {
    "cat": 18,
    "en": "in",
    "id": "di (dalam ruang / waktu)"
  },
  {
    "cat": 18,
    "en": "on",
    "id": "pada (permukaan)"
  },
  {
    "cat": 18,
    "en": "at",
    "id": "di (titik tempat)"
  },
  {
    "cat": 18,
    "en": "to",
    "id": "ke"
  },
  {
    "cat": 18,
    "en": "from",
    "id": "dari"
  },
  {
    "cat": 18,
    "en": "with",
    "id": "dengan"
  },
  {
    "cat": 18,
    "en": "without",
    "id": "tanpa"
  },
  {
    "cat": 18,
    "en": "for",
    "id": "untuk"
  },
  {
    "cat": 18,
    "en": "of",
    "id": "milik / dari (hubungan)"
  },
  {
    "cat": 18,
    "en": "about",
    "id": "tentang"
  },
  {
    "cat": 18,
    "en": "by",
    "id": "oleh"
  },
  {
    "cat": 18,
    "en": "under",
    "id": "di bawah"
  },
  {
    "cat": 18,
    "en": "between",
    "id": "di antara"
  },
  {
    "cat": 18,
    "en": "behind",
    "id": "di belakang"
  },
  {
    "cat": 18,
    "en": "in front of",
    "id": "di depan"
  },
  {
    "cat": 18,
    "en": "next to",
    "id": "di sebelah"
  },
  {
    "cat": 18,
    "en": "inside",
    "id": "di dalam (bagian dalam)"
  },
  {
    "cat": 18,
    "en": "outside",
    "id": "di luar"
  },
  {
    "cat": 18,
    "en": "up",
    "id": "ke atas"
  },
  {
    "cat": 18,
    "en": "down",
    "id": "ke bawah"
  },
  {
    "cat": 18,
    "en": "before",
    "id": "sebelum"
  },
  {
    "cat": 18,
    "en": "after",
    "id": "setelah"
  },
  {
    "cat": 18,
    "en": "until",
    "id": "sampai"
  },
  {
    "cat": 18,
    "en": "and",
    "id": "dan"
  },
  {
    "cat": 18,
    "en": "or",
    "id": "atau"
  },
  {
    "cat": 18,
    "en": "but",
    "id": "tetapi"
  },
  {
    "cat": 18,
    "en": "because",
    "id": "karena"
  },
  {
    "cat": 18,
    "en": "if",
    "id": "jika"
  },
  {
    "cat": 18,
    "en": "so",
    "id": "jadi"
  },
  {
    "cat": 18,
    "en": "then",
    "id": "kemudian"
  },
  {
    "cat": 18,
    "en": "also",
    "id": "juga"
  },
  {
    "cat": 19,
    "en": "I",
    "id": "saya"
  },
  {
    "cat": 19,
    "en": "you",
    "id": "kamu"
  },
  {
    "cat": 19,
    "en": "he",
    "id": "dia (laki-laki)"
  },
  {
    "cat": 19,
    "en": "she",
    "id": "dia (perempuan)"
  },
  {
    "cat": 19,
    "en": "it",
    "id": "ia (benda / hewan)"
  },
  {
    "cat": 19,
    "en": "we",
    "id": "kami / kita"
  },
  {
    "cat": 19,
    "en": "they",
    "id": "mereka"
  },
  {
    "cat": 19,
    "en": "me",
    "id": "saya (sebagai objek)"
  },
  {
    "cat": 19,
    "en": "him",
    "id": "dia (objek, laki-laki)"
  },
  {
    "cat": 19,
    "en": "her",
    "id": "dia (objek, perempuan)"
  },
  {
    "cat": 19,
    "en": "us",
    "id": "kami (sebagai objek)"
  },
  {
    "cat": 19,
    "en": "them",
    "id": "mereka (sebagai objek)"
  },
  {
    "cat": 19,
    "en": "my",
    "id": "milikku"
  },
  {
    "cat": 19,
    "en": "your",
    "id": "milikmu"
  },
  {
    "cat": 19,
    "en": "his",
    "id": "miliknya (laki-laki)"
  },
  {
    "cat": 19,
    "en": "our",
    "id": "milik kita"
  },
  {
    "cat": 19,
    "en": "their",
    "id": "milik mereka"
  },
  {
    "cat": 19,
    "en": "this",
    "id": "ini"
  },
  {
    "cat": 19,
    "en": "that",
    "id": "itu"
  },
  {
    "cat": 19,
    "en": "these",
    "id": "ini (jamak)"
  },
  {
    "cat": 19,
    "en": "those",
    "id": "itu (jamak)"
  },
  {
    "cat": 19,
    "en": "a",
    "id": "sebuah"
  },
  {
    "cat": 19,
    "en": "the",
    "id": "itu (kata sandang tertentu)"
  },
  {
    "cat": 19,
    "en": "some",
    "id": "beberapa"
  },
  {
    "cat": 19,
    "en": "many",
    "id": "banyak (bisa dihitung)"
  },
  {
    "cat": 19,
    "en": "much",
    "id": "banyak (tak terhitung)"
  },
  {
    "cat": 19,
    "en": "all",
    "id": "semua"
  },
  {
    "cat": 19,
    "en": "something",
    "id": "sesuatu"
  },
  {
    "cat": 19,
    "en": "nothing",
    "id": "tidak ada apa-apa"
  },
  {
    "cat": 19,
    "en": "everyone",
    "id": "semua orang"
  },
  {
    "cat": 20,
    "en": "very",
    "id": "sangat"
  },
  {
    "cat": 20,
    "en": "really",
    "id": "benar-benar"
  },
  {
    "cat": 20,
    "en": "always",
    "id": "selalu"
  },
  {
    "cat": 20,
    "en": "usually",
    "id": "biasanya"
  },
  {
    "cat": 20,
    "en": "often",
    "id": "sering"
  },
  {
    "cat": 20,
    "en": "sometimes",
    "id": "kadang-kadang"
  },
  {
    "cat": 20,
    "en": "never",
    "id": "tidak pernah"
  },
  {
    "cat": 20,
    "en": "now",
    "id": "sekarang"
  },
  {
    "cat": 20,
    "en": "soon",
    "id": "segera"
  },
  {
    "cat": 20,
    "en": "already",
    "id": "sudah"
  },
  {
    "cat": 20,
    "en": "still",
    "id": "masih"
  },
  {
    "cat": 20,
    "en": "only",
    "id": "hanya"
  },
  {
    "cat": 20,
    "en": "maybe",
    "id": "mungkin"
  },
  {
    "cat": 20,
    "en": "here",
    "id": "di sini"
  },
  {
    "cat": 20,
    "en": "there",
    "id": "di sana"
  },
  {
    "cat": 20,
    "en": "together",
    "id": "bersama-sama"
  },
  {
    "cat": 20,
    "en": "alone",
    "id": "sendirian"
  },
  {
    "cat": 20,
    "en": "well",
    "id": "dengan baik"
  },
  {
    "cat": 20,
    "en": "quickly",
    "id": "dengan cepat"
  },
  {
    "cat": 20,
    "en": "slowly",
    "id": "dengan lambat"
  },
  {
    "cat": 20,
    "en": "again",
    "id": "lagi"
  },
  {
    "cat": 20,
    "en": "enough",
    "id": "cukup"
  },
  {
    "cat": 21,
    "en": "hobby",
    "id": "hobi"
  },
  {
    "cat": 21,
    "en": "sport",
    "id": "olahraga"
  },
  {
    "cat": 21,
    "en": "football",
    "id": "sepak bola"
  },
  {
    "cat": 21,
    "en": "basketball",
    "id": "bola basket"
  },
  {
    "cat": 21,
    "en": "badminton",
    "id": "bulu tangkis"
  },
  {
    "cat": 21,
    "en": "tennis",
    "id": "tenis"
  },
  {
    "cat": 21,
    "en": "swimming",
    "id": "renang"
  },
  {
    "cat": 21,
    "en": "music",
    "id": "musik"
  },
  {
    "cat": 21,
    "en": "song",
    "id": "lagu"
  },
  {
    "cat": 21,
    "en": "guitar",
    "id": "gitar"
  },
  {
    "cat": 21,
    "en": "movie",
    "id": "film"
  },
  {
    "cat": 21,
    "en": "game",
    "id": "permainan"
  },
  {
    "cat": 21,
    "en": "photo",
    "id": "foto"
  },
  {
    "cat": 21,
    "en": "camera",
    "id": "kamera"
  },
  {
    "cat": 21,
    "en": "team",
    "id": "tim"
  },
  {
    "cat": 21,
    "en": "ball",
    "id": "bola"
  },
  {
    "cat": 21,
    "en": "party",
    "id": "pesta"
  },
  {
    "cat": 21,
    "en": "gift",
    "id": "hadiah"
  },
  {
    "cat": 21,
    "en": "toy",
    "id": "mainan"
  },
  {
    "cat": 21,
    "en": "picture",
    "id": "gambar"
  },
  {
    "cat": 22,
    "en": "money",
    "id": "uang"
  },
  {
    "cat": 22,
    "en": "price",
    "id": "harga"
  },
  {
    "cat": 22,
    "en": "coin",
    "id": "koin"
  },
  {
    "cat": 22,
    "en": "cash",
    "id": "uang tunai"
  },
  {
    "cat": 22,
    "en": "card",
    "id": "kartu"
  },
  {
    "cat": 22,
    "en": "change",
    "id": "uang kembalian"
  },
  {
    "cat": 22,
    "en": "discount",
    "id": "diskon"
  },
  {
    "cat": 22,
    "en": "sale",
    "id": "obral"
  },
  {
    "cat": 22,
    "en": "customer",
    "id": "pelanggan"
  },
  {
    "cat": 22,
    "en": "receipt",
    "id": "struk"
  },
  {
    "cat": 22,
    "en": "basket",
    "id": "keranjang"
  },
  {
    "cat": 22,
    "en": "bill",
    "id": "tagihan"
  },
  {
    "cat": 22,
    "en": "dollar",
    "id": "dolar"
  },
  {
    "cat": 22,
    "en": "health",
    "id": "kesehatan"
  },
  {
    "cat": 22,
    "en": "medicine",
    "id": "obat"
  },
  {
    "cat": 22,
    "en": "pain",
    "id": "rasa sakit"
  },
  {
    "cat": 22,
    "en": "headache",
    "id": "sakit kepala"
  },
  {
    "cat": 22,
    "en": "fever",
    "id": "demam"
  },
  {
    "cat": 22,
    "en": "cough",
    "id": "batuk"
  },
  {
    "cat": 22,
    "en": "pill",
    "id": "pil"
  },
  {
    "cat": 22,
    "en": "exercise",
    "id": "latihan fisik"
  },
  {
    "cat": 22,
    "en": "diet",
    "id": "pola makan"
  },
  {
    "cat": 23,
    "en": "can",
    "id": "bisa / dapat"
  },
  {
    "cat": 23,
    "en": "will",
    "id": "akan"
  },
  {
    "cat": 23,
    "en": "must",
    "id": "harus"
  },
  {
    "cat": 23,
    "en": "should",
    "id": "sebaiknya"
  },
  {
    "cat": 23,
    "en": "not",
    "id": "bukan / tidak (kata ingkar)"
  },
  {
    "cat": 23,
    "en": "than",
    "id": "daripada"
  },
  {
    "cat": 23,
    "en": "too",
    "id": "terlalu / juga (di akhir kalimat)"
  },
  {
    "cat": 23,
    "en": "other",
    "id": "lain"
  },
  {
    "cat": 23,
    "en": "every",
    "id": "setiap"
  },
  {
    "cat": 23,
    "en": "each",
    "id": "masing-masing"
  },
  {
    "cat": 23,
    "en": "another",
    "id": "satu lagi"
  },
  {
    "cat": 23,
    "en": "both",
    "id": "keduanya"
  },
  {
    "cat": 23,
    "en": "its",
    "id": "miliknya (benda)"
  },
  {
    "cat": 23,
    "en": "once",
    "id": "sekali"
  },
  {
    "cat": 23,
    "en": "however",
    "id": "namun"
  },
  {
    "cat": 23,
    "en": "around",
    "id": "sekitar"
  },
  {
    "cat": 23,
    "en": "best",
    "id": "terbaik"
  },
  {
    "cat": 23,
    "en": "least",
    "id": "paling sedikit"
  },
  {
    "cat": 23,
    "en": "more",
    "id": "lebih banyak"
  },
  {
    "cat": 23,
    "en": "less",
    "id": "lebih sedikit"
  },
  {
    "cat": 23,
    "en": "most",
    "id": "paling banyak"
  },
  {
    "cat": 23,
    "en": "few",
    "id": "sedikit (bisa dihitung)"
  },
  {
    "cat": 23,
    "en": "little",
    "id": "sedikit (tak terhitung)"
  },
  {
    "cat": 23,
    "en": "almost",
    "id": "hampir"
  },
  {
    "cat": 23,
    "en": "just",
    "id": "baru saja"
  },
  {
    "cat": 23,
    "en": "ago",
    "id": "yang lalu"
  },
  {
    "cat": 23,
    "en": "away",
    "id": "pergi (menjauh)"
  },
  {
    "cat": 23,
    "en": "everywhere",
    "id": "di mana-mana"
  },
  {
    "cat": 23,
    "en": "sure",
    "id": "yakin"
  },
  {
    "cat": 23,
    "en": "get",
    "id": "mendapatkan / menjadi"
  },
  {
    "cat": 23,
    "en": "great",
    "id": "hebat"
  },
  {
    "cat": 23,
    "en": "thing",
    "id": "benda / hal"
  },
  {
    "cat": 23,
    "en": "place",
    "id": "tempat"
  },
  {
    "cat": 23,
    "en": "way",
    "id": "cara"
  },
  {
    "cat": 23,
    "en": "life",
    "id": "kehidupan"
  },
  {
    "cat": 23,
    "en": "side",
    "id": "sisi"
  },
  {
    "cat": 23,
    "en": "let's",
    "id": "mari"
  },
  {
    "cat": 24,
    "en": "gold",
    "id": "emas"
  },
  {
    "cat": 24,
    "en": "silver",
    "id": "perak"
  },
  {
    "cat": 24,
    "en": "cousin",
    "id": "sepupu"
  },
  {
    "cat": 24,
    "en": "million",
    "id": "sejuta"
  },
  {
    "cat": 24,
    "en": "sixty",
    "id": "enam puluh"
  },
  {
    "cat": 24,
    "en": "seventy",
    "id": "tujuh puluh"
  },
  {
    "cat": 24,
    "en": "eighty",
    "id": "delapan puluh"
  },
  {
    "cat": 24,
    "en": "ninety",
    "id": "sembilan puluh"
  },
  {
    "cat": 24,
    "en": "half",
    "id": "setengah"
  },
  {
    "cat": 24,
    "en": "noon",
    "id": "tengah hari"
  },
  {
    "cat": 24,
    "en": "midnight",
    "id": "tengah malam"
  },
  {
    "cat": 24,
    "en": "spring",
    "id": "musim semi"
  },
  {
    "cat": 24,
    "en": "autumn",
    "id": "musim gugur"
  },
  {
    "cat": 24,
    "en": "beard",
    "id": "jenggot"
  },
  {
    "cat": 24,
    "en": "cheek",
    "id": "pipi"
  },
  {
    "cat": 24,
    "en": "toe",
    "id": "jari kaki"
  },
  {
    "cat": 24,
    "en": "east",
    "id": "timur"
  },
  {
    "cat": 24,
    "en": "west",
    "id": "barat"
  },
  {
    "cat": 24,
    "en": "temple",
    "id": "kuil"
  },
  {
    "cat": 24,
    "en": "bus stop",
    "id": "halte bus"
  },
  {
    "cat": 24,
    "en": "post office",
    "id": "kantor pos"
  },
  {
    "cat": 25,
    "en": "listening",
    "id": "kemampuan mendengar"
  },
  {
    "cat": 25,
    "en": "reading",
    "id": "kemampuan membaca"
  },
  {
    "cat": 25,
    "en": "writing",
    "id": "kemampuan menulis"
  },
  {
    "cat": 25,
    "en": "speaking",
    "id": "kemampuan berbicara"
  },
  {
    "cat": 25,
    "en": "section",
    "id": "bagian tes"
  },
  {
    "cat": 25,
    "en": "passage",
    "id": "bacaan"
  },
  {
    "cat": 25,
    "en": "examiner",
    "id": "penguji"
  },
  {
    "cat": 25,
    "en": "score",
    "id": "skor"
  },
  {
    "cat": 25,
    "en": "true",
    "id": "benar (sesuai fakta)"
  },
  {
    "cat": 25,
    "en": "false",
    "id": "keliru (tidak sesuai fakta)"
  },
  {
    "cat": 25,
    "en": "choose",
    "id": "memilih"
  },
  {
    "cat": 25,
    "en": "choice",
    "id": "pilihan"
  },
  {
    "cat": 25,
    "en": "match",
    "id": "mencocokkan"
  },
  {
    "cat": 25,
    "en": "describe",
    "id": "menggambarkan"
  },
  {
    "cat": 25,
    "en": "explain",
    "id": "menjelaskan"
  },
  {
    "cat": 25,
    "en": "show",
    "id": "menunjukkan"
  },
  {
    "cat": 25,
    "en": "chart",
    "id": "grafik / bagan"
  },
  {
    "cat": 25,
    "en": "sentence",
    "id": "kalimat"
  },
  {
    "cat": 25,
    "en": "surname",
    "id": "nama keluarga"
  },
  {
    "cat": 25,
    "en": "spell",
    "id": "mengeja"
  },
  {
    "cat": 25,
    "en": "adult",
    "id": "orang dewasa"
  },
  {
    "cat": 25,
    "en": "apply",
    "id": "melamar / mendaftar"
  },
  {
    "cat": 25,
    "en": "area",
    "id": "daerah"
  },
  {
    "cat": 25,
    "en": "bored",
    "id": "bosan"
  },
  {
    "cat": 25,
    "en": "brush",
    "id": "menyikat / sikat"
  },
  {
    "cat": 25,
    "en": "cafe",
    "id": "kafe"
  },
  {
    "cat": 25,
    "en": "calm",
    "id": "tenteram"
  },
  {
    "cat": 25,
    "en": "cool",
    "id": "keren / sejuk"
  },
  {
    "cat": 25,
    "en": "energy",
    "id": "energi"
  },
  {
    "cat": 25,
    "en": "enjoy",
    "id": "menikmati"
  },
  {
    "cat": 25,
    "en": "exit",
    "id": "pintu keluar"
  },
  {
    "cat": 25,
    "en": "favourite",
    "id": "favorit"
  },
  {
    "cat": 25,
    "en": "fried",
    "id": "goreng"
  },
  {
    "cat": 25,
    "en": "fun",
    "id": "seru"
  },
  {
    "cat": 25,
    "en": "gate",
    "id": "gerbang"
  },
  {
    "cat": 25,
    "en": "group",
    "id": "kelompok"
  },
  {
    "cat": 25,
    "en": "grow",
    "id": "tumbuh"
  },
  {
    "cat": 25,
    "en": "healthy",
    "id": "sehat"
  },
  {
    "cat": 25,
    "en": "hive",
    "id": "sarang lebah"
  },
  {
    "cat": 25,
    "en": "hurry",
    "id": "terburu-buru"
  },
  {
    "cat": 25,
    "en": "idea",
    "id": "ide"
  },
  {
    "cat": 25,
    "en": "invite",
    "id": "mengundang"
  },
  {
    "cat": 25,
    "en": "join",
    "id": "bergabung"
  },
  {
    "cat": 25,
    "en": "kilometer",
    "id": "kilometer"
  },
  {
    "cat": 25,
    "en": "local",
    "id": "setempat"
  },
  {
    "cat": 25,
    "en": "main",
    "id": "utama"
  },
  {
    "cat": 25,
    "en": "math",
    "id": "matematika"
  },
  {
    "cat": 25,
    "en": "part",
    "id": "bagian"
  },
  {
    "cat": 25,
    "en": "piano",
    "id": "piano"
  },
  {
    "cat": 25,
    "en": "plant",
    "id": "tanaman"
  },
  {
    "cat": 25,
    "en": "pool",
    "id": "kolam"
  },
  {
    "cat": 25,
    "en": "prefer",
    "id": "lebih suka"
  },
  {
    "cat": 25,
    "en": "prepare",
    "id": "bersiap"
  },
  {
    "cat": 25,
    "en": "problem",
    "id": "masalah"
  },
  {
    "cat": 25,
    "en": "protect",
    "id": "melindungi"
  },
  {
    "cat": 25,
    "en": "reason",
    "id": "alasan"
  },
  {
    "cat": 25,
    "en": "rent",
    "id": "menyewa / sewa"
  },
  {
    "cat": 25,
    "en": "round",
    "id": "bulat"
  },
  {
    "cat": 25,
    "en": "salty",
    "id": "asin"
  },
  {
    "cat": 25,
    "en": "save",
    "id": "menghemat"
  },
  {
    "cat": 25,
    "en": "sunglasses",
    "id": "kacamata hitam"
  },
  {
    "cat": 25,
    "en": "tap",
    "id": "keran"
  },
  {
    "cat": 25,
    "en": "teeth",
    "id": "gigi (jamak)"
  },
  {
    "cat": 25,
    "en": "university",
    "id": "universitas"
  },
  {
    "cat": 25,
    "en": "useful",
    "id": "berguna"
  },
  {
    "cat": 25,
    "en": "visitor",
    "id": "pengunjung"
  },
  {
    "cat": 25,
    "en": "wish",
    "id": "berharap / harapan"
  },
  {
    "cat": 25,
    "en": "finally",
    "id": "akhirnya"
  }
];
