// IELTS Modules, Test Questions, Examiners, and Band Criteria

export const IELTS_MODS: any = {
  L: { name: 'Listening', e: '🎧', min: 15, c: 'var(--sky)',   real: '30 menit (+10 menit transfer di tes kertas)', desc: '4 section, 20 soal' },
  R: { name: 'Reading',   e: '📖', min: 30, c: 'var(--mint)',  real: '60 menit',  desc: '3 section, 15 soal' },
  W: { name: 'Writing',   e: '✍️', min: 30, c: 'var(--sun)',   real: '60 menit (20 menit Task 1, 40 menit Task 2)', desc: '2 tugas menulis' },
  S: { name: 'Speaking',  e: '🗣️', min: 6,  c: 'var(--pink)',  real: '11 sampai 14 menit', desc: '3 bagian, tatap muka' }
};

export const IELTS_LIS: any[] = [
  { k: 'Percakapan 2 orang: mendaftar kelas bahasa Inggris (isi formulir)',
    script: [['A', 'Hello, English Star School. How can I help you?'], ['B', 'Hello. I want to join an English class.'],
      ['A', 'Sure. What is your name, please?'], ['B', 'My name is Anna Brown.'],
      ['A', 'How do you spell Brown?'], ['B', 'B, R, O, W, N.'],
      ['A', 'Thank you. And your phone number?'], ['B', 'It is zero eight one, two three four, five six seven.'],
      ['A', 'What day do you want to come?'], ['B', 'I am free on Wednesday.'],
      ['A', 'Good. The class is at four o\'clock in the afternoon.'], ['B', 'How much is it?'],
      ['A', 'It is fifty dollars for one month.']],
    qs: [
      { t: 'fill', q: 'Surname: ___', a: ['Brown'] },
      { t: 'fill', q: 'Phone number: ___', a: ['081234567'] },
      { t: 'fill', q: 'Day of the class: ___', a: ['Wednesday'] },
      { t: 'fill', q: 'Time of the class: ___ p.m.', a: ['4', 'four', '4 oclock', 'four oclock', '4pm', '400'] },
      { t: 'fill', q: 'Price for one month: $___', a: ['50', 'fifty', '50 dollars', 'fifty dollars'] }] },
  { k: 'Monolog: pemandu di kebun binatang (situasi sosial sehari-hari)',
    script: [['A', 'Good morning, everyone. Welcome to Green Park Zoo. The zoo opens at nine o\'clock and closes at five o\'clock. The ticket office is next to the main gate. On the left you can see the monkeys. On the right there is a cafe. You can eat lunch there. The elephants are behind the cafe. Please do not give food to the animals. The shop is near the exit. Enjoy your day!']],
    qs: [
      { t: 'mcq', q: 'What time does the zoo close?', o: ['4 o\'clock', '5 o\'clock', '9 o\'clock'], a: 1 },
      { t: 'mcq', q: 'Where is the ticket office?', o: ['Next to the main gate', 'Near the exit', 'Behind the cafe'], a: 0 },
      { t: 'mcq', q: 'Where can visitors have lunch?', o: ['In the shop', 'Near the monkeys', 'In the cafe'], a: 2 },
      { t: 'fill', q: 'The elephants are ___ the cafe.', a: ['behind'] },
      { t: 'fill', q: 'Visitors must not give ___ to the animals.', a: ['food'] }] },
  { k: 'Percakapan 2 orang: dua siswa membahas PR (konteks pendidikan)',
    script: [['A', 'Hi Mia. Do you have the English homework?'], ['B', 'Yes, Tom. We must write ten sentences about our family.'],
      ['A', 'When do we give it to the teacher?'], ['B', 'On Friday. Mr. Lee wants it in the morning.'],
      ['A', 'I have a problem. I do not have a dictionary.'], ['B', 'You can use the library. It is open until six o\'clock.'],
      ['A', 'Good idea. Can you come with me?'], ['B', 'Sorry, I can\'t today. I have a piano lesson. But I can go tomorrow.'],
      ['A', 'Great. Let\'s meet at the library tomorrow at three o\'clock.']],
    qs: [
      { t: 'mcq', q: 'What is the English homework?', o: ['Write sentences about family', 'Read a book', 'Draw a picture'], a: 0 },
      { t: 'fill', q: 'They give the homework to Mr. Lee on ___.', a: ['Friday'] },
      { t: 'mcq', q: 'What does Tom need?', o: ['A pen', 'A phone', 'A dictionary'], a: 2 },
      { t: 'mcq', q: 'Why can\'t Mia go to the library today?', o: ['She has a piano lesson', 'She is tired', 'She has no homework'], a: 0 },
      { t: 'fill', q: 'They will meet at the library at ___ tomorrow.', a: ['3', 'three', '3 oclock', 'three oclock', '3pm', '300'] }] },
  { k: 'Monolog: kuliah singkat tentang lebah (subjek akademis)',
    script: [['A', 'Today I will talk about bees. Bees are small insects. They live in a group, and the group lives in a hive. A hive can have fifty thousand bees. Bees fly from flower to flower. They take a sweet drink from the flowers. They make honey from this drink. Bees also help plants to grow. Without bees, we have less fruit and vegetables. A bee is very busy. It visits about two hundred flowers in one day. Please help bees!']],
    qs: [
      { t: 'fill', q: 'Bees live in a ___.', a: ['hive'] },
      { t: 'mcq', q: 'Bees make ___ from the sweet drink.', o: ['milk', 'sugar', 'honey'], a: 2 },
      { t: 'fill', q: 'A hive can have about ___ bees.', a: ['50000', 'fifty thousand', '50 thousand'] },
      { t: 'mcq', q: 'Why are bees important?', o: ['They help plants to grow', 'They are big', 'They live in houses'], a: 0 },
      { t: 'fill', q: 'A bee visits about ___ flowers in one day.', a: ['200', 'two hundred'] }] }
];

export const IELTS_RD: any = {
  academic: [
    { k: 'Teks akademik 1: The Moon', text: [
        'The Moon is in the sky. It is not a star. It goes around the Earth. The Moon is smaller than the Earth.',
        'It does not have water or air, so people cannot live there. In 1969, two men walked on the Moon for the first time. They came from the USA.',
        'Many people look at the Moon at night because it is beautiful. Once a month, the Moon looks big and round. We call this the full moon.'],
      qs: [
        { t: 'tfng', q: 'The Moon is a star.', a: 'FALSE', e: 'Teks: "It is not a star."' },
        { t: 'tfng', q: 'The Moon goes around the Earth.', a: 'TRUE', e: 'Teks: "It goes around the Earth."' },
        { t: 'tfng', q: 'People live on the Moon.', a: 'FALSE', e: 'Teks: "people cannot live there."' },
        { t: 'tfng', q: 'Two men walked on the Moon in 1969.', a: 'TRUE', e: 'Teks menyebut tahun 1969 dan dua orang.' },
        { t: 'tfng', q: 'There are many animals on the Moon.', a: 'NOT GIVEN', e: 'Teks tidak menyebut hewan sama sekali.' }] },
    { k: 'Teks akademik 2: Water', text: [
        'Water is very important. People, animals and plants need water to live. Most of the Earth is water, but we can drink only a small part.',
        'The water in the sea is salty, so we cannot drink it. We get clean water from rivers, lakes and rain. In some countries, people walk many kilometers to find water.',
        'We can save water. Close the tap when you brush your teeth, and take short showers.'],
      qs: [
        { t: 'mcq', q: 'Who needs water to live?', o: ['Only people', 'People, animals and plants', 'Only plants'], a: 1 },
        { t: 'fill', q: 'Sea water is ___.', a: ['salty'] },
        { t: 'fill', q: 'We get clean water from rivers, lakes and ___.', a: ['rain'] },
        { t: 'mcq', q: 'In some countries, people ___ to find water.', o: ['drive a car', 'walk many kilometers', 'ask the teacher'], a: 1 },
        { t: 'mcq', q: 'How can we save water?', o: ['Take long showers', 'Open the tap all day', 'Close the tap when we brush our teeth'], a: 2 }] },
    { k: 'Teks akademik 3: A Healthy Breakfast', text: [
        'Many doctors say breakfast is the most important meal of the day. A good breakfast gives you energy for school or work. Fruit, eggs, bread and milk are good choices.',
        'Some people do not eat breakfast because they are in a hurry. This is not a good idea. They feel tired and hungry in the morning.',
        'Try to wake up ten minutes earlier and eat something small.'],
      qs: [
        { t: 'tfng', q: 'Breakfast gives you energy.', a: 'TRUE', e: 'Teks: "A good breakfast gives you energy."' },
        { t: 'tfng', q: 'Chocolate cake is a good breakfast.', a: 'NOT GIVEN', e: 'Teks tidak menyebut kue cokelat.' },
        { t: 'tfng', q: 'People who do not eat breakfast feel happy.', a: 'FALSE', e: 'Teks: mereka merasa lelah dan lapar.' },
        { t: 'fill', q: 'Try to wake up ___ minutes earlier.', a: ['ten', '10'] },
        { t: 'mcq', q: 'Why do some people not eat breakfast?', o: ['They are in a hurry', 'They do not like fruit', 'They are doctors'], a: 0 }] }
  ],
  general: [
    { k: 'Section 1: Pengumuman dan iklan', text: [
        '#SWIMMING POOL',
        'Open: Monday to Friday, 7 a.m. to 8 p.m. Saturday and Sunday, 9 a.m. to 5 p.m. Children under 10 must come with an adult. No food in the pool area.',
        '#ROOM FOR RENT',
        'One bedroom near the station. $300 a month. Kitchen and bathroom. No pets. Call Sara: 555 0142.'],
      qs: [
        { t: 'mcq', q: 'When does the pool close on Sunday?', o: ['At 8 p.m.', 'At 5 p.m.', 'At 9 a.m.'], a: 1 },
        { t: 'tfng', q: 'An 8-year-old child can swim alone.', a: 'FALSE', e: 'Teks: anak di bawah 10 tahun harus bersama orang dewasa.' },
        { t: 'fill', q: 'The room is $___ a month.', a: ['300', '300 dollars'] },
        { t: 'tfng', q: 'You can have a pet in the room.', a: 'FALSE', e: 'Teks: "No pets."' },
        { t: 'fill', q: 'You must call ___ about the room.', a: ['Sara'] }] },
    { k: 'Section 2: Iklan pekerjaan', text: [
        '#WAITER WANTED: Blue Sea Restaurant',
        'We need a friendly waiter. Work: Tuesday to Saturday, 5 p.m. to 11 p.m. Pay: $12 an hour. You must speak a little English. You do not need to know this job.',
        'Send your email to jobs@bluesea.example'],
      qs: [
        { t: 'mcq', q: 'What job is it?', o: ['Cook', 'Waiter', 'Driver'], a: 1 },
        { t: 'fill', q: 'The pay is $___ an hour.', a: ['12', 'twelve'] },
        { t: 'tfng', q: 'You must know this job already.', a: 'FALSE', e: 'Teks: "You do not need to know this job."' },
        { t: 'tfng', q: 'The restaurant is open on Monday.', a: 'NOT GIVEN', e: 'Teks hanya menyebut jam kerja Selasa sampai Sabtu.' },
        { t: 'fill', q: 'To apply, send an ___.', a: ['email'] }] },
    { k: 'Section 3: Email dari seorang teman', text: [
        'Hi Ben,',
        'Thank you for your letter! I am very happy that you will visit me in July. My town is small but nice. There is a big park and a market near my house.',
        'In July the weather is hot, so please bring a hat and sunglasses. You can sleep in my brother\'s room because he is at university. We can go to the beach on Saturday. My mother cooks very well, so you will love the food.',
        'Please tell me the time of your train.',
        'Best wishes, Lucy'],
      qs: [
        { t: 'mcq', q: 'When will Ben visit Lucy?', o: ['In June', 'In July', 'In August'], a: 1 },
        { t: 'mcq', q: 'What should Ben bring?', o: ['A hat and sunglasses', 'A coat', 'A dictionary'], a: 0 },
        { t: 'tfng', q: 'Lucy\'s mother cooks well.', a: 'TRUE', e: 'Teks: "My mother cooks very well."' },
        { t: 'tfng', q: 'Lucy lives in a big city.', a: 'FALSE', e: 'Teks: "My town is small."' },
        { t: 'fill', q: 'Lucy wants to know the time of his ___.', a: ['train'] }] }
  ]
};

export const IELTS_WR: any = {
  academic: {
    t1: { min: 30, mins: 10, p: 'The chart shows the favourite fruit of 20 students. Write at least 30 words about the chart.',
      chart: [['Apple', 8], ['Banana', 6], ['Orange', 4], ['Mango', 2]],
      sample: 'The chart shows the favourite fruit of 20 students. Apple is the most popular fruit. Eight students like apples. Six students like bananas. Four students like oranges. Mango is the least popular. Only two students like mangoes.' },
    t2: { min: 50, mins: 20, p: 'Some people like to study alone. Other people like to study with friends. Which do you prefer? Give reasons. Write at least 50 words.',
      sample: 'I prefer to study with friends. First, friends can help me when I have a problem. For example, my friend is good at math, so she explains the difficult questions to me. Second, studying with friends is more fun, and I do not feel bored. However, sometimes we talk too much. Finally, I like studying with friends because it is useful and fun.' }
  },
  general: {
    t1: { min: 30, mins: 10, p: 'Your English friend Sam asks you to visit his town. Write an email to Sam (at least 30 words). Say: when you can come; how you will travel; what you want to do there.',
      sample: 'Hi Sam, Thank you for your email. I can come in August. I will travel by train because it is cheap. I want to visit the museum and the park. I also want to eat local food. Please send me your address. See you soon! Best wishes, Dina' },
    t2: { min: 50, mins: 20, p: 'Do you prefer to live in a big city or in a small town? Why? Give reasons. Write at least 50 words.',
      sample: 'I prefer to live in a small town. First, a small town is quiet and safe. I can sleep well at night. Second, the air is clean and there are many trees. Also, the food is cheaper than in a big city. However, there are fewer jobs in a small town. Finally, I like a small town because it is calm and healthy.' }
  }
};

export const IELTS_SPK: any[] = [
  { p: 1, title: 'Part 1: Introduction dan wawancara', q: 'What is your name?', sec: 20, s: 'My name is Rina. I am twenty years old.' },
  { p: 1, title: 'Part 1: Introduction dan wawancara', q: 'Where do you live?', sec: 20, s: 'I live in Bandung. It is a big city. It is cool and green.' },
  { p: 1, title: 'Part 1: Introduction dan wawancara', q: 'What do you like to do on the weekend?', sec: 20, s: 'I like to watch movies and meet my friends.' },
  { p: 1, title: 'Part 1: Introduction dan wawancara', q: 'What food do you like?', sec: 20, s: 'I like fried rice. It is delicious and cheap.' },
  { p: 2, title: 'Part 2: Kartu topik (bicara panjang)', q: 'Now, please look at the card. Describe your best friend. You have thirty seconds to think.', prep: 30, sec: 45,
    cue: { h: 'Describe your best friend.', l: ['Who is he or she?', 'What do you do together?', 'Why do you like him or her?'] },
    s: 'My best friend is Dewi. She is twenty years old. We study together and we play badminton on Saturday. I like her because she is kind and funny. She always helps me.' },
  { p: 3, title: 'Part 3: Diskusi', q: 'Do you like to meet your friends often? Why?', sec: 25, s: 'Yes, I do. I meet my friends every weekend because it is fun.' },
  { p: 3, title: 'Part 3: Diskusi', q: 'Is it good to have many friends? Why?', sec: 25, s: 'Yes, it is. Friends can help you when you have a problem.' }
];

export const IELTS_CRIT: any = {
  W: [['ta', 'Menjawab tugas', 'Saya menjawab semua bagian pertanyaan dan cukup panjang.'],
      ['cc', 'Kalimat nyambung', 'Saya memakai kata seperti and, but, because, so, then.'],
      ['lr', 'Kosakata', 'Saya memakai kata sederhana yang tepat tanpa mengulang kata yang sama terus.'],
      ['gr', 'Tata bahasa', 'Kalimat saya punya subjek dan kata kerja, huruf besar di awal, titik di akhir.']],
  S: [['fc', 'Kelancaran', 'Saya terus berbicara tanpa terlalu lama diam.'],
      ['lr', 'Kosakata', 'Saya memakai kata yang tepat dan tidak mengulang terus.'],
      ['gr', 'Tata bahasa', 'Saya berbicara dengan kalimat lengkap, bukan satu kata saja.'],
      ['pr', 'Pengucapan', 'Orang lain bisa memahami ucapan saya dengan jelas.']]
};

export const IELTS_TIPS: any = {
  L: 'Ulangi Listening di mode latihan. Fokus pada angka, hari, jam, dan ejaan nama. Latih topik Angka dan Waktu di Diglosa.',
  R: 'Baca pertanyaan dulu, lalu cari kata kunci di teks. Ingat: NOT GIVEN berarti informasinya tidak disebut sama sekali.',
  W: 'Tulis kalimat pendek yang lengkap (subjek + kata kerja). Pakai and, but, because agar kalimat tersambung, lalu cek huruf besar dan titik.',
  S: 'Jawab dengan kalimat lengkap dan satu alasan memakai because. Ucapkan jawabanmu dengan suara keras setiap hari.'
};

export const IELTS_KEYS: any = {};

export const IELTS_EX: any[] = [
  { id: 'L', mod: 'L', name: 'Aula Dengar', e: '🎧', npc: { n: 'Sera si Pendengar', e: '🧝‍♀️', portrait: 'sera', x: 722, y: 222 }, go: [722, 280],
    say: [['Shh... listen carefully. The bell rings only once!', 'Sst... dengarkan baik-baik. Lonceng hanya berbunyi sekali!'], ['Can you hear the words and write the answers?', 'Bisakah kamu mendengar kata-katanya dan menulis jawabannya?']] },
  { id: 'R', mod: 'R', name: 'Perpustakaan', e: '📖', npc: { n: 'Pustakawan Bima', e: '👨‍🏫', portrait: 'bima', x: 273, y: 222 }, go: [273, 280],
    say: [['Welcome to the library. Please read the texts slowly.', 'Selamat datang di perpustakaan. Tolong baca teksnya pelan-pelan.'], ['Is it TRUE, FALSE or NOT GIVEN? Look for the key words.', 'Apakah TRUE, FALSE, atau NOT GIVEN? Cari kata kuncinya.']] },
  { id: 'W', mod: 'W', name: 'Meja Juru Tulis', e: '✍️', npc: { n: 'Juru Tulis Ayu', e: '🧑‍🎨', portrait: 'ayu', x: 226, y: 474 }, go: [285, 440],
    say: [['Hello! I have paper and ink for you.', 'Halo! Aku punya kertas dan tinta untukmu.'], ['Write short sentences. Check the capital letters and full stops.', 'Tulis kalimat pendek. Periksa huruf besar dan titiknya.']] },
  { id: 'S', mod: 'S', name: 'Panggung Bicara', e: '🗣️', npc: { n: 'Rangga si Penyair', e: '🧑‍🎤', portrait: 'rangga', x: 758, y: 474 }, go: [735, 525],
    say: [['Good day! Please speak loudly and clearly.', 'Selamat siang! Tolong bicara dengan keras dan jelas.'], ['Answer with full sentences and give one reason.', 'Jawab dengan kalimat lengkap dan beri satu alasan.']] },
  { id: 'full', mod: 'full', name: 'Gerbang Akademi', e: '🏰', npc: { n: 'Raja Penguji', spr: 'raja', e: '', x: 503, y: 186 }, go: [503, 244],
    say: [['Welcome to the IELTS Academy, traveler!', 'Selamat datang di Akademi IELTS, pengelana!'], ['Listening, Reading, Writing and Speaking. Are you ready for the full test?', 'Listening, Reading, Writing, dan Speaking. Siapkah kamu untuk ujian penuh?']] },
  { id: 'portal', mod: 'portal', name: 'Portal Pulang', e: '🔮', npc: { n: 'Penjaga Portal', spr: 'portal', e: '🧙‍♀️', x: 350, y: 492 }, go: [350, 440],
    say: [['This portal goes back to the Word Forest.', 'Portal ini menuju kembali ke Hutan Kata.'], ['Learn more words there, then come back to the Academy.', 'Pelajari lebih banyak kata di sana, lalu kembali ke Akademi.']] }
];

