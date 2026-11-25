/* =====================================================================
   DRAGON SLAYER: THE LAST TEAR  |  story data (naskah, karakter, lore)
   File ini hanya berisi data. Mesin cutscene ada di story-engine.js.

   FORMAT BARIS NASKAH
     "sam.sad: Teks"        SAM bicara dengan ekspresi sad
     ": Teks"               narasi (tanpa nama)
     "@perintah argumen"    perintah sinematik (lihat daftar di story-engine.js)
     "?flag ..." / "?!flag ..."  baris hanya jalan bila flag ada / tidak ada
     {choice:[{t:'Pilihan', do:[...baris]}, ...]}

   EKSPRESI: normal smile angry confused fear sad cry surprised hurt
   ASET KUSTOM (opsional): taruh PNG di assets/portraits/ lalu daftarkan di
   `assets`. Satu baris per ekspresi (urutan EXPR di engine), kolom:
   diam, kedip, bicara-1, bicara-2. Kalau kosong, potret dibuat dari kode.
   ===================================================================== */
window.STORY_DATA = {
version: 1,

assets: {
  /* contoh: aurelia: { src: 'assets/portraits/aurelia.png', fw: 48, fh: 56 } */
},

/* ---------------- karakter ---------------- */
chars: {
  sam:      { name: 'SAM', color: '#7ab8ff', voice: [520, 'square'], side: 'L',
              look: { skin: '#f2c8a0', hair: '#4a3022', style: 'spiky', eye: '#4a7ac8', cloth: '#2e4a7a', band: '#d8362f' },
              bio: 'Pemburu naga dari desa Lereng Hening. Kehilangan keluarganya sebelas tahun lalu dalam satu malam api. Sejak itu ia hanya punya satu tujuan, dan ia menyebutnya keadilan.' },
  samkid:   { name: 'SAM kecil', color: '#7ab8ff', voice: [700, 'square'], side: 'L',
              look: { skin: '#f6d0aa', hair: '#4a3022', style: 'spiky', eye: '#4a7ac8', cloth: '#7a5a3a', child: 1 },
              bio: 'SAM pada umur tujuh tahun. Malam itu ia memeluk lututnya di tepi sungai dan melihat sayap besar di atas api.' },
  sya:      { name: 'SYA', color: '#ff9a5a', voice: [610, 'triangle'], side: 'L',
              look: { skin: '#f0c098', hair: '#d8502a', style: 'long', eye: '#8a4ac8', cloth: '#5a2a3a' },
              bio: 'Pendekar pedang kembar dari selatan. Tiga tahun lalu SAM menyelamatkannya dari jurang, dan sejak itu ia ikut berjalan di sisinya. Ia satu-satunya orang yang berani bertanya kenapa.' },
  aurelia:  { name: 'AURELIA', color: '#bfe8ff', voice: [470, 'sine'], side: 'R',
              look: { skin: '#f6dccf', hair: '#c4d2ee', style: 'aurelia', eye: '#4ac8ff', cloth: '#e6ecf8', cloth2: '#3a68c8', horns: 1, dragonEars: 1, glow: 1 },
              bio: 'Naga perak terakhir. Manusia menyebutnya bencana. Ia sendiri tidak pernah menjelaskan apa pun.' },
  aureliaw: { name: 'AURELIA', color: '#bfe8ff', voice: [470, 'sine'], side: 'R', same: 'aurelia',
              look: { skin: '#f6dccf', hair: '#c4d2ee', style: 'aurelia', eye: '#4ac8ff', cloth: '#e6ecf8', cloth2: '#3a68c8', horns: 1, dragonEars: 1, glow: 1, wings: 1 } },
  aureliad: { name: 'AURELIA', color: '#bfe8ff', voice: [300, 'sine'], side: 'R', same: 'aurelia', paint: 'dragon',
              look: { scale: '#b8c8ea', eye: '#5ad0ff' } },
  elena:    { name: 'ELENA', color: '#9ae07a', voice: [640, 'triangle'], side: 'R', npc: 1,
              look: { skin: '#eec09a', hair: '#7a4a2a', style: 'braid', eye: '#4a9a5a', cloth: '#6a8a4a', freckles: 1 },
              bio: 'Penjaga gerbang kamp pengungsi di luar Emberfall. Keluarganya meninggal saat Ordo "membebaskan" desanya. Ia menyimpan satu sisik perak di saku bajunya dan tidak tahu kenapa ia tidak pernah membuangnya.' },
  raven:    { name: 'OLD RAVEN', color: '#c8b8e8', voice: [300, 'triangle'], side: 'R', npc: 1,
              look: { skin: '#e0b890', hair: '#e8e4e0', style: 'bald', eye: '#5a4a3a', cloth: '#2a2438', beard: 1, glasses: 1, old: 1 },
              bio: 'Penjaga perpustakaan Emberfall yang selamat dari api. Ia menyembunyikan arsip yang seharusnya dibakar Ordo. Ia tahu banyak, dan ia tahu kapan harus diam.' },
  luna:     { name: 'LUNA', color: '#ffe08a', voice: [820, 'square'], side: 'R', npc: 1,
              look: { skin: '#f8d6b4', hair: '#f0d890', style: 'pigtails', eye: '#4ab0e0', cloth: '#c85a6a', child: 1, pet: 1 },
              bio: 'Anak berumur delapan tahun yang menemukan naga kecil bernama Pip di dekat gua. Ia tidak takut pada apa pun kecuali orang dewasa yang membawa tombak.' },
  kael:     { name: 'KAEL', color: '#e8b07a', voice: [360, 'sawtooth'], side: 'R', npc: 1,
              look: { skin: '#d8a880', hair: '#2a2228', style: 'short', eye: '#7a6a5a', cloth: '#4a4a58', scar: 1, stubble: 1 },
              bio: 'Mantan pemburu naga dari Ordo Fajar Merah. Ia meninggalkan Ordo setelah membunuh seekor induk naga yang sedang menjaga telurnya. Sekarang ia tinggal sendirian di celah gunung.' },
  mother:   { name: 'IBU', color: '#f0c8d8', voice: [560, 'sine'], side: 'R',
              look: { skin: '#f0caa6', hair: '#5a3a2a', style: 'bun', eye: '#4a7ac8', cloth: '#a87a6a' },
              bio: 'Ibu SAM. Ia mengajari SAM menghitung bintang dari jendela rumah mereka.' },
  veyr:     { name: 'INKUISITOR VEYR', color: '#ff6a6a', voice: [240, 'sawtooth'], side: 'R',
              look: { skin: '#d8b8a0', hair: '#5a1018', style: 'hood', eye: '#ff3a3a', cloth: '#6a0c18', sigil: 1 },
              bio: 'Inkuisitor Agung Ordo Fajar Merah. Pencipta Sigil Abu, sihir terlarang yang mengikat makhluk dan membuat api tanpa asap. Ordo menyebutnya pahlawan perang naga.' },
  grukk:    { name: 'GRUKK', color: '#9ad05a', voice: [200, 'sawtooth'], side: 'R',
              look: { skin: '#6a9a3a', hair: '#2a2a1a', style: 'goblin', eye: '#ffd040', cloth: '#5a3a24', tusks: 1, paint: 1 } },
  arachne:  { name: 'ARACHNE', color: '#c88aff', voice: [260, 'triangle'], side: 'R', paint: 'spider', look: {} },
  ignis:    { name: 'IGNIS', color: '#ffb04a', voice: [220, 'sawtooth'], side: 'R',
              look: { skin: '#3a2a2e', hair: '#ff8a20', style: 'flame', eye: '#ffe060', cloth: '#2a1a1a', chains: 1 } },
  glacius:  { name: 'GLACIUS', color: '#9ae8ff', voice: [180, 'triangle'], side: 'R', paint: 'golem', look: {} },
  malgrim:  { name: 'MALGRIM', color: '#c8c8d8', voice: [230, 'square'], side: 'R',
              look: { skin: '#c8a88a', hair: '#8a8a90', style: 'helm', eye: '#8ab0d8', cloth: '#4a4a5a', beard: 1 } },
  captain:  { name: 'KAPTEN ORDO', color: '#ff7a5a', voice: [280, 'sawtooth'], side: 'R',
              look: { skin: '#c89a7a', hair: '#6a0c18', style: 'hood', eye: '#ffb040', cloth: '#5a1018', sigil: 1 } }
},

/* teks antarmuka & pengganti nama di game lama */
locale: {
  id: {
    'st.0.l': 'Asap di cakrawala. SAM masih mengejar sayap yang ia lihat sebelas tahun lalu.',
    'st.1.l': 'Tambang tua di bawah punggung bukit. Seseorang mengukir naga di dindingnya.',
    'st.2.l': 'Emberfall terbakar lagi. Apinya tidak berasap.',
    'st.3.l': 'Celah utara. Penjaga es menunggu seseorang yang tidak pernah kembali.',
    'st.4.l': 'Reruntuhan kerajaan lama. Seorang ksatria masih berjaga di dalamnya.',
    'st.5.l': 'Kuil kuno di jantung gunung. Di sana, naga terakhir sedang tidur.',
    'en.malgrim': 'Malgrim, Sang Ksatria Patah',
    'en.malgrim.d': 'Penjaga Perjanjian terakhir. Ia menjaga reruntuhan agar tak seorang pun sampai ke kuil.',
    'en.dravok': 'Aurelia, Naga Terakhir',
    'en.dravok.d': 'Naga perak terakhir. Ia tidak ingin bertarung.',
    'en.guardcaptain': 'Kapten Ordo Fajar Merah',
    'en.ignis.d': 'Roh api yang dirantai Sigil Abu milik Ordo.',
    'en.glacius.d': 'Penjaga celah yang membekukan dirinya demi sebuah janji.',
    'en.grukk.d': 'Panglima goblin yang hutannya dibakar dua kali.',
    'en.arachne.d': 'Induk sarang yang mengingat siapa yang menahan langit-langit tambang.',
    'end.title': 'Naga terakhir telah tumbang',
    'end.p': 'Dan langit malam terasa jauh lebih sepi.'
  },
  en: {
    'en.malgrim': 'Malgrim, the Broken Knight',
    'en.dravok': 'Aurelia, the Last Dragon',
    'en.dravok.d': 'The last silver dragon. She does not want to fight.',
    'en.guardcaptain': 'Captain of the Red Dawn',
    'end.title': 'The last dragon has fallen',
    'end.p': 'And the night sky feels much emptier.'
  }
},

/* ---------------- pemicu ---------------- */
triggers: {
  stage: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6'],
  pre:    { grukk: 'grukk_pre', arachne: 'arachne_pre', ignis: 'ignis_pre', glacius: 'glacius_pre', malgrim: 'malgrim_pre', dravok: 'aurelia_meet' },
  defeat: { grukk: 'grukk_end', arachne: 'arachne_end', ignis: 'ignis_end', glacius: 'glacius_end', malgrim: 'malgrim_end' },
  /* bark: kalimat singkat saat bertarung, tidak menghentikan game */
  bark: {
    grukk:   { start: 'Grukk tidak lari dari manusia lagi!', mid: 'Hutan ini... rumah kami juga!', low: 'Anak-anak Grukk... masih lapar...' },
    arachne: { start: 'Jauhi telur-telurku.', mid: 'Kau berbau abu, sama seperti mereka.', low: 'Jangan... jangan sentuh sarangnya...' },
    ignis:   { start: 'LARI! Aku tidak bisa berhenti!', mid: 'Rantai ini... membakar dari dalam...', low: 'Sedikit lagi... patahkan sigilnya...' },
    glacius: { start: 'Celah ini tertutup.', mid: 'Esku retak... tapi janjiku tidak.', low: 'Maafkan aku... Bintang...' },
    malgrim: { start: 'Kalau begitu... ayo.', mid: 'Seren... sebentar lagi aku pulang.', low: 'Kau kuat... terlalu kuat untuk dendam sekecil itu.' },
    guardcaptain: { start: 'Bagus, pemburu. Selesaikan pekerjaan Ordo.', mid: 'Jangan dengarkan apa pun yang dikatakan naga itu!', low: 'Inkuisitor... akan... menyelesaikan ini...' },
    kingslime: { start: 'Blorp.' }, elderbat: { start: 'Kiiik!' }
  },
  /* naga terakhir: kalimat dan adegan sesuai sisa HP */
  final: {
    bark90: 'Aku tidak ingin melukaimu, Sam.',
    bark75: 'Turunkan pedangmu... sebentar saja.',
    scene60: 'aurelia_60',
    scene35: 'aurelia_35',
    transformAt: 0.15,
    transform: 'aurelia_fall',
    ending: 'ending'
  },
  /* fragmen lore dari ruang rahasia (6 ruang rahasia di game lama) */
  secret: ['frag0', 'frag1', 'frag2', 'frag3', 'frag4', 'frag5']
},

/* ---------------- NPC di perkemahan ---------------- */
npcs: {
  elena: { prog: 2, talks: [ { prog: 2, scene: 'elena_1' }, { prog: 3, scene: 'elena_2' }, { prog: 5, scene: 'elena_3' }, { end: 1, scene: 'elena_after' } ] },
  luna:  { prog: 3, talks: [ { prog: 3, scene: 'luna_1' },  { prog: 4, scene: 'luna_2' },  { prog: 6, scene: 'luna_3' },  { end: 1, scene: 'luna_after' } ] },
  raven: { prog: 4, talks: [ { prog: 4, scene: 'raven_1' }, { prog: 5, scene: 'raven_2' }, { prog: 6, scene: 'raven_3' }, { end: 1, scene: 'raven_after' } ] },
  kael:  { prog: 5, talks: [ { prog: 5, scene: 'kael_1' },  { prog: 6, scene: 'kael_2' },  { end: 1, scene: 'kael_after' } ] }
},

/* ---------------- jurnal (buku cerita) ---------------- */
journal: {
  j0:  { ch: 0, t: 'Malam di Lereng Hening', x: 'Sebelas tahun lalu desaku terbakar. Aku melihat sayap di atas api. Semua orang bilang itu naga. Aku percaya mereka.' },
  j1:  { ch: 1, t: 'Goblin yang bicara', x: 'Grukk bilang orang berjubah merah membakar hutannya. Goblin suka berbohong. Tapi kenapa dia menyebut naga perak sebagai penyelamat?' },
  j2:  { ch: 2, t: 'Ukiran di dinding tambang', x: 'Para penambang mengukir naga di dinding tambang. Naga itu tidak menyerang. Sayapnya terbuka di atas mereka, menahan langit-langit yang runtuh.' },
  j3:  { ch: 3, t: 'Api tanpa asap', x: 'Ignis dirantai Sigil Abu. Ia membakar Emberfall bukan karena mau. Ia menyebut jubah merah. Ia menyebut seseorang menunjuk langit dan berteriak "naga".' },
  j4:  { ch: 4, t: 'Janji di celah es', x: 'Glacius menunggu "Bintang". Ia tahu namaku dan tahu desaku. Bagaimana mungkin?' },
  j5:  { ch: 5, t: 'Kalimat yang tidak selesai', x: 'Malgrim mati sebelum menyelesaikan kalimatnya. "Malam itu... siapa yang..." Siapa yang apa?' },
  j6:  { ch: 6, t: 'Naga terakhir', x: 'Namanya Aurelia. Ia tidak membalas seranganku. Ia tahu namaku.' },
  j7:  { ch: 6, t: 'The Last Tear', x: 'Aku membunuh satu-satunya yang selama ini melindungiku. Kalau aku melihat langit malam, aku melihatnya. Setiap kali.' },
  jm:  { ch: 7, t: 'Kenangan Aurelia', x: 'Sebelas tahun. Ia mengunjungi makam ibuku setiap musim semi. Ia meninggalkan bunga bintang dan pergi sebelum fajar. Ia menonton aku belajar mengayunkan pedang. Ia tidak pernah sekali pun mendekat.' }
},

/* ---------------- lore ---------------- */
lore: {
  pact:   { t: 'Perjanjian Fajar', x: 'Dua ratus tahun lalu manusia dan naga membagi lembah utara. Naga menjaga gunung dan hujan, manusia menjaga ladang. Ksatria Penjaga Perjanjian bersumpah melindungi keduanya.' },
  order:  { t: 'Ordo Fajar Merah', x: 'Ordo lahir dari kelompok bangsawan yang menginginkan tanah perjanjian. Mereka tidak bisa merebutnya selama naga masih ada. Jadi mereka membuat perang.' },
  sigil:  { t: 'Sigil Abu', x: 'Sihir terlarang yang mengikat makhluk hidup lewat rasa sakit. Api dari sigil tidak berasap dan berbau besi. Para saksi selalu mengira itu napas naga.' },
  hening: { t: 'Malam Lereng Hening', x: 'Catatan Ordo menyebut desa Lereng Hening dihancurkan naga perak. Catatan yang sama tidak menjelaskan kenapa pasukan Ordo sudah berada di bukit sebelum api menyala.' },
  silver: { t: 'Naga Perak', x: 'Naga perak bernyanyi ketika malam cerah. Para petani lama menyebut nyanyian itu "suara bintang". Mereka meninggalkan susu di ambang pintu sebagai ucapan terima kasih.' },
  pip:    { t: 'Pip', x: 'Naga perak kecil yang dirawat Luna. Ia lahir dari telur yang dititipkan seseorang di gua, dibungkus kain biru dan selembar bunga bintang kering.' },
  frag0:  { t: 'Fragmen Kuil I', x: '"Aku melihat seorang anak di tepi sungai. Ia tidak menangis keras. Ia menangis seperti orang dewasa, diam-diam." (tulisan tangan, tinta biru)' },
  frag1:  { t: 'Fragmen Kuil II', x: '"Sayap kiriku belum sembuh. Panah Ordo dilapisi abu. Tidak apa. Aku masih bisa berjalan dalam wujud manusia." (tinta biru)' },
  frag2:  { t: 'Fragmen Kuil III', x: '"Ia mulai berlatih pedang hari ini. Ayunannya terlalu lebar. Ibunya pasti tertawa melihatnya." (tinta biru)' },
  frag3:  { t: 'Fragmen Kuil IV', x: '"Glacius berjanji menjaga celah. Malgrim berjanji menjaga reruntuhan. Aku tidak berhak meminta itu dari mereka." (tinta biru)' },
  frag4:  { t: 'Fragmen Kuil V', x: '"Ia menulis daftar naga yang ingin ia bunuh. Namaku tidak ada di sana. Ia tidak tahu namaku." (tinta biru)' },
  frag5:  { t: 'Fragmen Kuil VI', x: '"Kalau ia datang, aku tidak akan lari. Ia sudah lari dari kesedihannya selama sebelas tahun. Biar aku saja yang berhenti." (tinta biru)' },
  aurelia_past: { t: 'Masa lalu Aurelia', x: 'Aurelia menetas tiga ratus tahun lalu di puncak Kuil Bintang. Ia satu-satunya naga yang memilih tinggal di dekat desa manusia. Pada malam Lereng Hening ia terbang menuju api, bukan dari api. Ia menahan atap rumah keluarga SAM dengan punggungnya sampai panah abu menembus sayapnya. Ia menyelamatkan satu anak. Ia tidak bisa menyelamatkan ibunya. Setelah itu ia memilih menjadi musuh dalam cerita SAM, karena kebencian terasa lebih ringan daripada rasa bersalah. Ia salah soal itu. Ia tahu ia salah. Tapi ia tetap memilihnya.' }
},

/* ---------------- kenangan boss ---------------- */
bosses: {
  grukk:   { t: 'Grukk', x: 'Ia memimpin klan goblin terakhir di Greenwood setelah hutan mereka dibakar dua kali. Ia tidak pernah melihat naga menyerang. Ia hanya melihat jubah merah.' },
  arachne: { t: 'Arachne', x: 'Induk sarang di tambang tua. Tiga puluh tahun lalu langit-langit tambang runtuh, dan seekor naga perak menahannya sampai penambang terakhir keluar. Arachne mengingat bau sayap itu.' },
  ignis:   { t: 'Ignis', x: 'Roh api yang dulu menghangatkan tungku-tungku Emberfall. Ordo merantainya dengan Sigil Abu dan memaksanya membakar desa yang ia lindungi. Ketika rantainya patah, ia tersenyum.' },
  glacius: { t: 'Glacius', x: 'Penjaga celah utara. Ia membekukan dirinya untuk menahan longsoran di atas sebuah desa, lalu berjanji pada "Bintang" untuk menjaga jalan bagi seorang anak dari Lereng Hening.' },
  malgrim: { t: 'Malgrim', x: 'Ksatria Penjaga Perjanjian terakhir. Ordo membunuh Lady Seren, istrinya, karena menolak menandatangani perang. Ia menjaga reruntuhan selama dua puluh tahun agar tidak ada pemburu yang sampai ke kuil.' },
  dravok:  { t: 'Aurelia', x: 'Ia menghindari setiap serangan pertama. Ia hanya membalas ketika tidak ada pilihan lain. Di akhir, ia memilih wujud manusia supaya bisa melihat wajah SAM dari dekat.' }
},

/* =====================================================================
   ADEGAN
   ===================================================================== */
scenes: {

/* ---------- BAB I ---------- */
ch1: [
  '@bg black', '@music memory', '@tint sepia', '@fx embers',
  ': Sebelas tahun lalu, desa Lereng Hening terbakar dalam satu malam.',
  '@bg flash 2', '@amb fire', '@shake 2',
  ': Apinya tidak berasap. Tidak ada yang bertanya kenapa.',
  '@show samkid.cry L',
  'samkid.cry: Ibu...? IBU!',
  ': Di atas api, sesuatu yang sangat besar membentangkan sayapnya.',
  '@sfx roar', '@shake 3',
  'samkid.fear: ...',
  ': Keesokan paginya, orang-orang dewasa berkata: naga yang melakukannya.',
  ': Anak itu percaya.',
  '@fade out 900', '@hide all', '@tint none', '@amb none', '@fx leaves',
  '@bg stage 0', '@music camp', '@fade in 700',
  '@title BAB I|Hutan Greenwood',
  '@show sam.normal L',
  'sam.normal: Jejak kaki goblin. Masih baru.',
  '@show sya.smile R',
  'sya.smile: Kau membaca jejak lebih teliti daripada kau membaca surat dariku.',
  'sam.confused: Kau tidak pernah mengirimiku surat.',
  'sya.smile: Karena kau tidak akan membacanya.',
  'sam.normal: Ordo bilang naga terakhir terlihat di utara. Jalan tercepat lewat Emberfall.',
  'sya.normal: Naga terakhir. Kau mengucapkannya seperti orang yang mau pulang.',
  'sam.angry: Satu naga lagi. Setelah itu langit bersih.',
  'sya.sad: Dan setelah itu? Kau mau jadi apa, Sam?',
  'sam.normal: ...',
  'sam.normal: Setelah itu aku bisa tidur tanpa melihat api.',
  'sya.sad: Kau mengigau tiap malam. Bukan nama ibumu. Yang kau sebut selalu "sayap".',
  'sam.angry: Ayo jalan.',
  '@journal j0', '@lore hening'
],

grukk_pre: [
  '@bg game', '@music boss_grukk',
  '@show sam.angry L', '@show grukk.angry R',
  'grukk.angry: MANUSIA. Lagi.',
  'sam.angry: Minggir. Aku tidak punya urusan dengan goblin.',
  'grukk.angry: Kalian bakar hutan Grukk. Dua kali. Lalu kalian tunjuk langit dan bilang "naga".',
  'sam.confused: Apa maksudmu?',
  'grukk.angry: Grukk lihat sendiri! Jubah merah. Api tanpa asap. Grukk tidak bodoh!',
  'sya.confused: Sam... jubah merah itu seragam Ordo.',
  'sam.angry: Goblin akan bilang apa saja untuk menyelamatkan diri.',
  'grukk.angry: Kalau begitu Grukk tidak perlu diselamatkan. MAJU!',
  '@sfx broar', '@shake 3'
],
grukk_end: [
  '@bg game', '@music none', '@amb wind',
  '@show sam.normal L', '@show grukk.hurt R',
  'grukk.hurt: Uhh... manusia kuat.',
  'sam.normal: Sudah selesai. Pergilah ke selatan bersama klanmu.',
  'grukk.sad: Pemburu naga... Grukk tanya satu.',
  'grukk.sad: Kenapa naga perak tidak pernah makan Grukk? Dia lewat tiap musim kemarau. Dia padamkan api di hutan. Dengan sayapnya.',
  'sam.confused: ...',
  'grukk.sad: Kau buru naga yang salah, manusia.',
  ': Grukk tidak bangun lagi.',
  '@show sya.sad R',
  'sya.sad: Sam.',
  'sam.angry: Dia bohong. Mereka semua bohong.',
  'sya.sad: Kau tidak terdengar yakin.',
  '@journal j1', '@boss grukk', '@meet elena'
],

/* ---------- BAB II ---------- */
ch2: [
  '@bg stage 1', '@music mystery', '@fx dust',
  '@title BAB II|Gua Terlupakan',
  '@show sam.normal L', '@show sya.fear R',
  'sya.fear: Aku benci gua. Semua yang ada di gua punya terlalu banyak kaki.',
  'sam.smile: Kau pernah menebas tiga serigala sekaligus.',
  'sya.angry: Serigala punya empat kaki. Itu angka yang wajar.',
  '@hide R',
  ': Di dinding tambang, SAM menemukan sebuah ukiran tua.',
  ': Seekor naga membentangkan sayap di atas sekelompok orang. Sayapnya menahan batu-batu yang jatuh.',
  'sam.confused: Mereka mengukir naga... yang menyelamatkan mereka?',
  '@show sya.confused R',
  'sya.confused: Atau mereka mengukir apa yang mereka takuti.',
  'sam.normal: Orang tidak menggambar yang mereka takuti dengan wajah setenang itu.',
  '@journal j2'
],
arachne_pre: [
  '@bg game', '@music boss_arachne',
  '@show sam.normal L', '@show arachne.normal R',
  'arachne.normal: Langkahmu berat, anak manusia. Berat oleh dendam.',
  'sam.angry: Aku cuma mau lewat.',
  'arachne.angry: Semua pemburu bilang begitu. Lalu sarangku terbakar.',
  'arachne.sad: Tiga puluh tahun lalu langit-langit ini runtuh. Seekor naga menahannya dengan punggungnya sampai manusia terakhir keluar.',
  'arachne.normal: Aku mengingat bau sayapnya. Kau... membawa bau yang sama. Samar. Seperti pernah dipeluk olehnya.',
  'sam.surprised: Apa?',
  'arachne.angry: Tapi tanganmu berbau abu Ordo. Aku tidak akan membiarkanmu dekat dengan telurku.',
  '@sfx hiss'
],
arachne_end: [
  '@bg game', '@music none',
  '@show sam.normal L', '@show arachne.hurt R',
  'arachne.hurt: Telur-telurku... di belakang batu itu...',
  'arachne.sad: Biarkan mereka. Mereka belum pernah menyakiti siapa pun.',
  { choice: [
    { t: 'Biarkan telurnya', do: [ '@flag spare_eggs', 'sam.sad: Aku tidak akan menyentuhnya.', 'arachne.sad: Kau... tidak seperti mereka.', '@show sya.smile R', 'sya.smile: Itu keputusan yang baik, Sam.', '@rel sya +1' ] },
    { t: 'Hancurkan sarangnya', do: [ '@flag burn_eggs', 'sam.angry: Monster tetap monster.', 'arachne.cry: ...', '@show sya.sad R', 'sya.sad: Mereka belum menetas, Sam. Mereka belum jadi apa-apa.', 'sam.normal: ...' ] }
  ] },
  '@boss arachne', '@meet luna', '@lore silver'
],

/* ---------- BAB III ---------- */
ch3: [
  '@bg stage 2', '@music none', '@amb fire', '@fx embers',
  '@title BAB III|Emberfall',
  '@show sam.surprised L',
  'sam.surprised: Api ini...',
  '@show sya.fear R',
  'sya.fear: Tidak ada asap. Sam, tidak ada asap sama sekali.',
  'sam.fear: Seperti malam itu.',
  'sam.angry: Naganya pasti dekat.',
  'sya.angry: Atau orang yang membuat api seperti ini.',
  '@music village'
],
ignis_pre: [
  '@bg game', '@music boss_ignis',
  '@show sam.angry L', '@show ignis.hurt R',
  'ignis.hurt: LARI! Aku tidak bisa berhenti!',
  'sam.surprised: Kau yang membakar Emberfall?!',
  'ignis.cry: Aku menghangatkan tungku-tungku mereka selama seratus tahun... lalu mereka merantaiku...',
  'ignis.hurt: Sigil di dadaku... setiap kali aku menolak, ia membakarku dari dalam.',
  'ignis.angry: Patahkan sigilnya, pemburu. Atau ia akan membakarmu juga!',
  '@sfx fire', '@shake 3'
],
ignis_end: [
  '@bg game', '@music none', '@amb fire',
  '@show sam.normal L', '@show ignis.hurt R',
  '@sfx bigboom', '@flash',
  'ignis.surprised: Rantainya... patah.',
  'ignis.smile: Rasanya... seperti hujan pertama.',
  'sam.normal: Siapa yang merantaimu?',
  'ignis.sad: Jubah merah. Mereka membuat kami membakar desa. Lalu mereka berdiri di bukit, menunjuk langit... dan berteriak "naga".',
  'ignis.sad: Orang-orang percaya. Orang-orang selalu percaya pada yang paling keras berteriak.',
  'sam.fear: Tidak. Itu tidak mungkin.',
  'ignis.normal: Api tanpa asap, pemburu. Kau pernah melihatnya sebelumnya, kan?',
  ': Bara terakhir Ignis padam seperti lilin.',
  '@show sya.sad R',
  'sya.sad: Sam... malam di desamu. Apinya berasap atau tidak?',
  'sam.cry: AKU TIDAK INGAT!',
  'sam.sad: ...Aku tidak ingat.',
  '@journal j3', '@boss ignis', '@lore sigil', '@meet raven'
],

/* ---------- BAB IV ---------- */
ch4: [
  '@bg stage 3', '@music frozen', '@fx snow', '@amb wind',
  '@title BAB IV|Celah Utara',
  '@show sya.normal R', '@show sam.normal L',
  'sya.normal: Kau diam sejak Emberfall.',
  'sam.normal: Aku sedang menghitung.',
  'sya.confused: Menghitung apa?',
  'sam.sad: Berapa banyak naga yang sudah kubunuh. Dan berapa yang benar-benar pernah menyerang manusia.',
  'sya.sad: Lalu?',
  'sam.sad: Angkanya tidak sama.'
],
glacius_pre: [
  '@bg game', '@music boss_glacius', '@amb wind',
  '@show sam.normal L', '@show glacius.normal R',
  'glacius.normal: Anak dari Lereng Hening.',
  'sam.surprised: Kau tahu desaku?',
  'glacius.normal: Dia bilang kau akan datang. Suatu hari. Dengan pedang di tangan.',
  'sam.angry: Siapa "dia"?',
  'glacius.sad: Kalau aku menyebut namanya, kau tidak akan percaya. Kalau kau tidak percaya, pedangmu yang akan bicara.',
  'glacius.normal: Jadi biar pedangmu bicara sekarang. Aku sudah berjanji menjaga celah ini sampai es terakhir.',
  '@sfx chime'
],
glacius_end: [
  '@bg game', '@music none', '@amb wind', '@fx snow',
  '@show sam.normal L', '@show glacius.hurt R',
  'glacius.hurt: Es terakhirku... retak.',
  'sam.sad: Kenapa kau tidak membiarkanku lewat saja?',
  'glacius.normal: Karena aku berjanji menjaga jalan untukmu, bukan membukanya. Jalan ini harus kau pilih sendiri.',
  'glacius.sad: Kalau kau bertemu dengannya... sampaikan...',
  'glacius.sad: Aku menjaga janjiku. Sampai es terakhir.',
  ': Glacius runtuh menjadi salju yang berkilau.',
  'sam.confused: Sampaikan pada siapa?!',
  '@show sya.sad R',
  'sya.sad: Pada naga itu, Sam. Kau tahu itu.',
  '@journal j4', '@boss glacius', '@meet kael'
],

/* ---------- BAB V ---------- */
ch5: [
  '@bg stage 4', '@music castle', '@amb rain', '@fx rain',
  '@title BAB V|Reruntuhan Kerajaan',
  '@show sam.normal L',
  ': Hujan tidak berhenti sejak mereka melewati gerbang kerajaan lama.',
  '@show sya.normal R',
  'sya.normal: Kalau kau mau berbalik, aku tidak akan menyebutmu pengecut.',
  'sam.smile: Kau akan menyebutku pengecut.',
  'sya.smile: Hanya sekali. Dalam hati.',
  'sam.normal: Aku harus melihatnya sendiri, Sya. Naga itu. Aku harus tahu.'
],
malgrim_pre: [
  '@bg game', '@music boss_malgrim', '@amb rain',
  '@show sam.normal L', '@show malgrim.normal R',
  'malgrim.normal: Pergilah, anak muda... tempat ini hanya menyimpan kematian.',
  'sam.angry: Kau penjaga naga itu?',
  'malgrim.sad: Aku penjaga sebuah janji yang sudah tidak diingat siapa pun.',
  'malgrim.normal: Dulu aku melindungi manusia dan naga. Itu sumpah Ksatria Perjanjian.',
  'malgrim.sad: Lalu Ordo membunuh Seren karena ia menolak menandatangani perang mereka. Dan aku... tidak ada di sana.',
  'sam.confused: Lalu kenapa kau melindungi naga, kalau manusia yang membunuh istrimu?',
  'malgrim.normal: Karena kesedihan tidak memberi kita hak untuk membenci yang salah, nak.',
  'malgrim.angry: Angkat pedangmu. Tunjukkan bahwa dendammu layak dibawa sampai kuil.',
  '@sfx clang'
],
malgrim_end: [
  '@bg game', '@music none', '@amb rain', '@fx rain',
  '@show sam.normal L', '@show malgrim.hurt R',
  'malgrim.hurt: Kau... sudah sangat kuat.',
  'malgrim.normal: Dengarkan aku. Sebelum kau mengangkat pedang padanya... tanyakan...',
  'malgrim.hurt: Malam itu... siapa yang...',
  ': Kalimat itu tidak pernah selesai.',
  'sam.surprised: Siapa yang apa?! JAWAB AKU!',
  '@shake 2',
  '@show sya.sad R',
  'sya.sad: Sam... dia sudah pergi.',
  'sam.cry: Kenapa semua orang mati tepat sebelum mengatakan kebenaran?!',
  'sya.sad: Mungkin karena kebenarannya bukan untuk diceritakan. Tapi untuk dilihat.',
  '@journal j5', '@boss malgrim', '@lore pact'
],

/* ---------- BAB VI ---------- */
ch6: [
  '@bg stage 5', '@music lair', '@fx embers',
  '@title BAB VI|Kuil Bintang',
  '@show sam.normal L', '@show sya.sad R',
  'sya.sad: Kalau semua yang kita dengar itu benar...',
  'sam.sad: Kalau semua yang kita dengar itu benar, aku sudah menghabiskan sebelas tahun membenci hal yang salah.',
  'sam.angry: Dan kalau semuanya bohong, maka naga itu harus membayar.',
  'sya.sad: Dua-duanya berakhir dengan pedang, ya?',
  'sam.normal: Aku tidak tahu cara lain.',
  'sya.normal: Aku tahu. Bicara. Kalau dia mau bicara, dengarkan sampai selesai. Janji?',
  'sam.normal: ...Janji.'
],

aurelia_meet: [
  '@bg temple', '@music aurelia', '@fx light', '@fade in 900',
  ': Di jantung gunung, di bawah atap kuil yang terbuka ke langit, seekor naga perak sedang tidur.',
  ': Napasnya pelan. Sisiknya berkilau seperti bintang yang jatuh.',
  '@show sam.normal L',
  '@show aureliad.closed R',
  '@wait 900',
  '@expr aureliad normal',
  '@sfx chime',
  'aureliad.normal: Jadi... akhirnya kau datang juga.',
  'sam.angry: Kau naga terakhir?',
  'aureliad.sad: Menurut manusia... ya.',
  'sam.angry: Aku akan mengakhiri semuanya.',
  'aureliad.sad: Kalau itu yang membuat hatimu tenang...',
  'aureliad.closed: ...lakukanlah.',
  'sam.confused: Kau tidak akan melawan?',
  'aureliad.sad: Aku sudah terlalu lelah kehilangan orang-orang yang kucintai.',
  'sam.angry: Jangan bicara seolah kau mengerti kehilangan!',
  '@shake 2', '@sfx roar',
  '@music lastdragon', '@journal j6', '@meet aurelia'
],
aurelia_60: [
  '@bg game', '@music none',
  '@show sam.angry L', '@show aureliad.sad R',
  'aureliad.sad: Sam... apakah kau benar-benar membenciku sebesar itu?',
  'sam.angry: Diam! Jangan sebut namaku!',
  'aureliad.sad: Aku hanya... ingin melihatmu tumbuh dewasa.',
  'sam.confused: Apa... maksudmu?',
  '@music lastdragon'
],
aurelia_35: [
  '@bg game', '@music none', '@amb wind',
  '@show sam.hurt L', '@show aureliad.sad R',
  'aureliad.sad: Kau punya mata ibumu.',
  'sam.angry: JANGAN BICARA TENTANG IBUKU!',
  '@shake 3',
  'aureliad.closed: Maaf.',
  'aureliad.sad: Aku akan berhenti bicara. Tapi aku tidak akan berhenti menahanmu.',
  '@music lastdragon'
],

aurelia_fall: [
  '@bg temple', '@music none', '@fx light', '@amb wind',
  '@show sam.angry L', '@show aureliad.hurt R',
  ': Naga perak itu terhuyung. Ia tidak membalas lagi.',
  '@wait 600',
  '@flash', '@sfx sparkle',
  '@morph aureliaw.sad',
  ': Cahaya putih membungkus tubuhnya. Sayap raksasa itu menyusut menjadi kelopak cahaya.',
  ': Yang berlutut di hadapan SAM sekarang adalah seorang perempuan berambut perak.',
  '@music sorrow',
  'sam.surprised: Tunggu... apa yang kau lakukan?',
  'aureliaw.smile: Akhirnya... aku bisa melihat wajahmu dari dekat.',
  '@wings off',
  ': Sayapnya perlahan menghilang.',
  'sam.fear: Jangan... jangan lakukan ini.',
  'aurelia.smile: Kau sudah menjadi sangat kuat...',
  '@dim R 0.85',
  'aurelia.sad: Maaf... karena tidak bisa menemanimu lebih lama.'
],

ending: [
  '@bg temple', '@music sorrow', '@fx light',
  '@show sam.fear L', '@show aurelia.sad R', '@dim R 0.85',
  ': Cahaya kecil mulai terlepas dari tubuhnya, satu per satu, seperti kunang-kunang.',
  ': Satu cahaya menyentuh dahi SAM.',
  '@fade out 700', '@hide all',
  '@tint sepia', '@bg flash 2', '@amb fire', '@fx embers', '@music memory', '@fade in 700',
  ': Malam itu. Lereng Hening.',
  '@show veyr.smile R',
  'veyr.smile: Nyalakan sigilnya. Semua rumah di sisi timur.',
  'veyr.normal: Ketika apinya naik, kalian semua tahu harus berteriak apa.',
  '@hide R',
  '@sfx fire', '@shake 2',
  ': Api tanpa asap merayap dari rumah ke rumah.',
  '@show mother.fear R',
  'mother.fear: Sam! Ke jendela, sayang! Cepat!',
  '@sfx roar', '@shake 3', '@flash',
  ': Lalu sayap perak itu datang. Bukan dari api. Menuju api.',
  '@show aureliad.angry R',
  ': Naga itu menahan atap yang runtuh dengan punggungnya.',
  '@show mother.cry R',
  'mother.cry: Tolong... bawa anakku... tolong...',
  '@show aureliad.hurt R',
  '@sfx boom', '@shake 3',
  ': Panah-panah berlapis abu menembus sayapnya. Ia tidak bergeser.',
  ': Ia hanya berhasil mengangkat satu anak keluar dari jendela.',
  '@hide R', '@show samkid.cry L',
  'samkid.cry: IBU!',
  ': Di bukit, Inkuisitor Veyr menunjuk langit.',
  '@show veyr.angry R',
  'veyr.angry: NAGA! NAGA YANG MELAKUKAN INI!',
  '@hide R',
  ': Naga perak itu tidak membalas. Ia tidak mau membunuh manusia di depan anak itu.',
  ': Ia terbang pergi dengan sayap yang terluka.',
  '@hide all', '@amb rain', '@fx rain', '@bg flash 3',
  ': Bertahun-tahun kemudian.',
  ': Seorang perempuan berkerudung biru meletakkan bunga bintang di sebuah makam, setiap musim semi, sebelum fajar.',
  ': Ia menonton seorang anak laki-laki belajar mengayunkan pedang dari balik pohon.',
  ': Ia menjaga jalannya dari kejauhan. Ia meminta Glacius menjaga celah. Ia meminta Malgrim menjaga reruntuhan.',
  ': Ia hanya berharap anak itu suatu hari bisa hidup bahagia.',
  '@fade out 900', '@hide all', '@tint none', '@amb wind', '@fx light',
  '@bg temple', '@music sorrow', '@fade in 900',
  '@show sam.cry L', '@show aurelia.sad R', '@dim R 0.75',
  ': SAM memegang tangan Aurelia.',
  'sam.cry: Jadi... selama ini...',
  'sam.cry: Kau yang menyelamatkan mereka?',
  'aurelia.sad: Aku... sudah berusaha.',
  'sam.cry: KENAPA KAU TIDAK MEMBERITAHUKU?!',
  '@shake 1',
  'aurelia.sad: Karena aku tidak ingin... kau tumbuh dengan rasa bersalah.',
  '@cry',
  'sam.cry: Aku yang melakukan ini...',
  'sam.cry: Aku membunuh satu-satunya orang yang selama ini melindungiku...',
  '@expr aurelia smile',
  'aurelia.smile: Sam... jangan menangis.',
  '@bg stars',
  'aurelia.smile: Kalau suatu hari... kau melihat langit malam...',
  'aurelia.smile: Ingatlah... aku pernah berada di sana.',
  '@dim R 0.6',
  'aurelia.cry: Dan aku... sangat bahagia pernah mengenalmu.',
  ': Tangannya perlahan terlepas.',
  '@dissolve R',
  '@wait 1800',
  '@shake 2',
  'sam.cry: AURELIA!!!',
  '@fade out 1600', '@hide all', '@fx none', '@amb none', '@music none',
  '@bg black', '@fade in 10',
  '@cry', '@wait 2400',
  '@card HE DEFEATED THE LAST DRAGON.',
  '@card But the last dragon was the only one who loved him.',
  '@journal j7', '@journal jm', '@lore aurelia_past', '@boss dravok', '@ending'
],

/* adegan kenangan yang bisa diputar ulang dari Buku Cerita setelah tamat */
memory_aurelia: [
  '@bg flash 2', '@tint sepia', '@music memory', '@fx embers',
  ': Malam itu, sayap perak terbang menuju api.',
  '@show aureliad.hurt R',
  ': Ia menahan atap dengan punggungnya sampai panah abu menembus sayapnya.',
  '@show samkid.cry L',
  ': Ia hanya berhasil menyelamatkan satu anak.',
  '@hide all', '@bg stars', '@tint none', '@fx light', '@music sorrow',
  '@show aurelia.smile R',
  'aurelia.smile: Kalau suatu hari kau melihat langit malam, ingatlah aku pernah berada di sana.',
  '@dissolve R', '@wait 1500'
],

/* ---------- NPC: ELENA ---------- */
elena_1: [
  '@bg stage 2', '@music camp',
  '@show sam.normal L', '@show elena.fear R',
  'elena.fear: Berhenti di situ! Kamp ini... kamp ini tidak menerima orang bersenjata.',
  'sam.confused: Aku cuma butuh air.',
  'elena.fear: Terakhir kali orang bersenjata datang, mereka bilang mau melindungi kami.',
  { choice: [
    { t: 'Sarungkan pedang', do: [ 'sam.normal: Lihat. Pedangku di sarungnya.', 'elena.surprised: ...Kau benar-benar menurut?', 'elena.smile: Air ada di sumur sebelah timur. Ambil secukupnya.', '@rel elena +2' ] },
    { t: '"Aku bukan mereka."', do: [ 'sam.normal: Aku bukan mereka.', 'elena.sad: Semua orang bilang begitu.', 'elena.normal: Sumurnya di timur. Jangan dekati tenda anak-anak.', '@rel elena +1' ] },
    { t: 'Abaikan dan masuk', do: [ 'sam.angry: Aku tidak punya waktu untuk ini.', 'elena.angry: ...', ': Elena mundur. Tangannya gemetar di gagang tombaknya.' ] }
  ] }
],
elena_2: [
  '@bg stage 2', '@music camp',
  '@show sam.normal L', '@show elena.sad R',
  'elena.sad: Ordo datang ke desaku waktu aku dua belas tahun. Mereka bilang naga sedang menuju ke sana.',
  'elena.sad: Lalu desaku terbakar. Apinya tidak berasap.',
  'sam.surprised: ...',
  'elena.normal: Aku menemukan ini di abu rumahku. Pagi harinya.',
  ': Elena mengeluarkan sesuatu dari sakunya. Sebuah sisik perak sebesar telapak tangan.',
  'elena.confused: Kalau naga yang membakar desaku, kenapa sisiknya ada di bawah reruntuhan rumahku? Seperti ia... berbaring di atasnya.',
  { choice: [
    { t: '"Mungkin ia mencoba menolong."', do: [ 'sam.sad: Mungkin ia mencoba menolong.', 'elena.surprised: Kau... pemburu naga, dan kau bilang begitu?', 'elena.smile: Terima kasih. Belum pernah ada yang bilang begitu.', '@rel elena +2' ] },
    { t: '"Naga tetap naga."', do: [ 'sam.angry: Naga tetap naga.', 'elena.sad: Ya. Mungkin.', 'elena.normal: Tapi aku tetap menyimpannya.', '@rel elena +0' ] }
  ] },
  '@lore order'
],
elena_3: [
  '@bg stage 2', '@music camp',
  '@show sam.normal L', '@show elena.smile R',
  'elena.smile: Kudengar kau akan ke kuil di gunung.',
  'elena.normal: Ini. Aku menganyamnya dari benang biru. Ibuku bilang benang biru menjaga orang yang tersesat.',
  'sam.surprised: Untukku?',
  'elena.sad: Jangan jadi seperti mereka, Sam. Orang-orang yang berteriak "naga" lalu pulang tanpa melihat ke belakang.',
  'sam.normal: Aku akan melihat. Aku janji.',
  '@rel elena +1'
],
elena_after: [
  '@bg stage 2', '@music sorrow',
  '@show sam.sad L', '@show elena.sad R',
  'elena.sad: Kau kembali.',
  'sam.sad: Aku kembali.',
  'elena.cry: Wajahmu... seperti orang yang baru kehilangan keluarganya untuk kedua kalinya.',
  'sam.cry: ...',
  'elena.sad: Duduklah. Kau tidak perlu bicara.',
  ': Mereka duduk sampai matahari tenggelam. Elena tidak melepaskan sisik perak di genggamannya.',
  '@rel elena +1'
],

/* ---------- NPC: LUNA ---------- */
luna_1: [
  '@bg stage 1', '@music camp',
  '@show sam.normal L', '@show luna.fear R',
  'luna.fear: Jangan! Jangan sakiti Pip!',
  ': Seekor naga perak sebesar kucing bersembunyi di balik kaki Luna.',
  'sam.surprised: Itu... naga.',
  'luna.angry: Namanya PIP. Dan dia cuma makan jamur.',
  { choice: [
    { t: 'Berlutut dan berjanji', do: [ 'sam.normal: Aku janji tidak akan menyakiti Pip.', 'luna.surprised: Janji kelingking?', 'sam.smile: ...Janji kelingking.', 'luna.smile: Pip, dia orang baik! Bilang halo!', ': Pip bersin. Percikan kecil cahaya keluar dari hidungnya.', '@rel luna +2' ] },
    { t: 'Diam saja', do: [ 'sam.normal: ...', 'luna.sad: Orang dewasa selalu diam dulu sebelum bawa tombak.', '@rel luna +0' ] }
  ] },
  '@lore pip'
],
luna_2: [
  '@bg stage 1', '@music camp',
  '@show sam.normal L', '@show luna.cry R',
  'luna.cry: Pip tidak mau makan... sisiknya jadi kusam...',
  'sam.sad: Mungkin ia kedinginan.',
  'luna.sad: Ada nenek di desa bilang naga perak butuh "embun bintang". Embunnya cuma ada di puncak yang tinggi.',
  { choice: [
    { t: '"Aku akan membawakannya."', do: [ 'sam.smile: Aku akan lewat celah utara. Aku bawakan embunnya.', 'luna.surprised: Sungguh?!', 'luna.smile: Kau pemburu naga paling aneh di dunia!', '@flag dew_promise', '@rel luna +2' ] },
    { t: '"Naga liar bisa mengurus dirinya."', do: [ 'sam.normal: Naga liar bisa mengurus dirinya sendiri.', 'luna.cry: Pip bukan naga liar. Pip temanku.', '@rel luna +0' ] }
  ] }
],
luna_3: [
  '@bg stage 1', '@music camp', '@fx light',
  '@show sam.normal L', '@show luna.smile R',
  '?dew_promise sam.smile: Aku membawa embunnya. Dari puncak celah utara.',
  '?dew_promise luna.surprised: KAU INGAT!',
  'luna.smile: Pip sudah bisa terbang! Lihat!',
  ': Naga kecil itu berputar di udara, meninggalkan jejak cahaya tipis.',
  'luna.normal: Tadi malam ada kakak perempuan berambut perak. Dia menyanyi untuk Pip sampai Pip tidur.',
  'sam.surprised: Rambut perak?',
  'luna.smile: Matanya biru sekali. Dia bilang Pip mirip adiknya. Lalu dia tanya tentang kamu.',
  'sam.confused: Tentang aku?',
  'luna.normal: Dia tanya kamu makan cukup atau tidak. Aneh ya?',
  '@rel luna +1'
],
luna_after: [
  '@bg stars', '@music sorrow', '@fx light',
  '@show sam.sad L', '@show luna.sad R',
  'luna.sad: Pip terbang tadi malam. Jauh sekali. Dia tidak kembali.',
  'luna.normal: Tapi aku tidak sedih. Dia terbang ke arah bintang yang paling terang.',
  'luna.smile: Kakak berambut perak pasti ada di sana. Pip pasti menemaninya.',
  'sam.cry: ...Ya. Pasti.',
  '@rel luna +1'
],

/* ---------- NPC: OLD RAVEN ---------- */
raven_1: [
  '@bg stage 2', '@music mystery',
  '@show sam.normal L', '@show raven.normal R',
  'raven.normal: Hati-hati dengan raknya. Kayunya lebih tua dari kakek nenekmu.',
  'sam.confused: Perpustakaan ini selamat dari api?',
  'raven.smile: Api tanpa asap tidak suka kertas. Atau mungkin aku yang terlalu keras kepala untuk mati.',
  'raven.normal: Kau pemburu naga. Pernah membaca tentang Perjanjian Fajar?',
  { choice: [
    { t: '"Ceritakan."', do: [ 'sam.normal: Ceritakan.', 'raven.smile: Bagus. Anak muda yang mau mendengar sudah jarang.', 'raven.normal: Dua ratus tahun lalu manusia dan naga membagi lembah ini. Ada ksatria yang bersumpah menjaga keduanya.', '@lore pact', '@rel raven +2' ] },
    { t: '"Itu dongeng."', do: [ 'sam.angry: Itu dongeng untuk anak-anak.', 'raven.normal: Dongeng adalah sejarah yang kalah dalam perang.', '@lore pact', '@rel raven +1' ] }
  ] }
],
raven_2: [
  '@bg stage 2', '@music mystery',
  '@show sam.normal L', '@show raven.sad R',
  'raven.sad: Ordo Fajar Merah tidak lahir dari rasa takut pada naga. Ordo lahir dari keinginan pada tanah.',
  'raven.normal: Selama naga masih ada, Perjanjian berlaku. Selama Perjanjian berlaku, tanah itu bukan milik mereka.',
  'sam.fear: Jadi mereka... membuat perang.',
  'raven.sad: Mereka membuat musuh. Perang hanya akibatnya.',
  '@lore sigil', '@rel raven +1'
],
raven_3: [
  '@bg stage 2', '@music mystery',
  '@show sam.normal L', '@show raven.normal R',
  'raven.normal: Aku menemukan sesuatu. Catatan saksi dari malam Lereng Hening.',
  'sam.surprised: ...',
  'raven.sad: Halamannya terbakar separuh. Tapi satu kalimat masih terbaca.',
  'raven.normal: "Naga perak terbang ke arah..." Lalu kertasnya habis.',
  { choice: [
    { t: '"Aku tidak mau mendengarnya."', do: [ 'sam.angry: Simpan itu. Aku tidak mau mendengarnya sekarang.', 'raven.sad: Baik. Kebenaran tidak akan pergi ke mana-mana. Ia hanya akan terlambat.' ] },
    { t: '"Ke arah mana?"', do: [ 'sam.fear: Ke arah mana?', 'raven.sad: Aku tidak tahu, nak. Tapi saksi itu menulis "ke arah", bukan "dari".', 'sam.fear: ...', '@rel raven +1' ] }
  ] },
  '@lore hening'
],
raven_after: [
  '@bg stage 2', '@music sorrow',
  '@show sam.sad L', '@show raven.sad R',
  'raven.sad: Aku sudah menulis bab terakhirnya. Dengan tinta biru.',
  'raven.normal: Orang-orang di masa depan berhak tahu siapa yang menahan atap malam itu.',
  'sam.sad: Mereka akan bilang itu dongeng.',
  'raven.smile: Biar saja. Dongeng adalah satu-satunya tempat di mana naga itu tidak perlu menyembunyikan wajahnya lagi.',
  '@rel raven +1'
],

/* ---------- NPC: KAEL ---------- */
kael_1: [
  '@bg stage 3', '@music frozen', '@fx snow',
  '@show sam.normal L', '@show kael.normal R',
  'kael.normal: Pemburu naga. Aku bisa mengenali cara jalanmu dari jauh. Dulu aku berjalan seperti itu.',
  'sam.confused: Kau dari Ordo?',
  'kael.sad: Dua puluh tahun. Tiga belas naga.',
  'kael.sad: Yang terakhir seekor induk. Ia tidak menyerang. Ia hanya berbaring di atas telurnya dan menatapku sampai mati.',
  { choice: [
    { t: '"Kau tidak bisa mengubahnya."', do: [ 'sam.normal: Kau tidak bisa mengubah yang sudah terjadi.', 'kael.normal: Tidak. Tapi aku bisa berhenti menambah daftarnya.', '@rel kael +1' ] },
    { t: '"Apa yang kau lakukan sesudahnya?"', do: [ 'sam.sad: Apa yang kau lakukan sesudahnya?', 'kael.sad: Aku menunggu telurnya menetas. Tiga minggu. Lalu aku membawa anaknya ke gua yang aman.', 'kael.smile: Mungkin kau pernah bertemu dengannya. Gadis kecil di gua itu memanggilnya Pip.', '@rel kael +2' ] }
  ] }
],
kael_2: [
  '@bg stage 3', '@music frozen', '@fx snow',
  '@show sam.normal L', '@show kael.angry R',
  'kael.angry: Kau mau ke kuil. Dengarkan aku.',
  'kael.normal: Naga di sana bukan seperti yang lain. Ordo mengirim tiga regu ke sana. Tidak ada yang mati.',
  'sam.confused: Tidak ada yang mati?',
  'kael.sad: Ia hanya mengusir mereka. Setiap kali. Ia tidak pernah membalas.',
  'kael.normal: Naga yang tidak pernah membalas, nak... itu bukan monster. Itu seseorang yang sedang menunggu.',
  '@rel kael +1'
],
kael_after: [
  '@bg stars', '@music sorrow',
  '@show sam.sad L', '@show kael.sad R',
  'kael.sad: Aku sudah mendengar.',
  'sam.cry: Kau bilang dia sedang menunggu. Aku tidak mengerti waktu itu.',
  'kael.sad: Aku juga butuh tiga belas naga untuk mengerti.',
  'kael.normal: Hidupmu masih panjang, Sam. Gunakan untuk sesuatu yang akan membuatnya tersenyum.',
  '@rel kael +1'
]

}
};
