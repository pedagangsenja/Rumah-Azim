/* Banglo Azim 3D — data daripada lukisan AZR (dimensi, jadual, maklumat). Koordinat pelan dalam meter: x = sepanjang grid 1→6, y = sepanjang grid C→A; aras dari tanah. */
'use strict';

/* Aras (m dari tanah): FFL +0.50, kawasan basah/luar 0.45, rasuk bumbung 3.80, siling ≈FFL+2.85, siling bilik air FFL+2.40 */
const FFL=.5, BASE=.45, T=.15, PLATE=3.8, CEIL=FFL+2.85, CEILW=FFL+2.4;

const FIN={
  padova:  {base:'#efefeb',grout:'#d3d3cf',pw:2.4,ph:1.2,vein:true,seed:11,rough:.3, nama:'Padova White', kod:'Guocera SX-PDV1PR · 1200×600 · polished'},
  castello:{base:'#e4e2dc',grout:'#c6c3bc',pw:1.2,ph:1.2,speck:true,seed:13,rough:.75, nama:'Castello White', kod:'Guocera GY-CTL1MR · 600×600 · microstep'},
  timber:  {kind:'timber',pw:1.088,ph:2.6,seed:17,rough:.7, nama:'Spotted Gum', kod:'Ekowood · jalur kayu lebar 136 mm · matt'},
  norwich: {base:'#eae8e2',grout:'#cdcac2',pw:0.6,ph:1.2,seed:19,rough:.75, nama:'Norwich White', kod:'Kimgress SS-NOW1N6 · 300×600 · natural matt'},
  orche:   {base:'#b87945',grout:'#7e4f2a',pw:1.2,ph:0.6,wood:true,stagger:true,seed:23,rough:.8, nama:'Wood Collection Orche', kod:'Kimgress A36AHV2DMBN · 300×600 · structured matt'},
  trav:    {base:'#e7dabe',grout:'#c8b994',pw:1.2,ph:0.6,speck:true,stagger:true,seed:29,rough:.6, nama:'Travertine Cream', kod:'Kimgress A36TV2LME · 300×600 · flat satin'},
  /* Jubin untuk gaya earth tone (cadangan pemilik, bukan dalam lukisan). Warna ≈ daripada carian; sahkan dengan sampel sebenar. */
  sx05:    {base:'#cdbb9e',grout:'#b3a284',pw:1.2,ph:1.2,speck:true,seed:31,rough:.6, nama:'Stone X Lime', kod:'Feruni SX05M · 600×600 · matt (≈)'},
  ls02:    {base:'#b9aa8c',grout:'#9e9073',pw:1.2,ph:.6,speck:true,stagger:true,seed:33,rough:.75, nama:'Limestone 2.0 Beige', kod:'Feruni LS02 · 300×600 · Griptech (≈)'},
  blitzen: {base:'#d9d2c4',grout:'#c2baab',pw:2.4,ph:1.2,speck:true,seed:35,rough:.55, nama:'Blitzen Stone Bright', kod:'Niro Granite GGBZ01 · 600×1200 · matt (≈)'},
  ls01:    {base:'#d3c8b3',grout:'#b8ad97',pw:1.2,ph:.6,speck:true,stagger:true,seed:37,rough:.75, nama:'Limestone 2.0 Almond', kod:'Feruni LS01 · 300×600 · Griptech (≈)'},
  oakstrip:{base:'#c9a77c',grout:'#a8875f',pw:2.4,ph:.272,wood:true,stagger:true,seed:39,rough:.5, nama:'Strip oak cerah', kod:'Lantai kayu oak cerah, jalur 136 mm (≈)'},
  tv02:    {base:'#dccba8',grout:'#c2b190',pw:1.2,ph:1.2,speck:true,band:true,seed:41,rough:.6, nama:'Travertino 2.0 Beige', kod:'Feruni TV02MH · 600×600 · matt berlubang (≈)'},
  merbau:  {base:'#6a3f27',grout:'#4c2c1a',pw:2.4,ph:.272,wood:true,stagger:true,seed:43,rough:.45, nama:'Strip merbau gelap', kod:'Lantai kayu merbau, jalur 136 mm (≈)'},
  terra:   {base:'#b5653f',grout:'#8a4b2e',pw:.6,ph:.6,speck:true,seed:47,rough:.8, nama:'Terracotta Vietnam', kod:'GNG Tiles · 300×300 · tidak berkilat, perlu sealer (≈)'}
};
/* ================= Data maklumat (jadual lukisan) ================= */
const INFO={
  W1:{t:'W1 · Tingkap bilik tidur',ref:'D3002',rows:[['Jenis','Casement aluminium 3 panel + panel kaca tetap atas'],['Saiz','1800 × 2100 mm, ambang 300 mm (kepala 2400)'],['Kaca','Kaca keselamatan terbaja berwarna'],['Bingkai','Aluminium, salutan serbuk'],['Kuantiti','4 (semua bilik tidur)']]},
  W2:{t:'W2 · Tingkap sempit',ref:'D3002',rows:[['Jenis','Top-hung aluminium + panel kaca tetap atas'],['Saiz','450 × 2100 mm, ambang 300 mm'],['Kaca','Kaca keselamatan terbaja berwarna'],['Kuantiti','5 (Bilik 1: 3, Ruang tamu: 2)']]},
  W3:{t:'W3 · Tingkap bilik air',ref:'D3002',rows:[['Jenis','Top-hung atas + kaca tetap bawah'],['Saiz','750 × 900 mm, ambang 1200 mm'],['Kaca','Kaca frosted / obscure terbaja'],['Kuantiti','2 (Bilik air 1 & 2)']]},
  W4:{t:'W4 · Tingkap bilik air 3',ref:'D3002',rows:[['Jenis','Top-hung aluminium 2 panel (525 + 525)'],['Saiz','1050 × 450 mm, ambang 1650 mm'],['Kaca','Kaca frosted / obscure terbaja'],['Kuantiti','1']]},
  W5:{t:'W5 · Tingkap dapur',ref:'D3002',rows:[['Jenis','Gelangsar 4 panel: 2 tetap di tepi, 2 gelangsar di tengah'],['Saiz','3150 × 600 mm (4 × 788), ambang 1000 mm'],['Kaca','Kaca jernih / berwarna terbaja'],['Kuantiti','1']]},
  W6:{t:'W6 · Tingkap kaca tetap ruang tamu',ref:'D3002',rows:[['Jenis','Kaca tetap aluminium, 4 panel sama (≈525 mm setiap satu)'],['Saiz','2100 × 2100 mm, ambang 300 mm'],['Kaca','Kaca terbaja (tertakluk kelulusan arkitek)'],['Kuantiti','1 (menghadap lanai)']]},
  MD1:{t:'MD1 · Pintu masuk utama',ref:'D3001',rows:[['Jenis','Pintu kayu pejal satu daun'],['Saiz','1000 × 2400 mm'],['Daun','Kayu pejal 44 mm'],['Bingkai','Kayu keras, kemasan stain + varnis'],['Perkakasan','Engsel berat, pemegang tuil, kunci mortis, deadbolt'],['Lokasi','Lanai ke ruang tamu (1)']]},
  D1:{t:'D1 · Pintu dapur ke yard',ref:'D3001',rows:[['Jenis','Pintu kayu pejal satu daun'],['Saiz','900 × 2100 mm'],['Ambang','Batu tumit konkrit 100 mm'],['Lokasi','Dapur ke yard (1)']]},
  D2:{t:'D2 · Pintu bilik tidur',ref:'D3001',rows:[['Jenis','Pintu flush kayu satu daun'],['Saiz','900 × 2100 mm'],['Daun','Papan lapis 38 mm, lipping kayu keras'],['Bingkai','Keluli lembut tekan, salutan serbuk'],['Kuantiti','4 (semua bilik tidur)']]},
  D3:{t:'D3 · Pintu bilik air',ref:'D3001',rows:[['Jenis','Pintu lipat (bi-fold) panel komposit aluminium, corak louver'],['Saiz','750 mm pada pelan (jadual tulis 900) × 2100 mm — perlu sahkan'],['Ambang','Batu tumit konkrit 100 mm'],['Kuantiti','3 (Bilik air 1, 2, 3)']]},
  GD1:{t:'GD1 · Pintu kaca lipat balkoni',ref:'D3001',rows:[['Jenis','Pintu kaca lipat aluminium 4 panel + panel tetap atas 300 mm'],['Saiz','2700 × 2100 mm (jumlah 2400 dengan panel atas)'],['Kaca','Kaca keselamatan terbaja berwarna'],['Lokasi','Ruang makan ke balkoni (1); 450 mm ke dalam dari grid A, 375 mm dari grid 3 (M1003, D3002, keratan 2-1)']]},
  KANOPI:{t:'Papak kanopi balkoni',ref:'M1006 (keratan 2-1)',rows:[['Binaan','Papak konkrit bertetulang tergantung 100 mm'],['Aras','Bawah papak pada kepala GD1 (FFL + 2400)'],['Unjuran','≈ 950 mm dari muka GD1 (diukur pada skala 1:50)'],['Lampu','2 downlight di bawah papak (D9001)']]},
  GD2:{t:'GD2 · Pintu kaca dapur',ref:'D3001',rows:[['Jenis','Pintu kaca aluminium berengsel + panel kaca tetap atas'],['Saiz','900 × 2100 mm (jumlah 2850 dengan panel atas)'],['Kaca','Kaca keselamatan terbaja jernih'],['Lokasi','Ruang makan ke dapur (1)']]},
  WALL:{t:'Dinding',ref:'D7001 · M1006',rows:[['Binaan','Bata 110 mm + lepa simen-pasir 20 mm kedua-dua muka'],['Tebal','≈150 mm'],['Tinggi','FFL ke rasuk bumbung 3300 mm'],['Kemasan','Cat; warna ikut pilihan arkitek']]},
  COL:{t:'Tiang & rasuk konkrit',ref:'M1005',rows:[['Binaan','Konkrit bertetulang 200 × 200 mm'],['Kemasan','Lepa simen-pasir + cat luar'],['Lokasi','Bucu yard, lanai dan teres']]},
  RAIL:{t:'Pagar besi',ref:'D6001–D6004',rows:[['Tinggi','900 mm dari FFL (nota); E3, E4 dan butiran D6001–D6004 tunjuk 850 mm'],['Bahan','Besi lembut, salutan serbuk hitam matte'],['Susunan','Pemegang atas 50×10 mm; bar isian menegak 40×10 mm @ 100 mm c/c'],['Tapak','Plat asas 100×100×6 mm, 2 bolt sauh (D6002)'],['Lokasi','Yard, lanai (termasuk sisi tangga), balkoni']]},
  STEPS:{t:'Anak tangga',ref:'D7006 · D7007',rows:[['Ukuran','Naik 100 mm, jejak 300 mm, stepnose bucu bulat'],['Lanai','3 naik dari lanai, jejak bawah 900 mm, lebar 1 050 mm selepas pier 300 mm (D6002)'],['Yard','3 naik dari yard, jejak 300 mm, lebar 900 mm, dalam 900 mm terakhir sebelum apron (D6001, D7006)'],['Kemasan','Jubin homogenous ±10 mm atas screed 1:3']]},
  ROOF:{t:'Bumbung',ref:'M1004 · M1005 · D5001',rows:[['Bentuk','Limas, dengan gable di atas lanai & teres'],['Jubin','Jubin konkrit interlocking + rabung, bubung & verge sepadan'],['Cerun','30°'],['Aras','Rasuk bumbung +3.80 m; rabung ≈+6.40 m (anggaran maksimum M1005)'],['Cucur atap','725 mm dari muka dinding'],['Lurah (valley)','Talang G.I. 18 gauge, lebar 375 mm'],['Struktur','Kekuda keluli ringan @ 600 mm, foil pemantul di bawah jubin'],['Fascia & sofit','Papan simen gentian; sofit luaran mengikut cerun'],['Warna','Belum ditetapkan dalam lukisan']]},
  GABLE:{t:'Dinding gable teres',ref:'M1005 (E1)',rows:[['Kemasan','Papan mendatar (≈ ikut lukisan E1) dengan bolong udara'],['Kedudukan','Atas rasuk teres, grid 6 + 1200'],['Nota','Bahan tepat tidak dinyatakan']]},
  VP:{t:'Paip udara (VP)',ref:'M1001 · M1002',rows:[['Saiz','uPVC Ø100 mm'],['Ketinggian','Sekurang-kurangnya 600 mm (M1001) / 900 mm (M1002) di atas bumbung, dengan cowl'],['Lokasi','VP1 Bilik Air 1, VP2 Bilik Air 2, VP3 Bilik Air 3']]},
  DB:{t:'Papan agihan (DB)',ref:'M1002 · D9001',rows:[['Lokasi','Dinding lanai, sebelah tangga']]},
  TILEW:{t:'Jubin dinding bilik air',ref:'D1001–D1004',rows:[['Jubin','Kimgress Travertine A36TV2LME · 300×600 · Cream · flat satin'],['Susunan','Mendatar, lantai ke siling, semua bilik air']]},
  KITKAT:{t:'Jubin ciri Kit Kat',ref:'D1001 · D1002',rows:[['Jubin','GNG & TTC Kit Kat KBT CT-CZ0919Y · 300×300 · Deep Brown, glazed'],['Lokasi','Bilik Air 1, dinding 2 & 4, dari ≈900 mm ke siling']]},
  SILLQ:{t:'Ambang dalam kuarza (W3)',ref:'D8001',rows:[['Bahan','Batu kuarza 120 × 20 mm, alur titis 5 × 5 mm'],['Lokasi','Tingkap W3 Bilik air 1 & 2'],['Unjuran','45 mm dari muka jubin']]},
  SILLW:{t:'Ambang dalam kayu (W5)',ref:'D8002',rows:[['Ambang','Kayu pejal 100 × 40 mm, dimeterai & varnis'],['Bingkai','Kayu pejal 60 × 40 mm di sekeliling bukaan'],['Lokasi','Tingkap dapur W5']]},
  SKIRT:{t:'Skirting aluminium',ref:'D7001',rows:[['Profil','Aluminium 80 mm tinggi, warna ikut pilihan arkitek'],['Pemasangan','Pelekat MS polimer hibrid, sendi mitre 45° atau penyambung buatan kilang'],['Lokasi','Dinding ruang kering (model: ruang tamu, makan, dapur, bilik tidur)']]},
  SILL:{t:'Ambang tingkap luar',ref:'D3002 · D8001 · D8002',rows:[['Bahan','Aluminium / konkrit'],['Kecerunan','Condong ke luar']]},
  DRAIN:{t:'Longkang U',ref:'M1002',rows:[['Jenis','Longkang U konkrit pratuang, lebar 300 mm, condong mengalir'],['Kedudukan','Apron 600 mm + longkang 300 mm dari muka dinding (keratan M1006); papak balkoni mengunjur 300 mm di atas apron (D6004)'],['Saluran keluar','Tidak ditunjukkan dalam lukisan'],['Penutup','Papak konkrit di sisi teres']]},
  APRON:{t:'Apron konkrit',ref:'M1002 · M1006',rows:[['Aras','+50 mm dari tanah'],['Lebar','600 mm dari muka dinding']]},
  CEIL:{t:'Siling gipsum',ref:'D4001',rows:[['Bahan','Papan gipsum 9 mm pada rangka logam bergalvani tergantung'],['Tinggi','2850 mm dari FFL (rantai dimensi keratan 1-2: 1000 + 600 + 1250)'],['Kemasan','Cat; warna ikut pilihan arkitek']]},
  CEILMR:{t:'Siling gipsum tahan lembap',ref:'D4001',rows:[['Bahan','Papan gipsum MR 9 mm, cat anti-kulat'],['Tinggi','Bilik air 2400 mm dari FFL; dapur 2850 mm'],['Lokasi','Dapur dan bilik air']]},
  SOFFIT:{t:'Siling sofit luar',ref:'M1006',rows:[['Bahan','Panel sofit gred luaran pada rangka ringan'],['Lokasi','Lanai, yard, cucur atap']]},
  DL:{t:'Lampu downlight terbenam',ref:'D9001',rows:[['Jenis','Recess down light'],['Pemasangan','Pada siling gipsum']]},
  FAN:{t:'Titik kipas siling',ref:'D9001 · M1006',rows:[['Pemasangan','Pada anggota keluli kekuda bumbung, bukan pada papan siling'],['Lokasi','Semua bilik tidur, dapur, ruang makan, ruang tamu, lanai']]},
  LED:{t:'Jalur LED pelmet',ref:'D4001 · D9001',rows:[['Jenis','Jalur LED berterusan pada kayu, dengan pemacu LED'],['Lokasi','Pelmet langsir ruang tamu, ruang makan, Bilik 1; cove Bilik air 1']]},
  WL:{t:'Titik lampu dinding',ref:'D9001',rows:[['Ketinggian','2100 mm dari FFL'],['Lokasi','Dinding luar dan tiang teres']]},
  WC1:{t:'WC satu keping (Bilik air 1)',ref:'D2001 · D2002',rows:[['Model','Johnson Suisse WBSC950218WW Venice Rimless one-piece'],['Kuantiti','1']]},
  WC2:{t:'WC close-couple (Bilik air 2)',ref:'D2001 · D2005',rows:[['Model','Sericite WC 1026 / LC 5026 Rhodium wash down'],['Kuantiti','1']]},
  SQ:{t:'Mangkuk tandas cangkung (Bilik air 3)',ref:'D2001 · D2007',rows:[['Model','Sericite SQ7004 Regal square, tangki PVC tuil'],['Butiran','Stepnose bucu bulat, kawasan cangkung dp 75 mm'],['Stepnose','MML Bone Natural 107 · 197 × 75 mm (D1001)']]},
  B1:{t:'Sinki atas kaunter (Bilik air 1)',ref:'D2001 · D2002',rows:[['Sinki','Johnson Suisse WBVC950143WW Valencia slim, putih matte'],['Pili','Johnson Suisse WBFA301351CP Trento tuil tinggi'],['Perangkap','WBFT400992CP brass bottle trap'],['Kaunter','Meja konkrit 100 mm berjubin, tinggi 850 mm']]},
  B2:{t:'Sinki dinding (Bilik air 2 & 3)',ref:'D2001',rows:[['Sinki','Sericite WB 2027 Natralite 345 × 305 × 125 mm'],['Pili','Sericite SR91020 tuil tunggal air sejuk'],['Sisa','Sericite A70001 pop-up 32 mm']]},
  SHW1:{t:'Pancuran (Bilik air 1)',ref:'D2001',rows:[['Model','Johnson Suisse WBFA301568CP Trento mixer dinding + palang gelangsar'],['Perangkap lantai','Evans SG-668ST linear 600 mm keluli tahan karat']]},
  SHW2:{t:'Pancuran (Bilik air 2 & 3)',ref:'D2001',rows:[['Kepala','Sericite SH60005 + lengan A70006 150 mm'],['Injap','Sericite SR16002 tuil tersembunyi'],['Perangkap lantai','Sericite A70004C 5" × 5"']]},
  HB:{t:'Bidet tangan',ref:'D2001',rows:[['Model','Johnson Suisse WBFA301562CP, hos 1.2 m, injap sudut']]},
  WTHS:{t:'Pili dengan semburan tangan',ref:'D2001',rows:[['Model','Sericite SR16012 pili dinding 2 hala + SR12022']]},
  TR:{t:'Penyangkut jubah berkembar (Bilik air 1)',ref:'D2001 · D1002',rows:[['Model','Johnson Suisse WBBA100379 Cesena double robe hook'],['Kedudukan','Dinding sisi pancuran, ≈1480 mm dari lantai (D1002)']]},
  TH1:{t:'Gelang tuala (Bilik air 1)',ref:'D2001 · D1002',rows:[['Model','Johnson Suisse WBBA100268CP Trendy towel ring 20 cm'],['Kedudukan','Dinding pintu, sebelah sinki, ≈1300 mm dari lantai (D2002, D2004 C-C)']]},
  TH2:{t:'Penyangkut jubah berkembar (Bilik air 2 & 3)',ref:'D2001 · D1003 · D1004',rows:[['Model','Sericite A70035 stainless steel double robe hook'],['Ketinggian','Tidak dinyatakan; model ≈1500 mm']]},
  SHF:{t:'Rak (Bilik air 1)',ref:'D2002 · D2004',rows:[['Model','Evans EVAH31002 sole gun metal single shelf 430 mm'],['Kedudukan','Di bawah tingkap W3, atas WC; tinggi ≈1120 mm (diukur pada skala 1:25)']]},
  WTW:{t:'Pili dinding (Bilik air 1)',ref:'D2001 · D1002',rows:[['Model','Johnson Suisse WBFA300769CP Ferla-N single lever ½" bib tap'],['Kedudukan','Dinding sisi pancuran, ≈620 mm dari lantai']]},
  MR:{t:'Cermin LED (Bilik air 1)',ref:'D2001',rows:[['Model','Evans LW03 cermin bujur LED 900 × 500 mm'],['Cahaya','3 warna']]},
  FURN:{t:'Perabot',ref:'M1004',rows:[['Sumber','Susun atur perabot M1004'],['Saiz','Anggaran sahaja — bukan sebahagian kontrak bangunan']]},
  KIT:{t:'Kabinet dapur',ref:'M1004 · M1006-1 · M1006-4',rows:[['Kaunter','Tinggi 900 mm, bentuk U: dinding yard, dinding W5 dan dinding ruang makan'],['Dapur masak & sinki','Kedua-duanya di bawah tingkap W5 (sinki ikut kedudukan KT)'],['Kabinet atas','Di atas tingkap W5 dan di dinding ruang makan (termasuk atas peti sejuk); kabinet microwave di atas kaunter'],['Nota','Saiz anggaran daripada pelan perabot dan keratan A-A, 1-2']]},
  AC:{t:'Penghawa dingin (split)',ref:'D9001',rows:[['Unit dalam','Unit dinding di Bilik 1, 2, 3 dan 4'],['Unit luar','3 kondenser di luar dinding grid C, 1 di luar dinding grid 1'],['Kapasiti','Tidak dinyatakan dalam lukisan']]}
};

/* ================= Bilik (luas ikut M1003) ================= */
const ROOMS=[
  {id:'yard', n:'Yard', a:'4.86', f:'orche', lv:.45, r:[[0,5.1,1.8,6.9],[0.9,6.9,1.8,7.8]], full:[0,5.1,1.8,7.8], c:'SOFFIT', ch:CEIL},
  {id:'ba3', n:'Bilik Air 3', a:'2.16', f:'trav', lv:.45, r:[[0,3.9,1.8,5.1]], s:.75, c:'CEILMR', ch:CEILW},
  {id:'dapur', n:'Dapur', a:'12.87', f:'castello', lv:.5, r:[[1.8,3.9,5.1,7.8]], c:'CEILMR', ch:CEIL},
  {id:'makan', n:'Ruang Makan', a:'15.39', f:'padova', lv:.5, r:[[5.1,3.9,8.4,7.35],[6,1.8,7.2,3.9]], at:[6.75,5.9], c:'CEIL', ch:CEIL},
  {id:'tamu', n:'Ruang Tamu', a:'15.21', f:'padova', lv:.5, r:[[8.4,3.9,12.3,7.8]], c:'CEIL', ch:CEIL},
  {id:'lanai', n:'Lanai', a:'10.53', f:'orche', lv:.45, r:[[12.3,3.9,13.5,7.8],[13.5,3.9,15,4.275],[13.5,5.325,15,7.8]], full:[12.3,3.9,15,7.8], at:[13.65,6.1], c:'SOFFIT', ch:CEIL},
  {id:'balkoni', n:'Balkoni', a:'2.52', f:'orche', lv:.45, r:[[5.1,7.35,8.4,8.1]], s:.7, lift:.2, c:null},
  {id:'b4', n:'Bilik 4', a:'11.70', f:'norwich', lv:.5, r:[[0,0,3,3.9]], c:'CEIL', ch:CEIL},
  {id:'b3', n:'Bilik 3', a:'11.70', f:'norwich', lv:.5, r:[[3,0,6,3.9]], c:'CEIL', ch:CEIL},
  {id:'ba2', n:'Bilik Air 2', a:'2.16', f:'trav', lv:.45, r:[[6,0,7.2,1.8]], s:.75, c:'CEILMR', ch:CEILW},
  {id:'b2', n:'Bilik 2', a:'9.45', f:'norwich', lv:.5, r:[[7.2,0,9.3,3.9],[9.3,1.8,9.9,3.9]], at:[8.25,2.3], c:'CEIL', ch:CEIL},
  {id:'ba1', n:'Bilik Air 1', a:'2.97', f:'trav', lv:.45, r:[[9.3,0,10.95,1.8]], s:.75, c:'CEILMR', ch:CEILW},
  {id:'b1', n:'Bilik 1 (Utama)', a:'18.00', f:'timber', lv:.5, r:[[10.95,0,15,3.9],[9.9,1.8,10.95,3.9]], at:[12.9,2.0], c:'CEIL', ch:CEIL}
];

/* ================= Bukaan & dinding (D3001, D3002, M1003) ================= */
const TYPES={
  W1:{w:1.8,sill:.3,h:2.1,k:'win',div:3,tr:[1.8]},
  W2:{w:.45,sill:.3,h:2.1,k:'win',div:1,tr:[1.8]},
  W3:{w:.75,sill:1.2,h:.9,k:'win',div:1,tr:[.45],frost:true},
  W4:{w:1.05,sill:1.65,h:.45,k:'win',div:2,frost:true},
  W5:{w:3.15,sill:1.0,h:.6,k:'win',div:4},
  W6:{w:2.1,sill:.3,h:2.1,k:'win',div:4},
  GD1:{w:2.7,sill:0,h:2.4,k:'win',div:4,tr:[2.1]},
  GD2:{w:.9,sill:0,h:2.85,k:'gdoor',tr:[2.1]},
  MD1:{w:1.0,sill:0,h:2.4,k:'door'},
  D1:{w:.9,sill:0,h:2.1,k:'door'},
  D2:{w:.9,sill:0,h:2.1,k:'door'},
  D3:{w:.75,sill:0,h:2.1,k:'bifold'}
};
/* open: arah buka (±1); flip: engsel di hujung koordinat besar bukaan */
const op=(type,c,open,flip)=>Object.assign({type,c,open:open||1,flip:!!flip},TYPES[type]);
const WALLS=[
  [0,0,15,0,[op('W1',1.425),op('W1',4.425),op('W3',6.525),op('W1',8.175),op('W3',9.675),op('W1',13.5)]],
  [15,0,15,4.2,[op('W2',1.275),op('W2',2.025),op('W2',2.775)]], // dinding Bilik 1 diteruskan 300 ke lanai sebagai pier penuh (D6002, E1 '300')
  [1.8,7.8,5.1,7.8,[op('W5',1.65)]],[1.075,7.8,1.8,7.8], // yard sisi grid A: dinding x 1.0–1.8, bukaan 900 untuk tangga sahaja (E4, M1002, D7006)[8.4,7.8,12.3,7.8,[op('W2',.675),op('W2',3.15)]],
  /* Balkoni separuh ke dalam (M1003, D6004, keratan 2-1): GD1 450 mm ke dalam dari grid A; tiada dinding pada grid A antara grid 3 dan 4 */
  [5.1,7.35,8.4,7.35,[op('GD1',1.725)]],[8.4,7.35,8.4,7.8],
  [0,0,0,5.1,[op('W4',4.5)]],
  [0,3.9,6.0,3.9,[op('D2',2.45,-1,1)]],
  [7.2,3.9,15,3.9,[op('D2',3.2,-1)]],
  /* Pintu Bilik 3 & Bilik 2 pada dinding koridor, 1050 dari dinding Bilik Air 2 (M1003, keratan 2-1) */
  [3,0,3,3.9],[6,0,6,3.9,[op('D2',3.375,1,1)]],[7.2,0,7.2,3.9,[op('D2',3.375,-1,1)]],
  [6,1.8,7.2,1.8,[op('D3',.45)]],
  [9.3,0,9.3,1.8],[9.3,1.8,10.95,1.8],[10.95,0,10.95,1.8,[op('D3',1.35,-1)]],[9.9,1.8,9.9,3.9],
  [1.8,3.9,1.8,7.8,[op('D3',.75,-1),op('D1',1.75)]],
  [0,5.1,1.8,5.1],
  [5.1,3.9,5.1,7.8,[op('GD2',.55)]],
  [12.3,3.9,12.3,7.8,[op('MD1',.8,1),op('W6',2.625)]]
];

/* ================= Anak tangga & pagar (D6001–D6004, D7006, D7007) ================= */
/* Jejak mengikut arah turun: 'x+' = turun ke arah +x. h = aras atas setiap jejak (m dari tanah). */
const STAIRS=[
  {id:'lanai', x1:13.5, y1:4.275, x2:15, y2:5.325, dir:'x+', d:[.3,.3,.9], h:[.35,.25,.15]}, // D6002: selepas pier 300, lebar 1 050
  {id:'yard',  x1:0,    y1:6.9,   x2:.9, y2:7.8,   dir:'y+', d:[.3,.3,.3],  h:[.35,.25,.15]}  // D7006/D6001: 3 jejak dalam 900 terakhir, naik 100 ke apron
];
/* [x1,y1,x2,y2,aras tapak]. Pagar sisi tangga lanai pada y 5.4 (zon 150 selepas tangga, D6002), aras atas rata (D6003) */
const RAILS=[
  [0,5.1,0,7.8,.45],
  [15,5.4,15,7.8,.45],[12.3,7.8,15,7.8,.45],[13.6,5.4,15,5.4,.45],
  [5.1,8.1,8.4,8.1,.45],[5.1,7.875,5.1,8.1,.45],[8.4,7.875,8.4,8.1,.45]
];
const COLS=[[0,7.8],[15,7.8],[16.1,7.7],[16.1,3.9]];
/* Papak kanopi 100 mm di atas balkoni pada kepala GD1 (keratan 2-1, unjuran diukur pada skala ≈) */
const KANOPI=[5.1,7.35,8.4,8.3];

/* ================= Siling tambahan, pelmet & downlight (D4001, D9001) ================= */
/* Sofit rata selain bilik: ceruk balkoni di bawah rasuk grid A, dan teres (keratan A-A) */
const SOFIT=[[5.1,7.35,8.4,7.725],[15.075,3.9,16.2,7.8]];
/* Pelmet langsir berjalur LED [x1,y1,x2,y2,aras siling]: 250 mm dari muka dinding (D4001) */
const PELMET=[
  [5.175,7.03,8.48,7.08,CEIL],[8.43,7.05,8.48,7.5,CEIL],[8.45,7.45,9.45,7.5,CEIL],   // ruang makan (selari GD1) & W2 pertama ruang tamu
  [11.25,7.45,12.0,7.5,CEIL],[11.95,5.46,12.0,7.5,CEIL],                              // W2 kedua & W6 ruang tamu
  [12.4,.22,14.6,.27,CEIL],[14.72,.9,14.77,3.0,CEIL],                                  // Bilik 1
  [9.4,.17,10.85,.22,CEILW]                                                            // cove Bilik Air 1
];
/* Downlight terbenam (D9001, diukur pada skala 1:75) */
const DLS=[
  [.93,6.46],[.93,4.49],                                       // yard, Bilik Air 3
  [2.5,6.66],[4.44,6.66],[2.5,4.56],[4.44,4.56],               // dapur
  [5.78,6.36],[7.72,6.36],[5.78,4.56],[7.72,4.56],[6.61,2.84], // ruang makan & laluan
  [5.78,7.7],[7.72,7.7],                                       // balkoni (bawah kanopi)
  [9.08,7.12],[11.64,7.12],[9.08,4.56],[11.64,4.56],           // ruang tamu
  [12.98,7.12],[12.98,5.94],[12.98,4.77],[14.34,4.77],         // lanai
  [15.59,7.12],[15.59,5.94],[15.59,4.77],                      // teres
  [.71,2.92],[2.33,2.92],[.71,.97],[2.33,.97],                 // Bilik 4
  [3.69,2.92],[5.32,2.92],[3.69,.97],[5.32,.97],               // Bilik 3
  [6.61,.94],                                                  // Bilik Air 2
  [7.89,2.92],[9.24,2.92],[7.89,.97],                          // Bilik 2
  [10.13,.93],                                                 // Bilik Air 1
  [10.51,2.92],[11.94,2.92],[14.03,2.92],[11.94,.97],[14.03,.97] // Bilik 1
];

/* ================= Bumbung (M1004, M1005, D5001) ================= */
/* Cucur 725 mm dari muka dinding = 0.80 m dari grid. Cerun 30°. Rabung utama ≈ +6.40 m (anggaran maksimum M1005).
   Gable di atas lanai & teres: rabung di tengah lanai (y = 5.85), hujung pada grid 6 + 1.2 + 0.8. */
const RF={x0:-.8, x1:15.8, y0:-.8, y1:8.6, ridge:6.4, pitch:Math.PI/6, gx:17.0, gy:5.85, depth:.25, gableX:16.2};

/* ================= Kemasan dinding bilik air (D1001–D1004) ================= */
/* kit: sisi dinding berjubin Kit Kat ('y1' = sisi y kecil, 'y2' = sisi y besar, 'x1', 'x2'); kz = tinggi mula dari lantai */
const WTILE={ba1:{kit:['y1','y2'],kz:.9}, ba2:{}, ba3:{}};

/* ================= Paip udara VP (M1001, M1002) ================= */
const VPIPE=[{n:'VP1',x:9.33,y:-.13},{n:'VP2',x:6.0,y:-.13},{n:'VP3',x:-.13,y:3.9}]; // M1002 & E2/E3, diukur pada skala 1:100

/* ================= Tapak (M1001, M1002) ================= */
/* Utara ke arah jalan berturap (+x), seperti anak panah semua helaian. Bering M1001 dirujuk pada sisi rumah keluarga (0°);
   utara sebenar (Google Earth) ialah paksi +x diputar 8.9° ke arah +y. Sempadan ikut bering & jarak M1001 (dilalui lawan arah jam).
   Grid 1 → sempadan selatan (bendang) 3 000 (bertulis); grid A → sempadan barat (rumah keluarga) ≈ 1.52 m (diukur pada skala 1:100). */
const UTARA=8.9; // darjah: sudut utara sebenar dari paksi +x pelan, lawan arah jam (ke arah +y)
const LOT=[[-3,9.322],[23.94,9.322],[24.534,-6.757],[-3,-2.678]];
const LOT_SIDES=[['Barat','26.94 m','S 0°00′00″ W','rumah keluarga'],['Utara','16.09 m','S 87°52′59″ W','jalan berturap'],['Timur','27.83 m','N 8°26′09″ E','jalan dalam'],['Selatan','12.00 m','N 90°00′00″ E','bendang']];
/* Jalan: konteks sahaja, lebar anggaran. off = jarak tepi dalam dari sempadan, w = lebar */
const ROADS=[{side:1,off:.6,w:3.4,ext:[30,30],k:'asphalt',n:'Jalan berturap'},{side:2,off:.4,w:3.0,ext:[4,25],k:'laterite',n:'Jalan dalam (tanah)'}];
/* Pokok sedia ada (M1001): pusat & jejari kanopi pada pelan */
const TREES=[
  {k:'kelapa',x:-5.6,y:11.6,r:2.5,n:'Pokok kelapa sedia ada'},
  {k:'mangga',x:21.86,y:2.3,r:2.05,n:'Pokok mangga sedia ada'},
  {k:'rendang',x:8.8,y:11.85,r:1.47,n:'Pokok sedia ada'}
];
/* Kemudahan tapak (M1002) */
const UTIL=[
  {k:'ist',x:-1.97,y:-.95,d:1.5,t:'Tangki septik individu (IST)',rows:[['Jenis','Diluluskan SPAN, saiz ikut cadangan kontraktor'],['Diameter dilukis','≈1.5 m']]},
  {k:'ic',x:3.01,y:-1.95,t:'Kebuk pemeriksaan IC 1'},{k:'ic',x:-1.57,y:2.92,t:'Kebuk pemeriksaan IC 2'},{k:'ic',x:-2.29,y:5.12,t:'Kebuk pemeriksaan IC 3'},
  {k:'sump',x:-1.97,y:8.64,t:'Sump 600 × 600 mm',rows:[['Binaan','Konkrit bertetulang, jeriji G.I. boleh tanggal'],['Kedalaman','Ikut invert longkang']]},
  {k:'tank',x:-1.86,y:10.86,d:1.23,h:2.08,t:'Tangki air 1,500 liter',rows:[['Model','King Kong HR150 keluli tahan karat, kaki menegak'],['Saiz','Ø1230 × 2080 mm'],['Tapak','Papak konkrit bertetulang 150 mm atas hardcore, 100 mm atas aras tanah']]},
  {k:'pump',x:.14,y:11.16,w:.9,l:.6,h:1.0,t:'Kebuk pam penggalak',rows:[['Saiz dalam','≈900 × 600 × 1000 mm'],['Penutup','Kalis cuaca, bolong udara']]},
  {k:'well',x:11.59,y:12.95,d:1.2,t:'Perigi sedia ada',rows:[['Cadangan','Pam perigi tenggelam (submersible)']]},
  /* Perangkap & pili (M1002, diukur pada skala 1:100); z = aras tapak */
  {k:'gt',x:9.5,y:-.19,z:.05,t:'Gully trap GT 1',rows:[['Lokasi','Apron di luar Bilik Air 1, sebelah VP 1'],['Saiz','Ikut cadangan kontraktor']]},
  {k:'gt',x:6.17,y:-.19,z:.05,t:'Gully trap GT 2',rows:[['Lokasi','Apron di luar Bilik Air 2, sebelah VP 2'],['Saiz','Ikut cadangan kontraktor']]},
  {k:'gt',x:-.17,y:4.08,z:.05,t:'Gully trap GT 3',rows:[['Lokasi','Apron di luar Bilik Air 3, sebelah VP 3'],['Saiz','Ikut cadangan kontraktor']]},
  {k:'grt',x:2.2,y:8.08,z:.05,w:.6,l:.3,t:'Perangkap gris (GRT)',rows:[['Lokasi','Di luar dinding dapur (grid A), ke sisa dapur'],['Saiz dilukis','≈600 × 300 mm'],['Jenis','Ikut cadangan kontraktor']]},
  {k:'wtp',x:15.68,y:-1.24,t:'Pili air luar WT 1',rows:[['Lokasi','Bucu teres sisi lorong'],['Butiran','Ikut butiran arkitek (tiada dalam set lukisan); tapak ≈600 × 600 mm dilukis']]},
  {k:'ft',x:1.67,y:7.66,z:.45,t:'Perangkap lantai (FT) yard',rows:[['Lokasi','Bucu yard, sebelah dinding dapur']]},
  {k:'ft',x:2.575,y:7.025,z:.5,t:'Perangkap lantai (FT) dapur',rows:[['Lokasi','700 mm dari muka dinding grid A dan dinding yard']]},
  {k:'wt',x:1.725,y:7.44,z:.45,t:'Pili air WT 2 (yard)',rows:[['Lokasi','Dinding dapur, sisi yard'],['Ketinggian','1000 mm dari lantai yard (keratan 1-1)']]}
];

/* ================= Penghawa dingin (D9001, diukur pada skala 1:75) ================= */
const AC={
  inside:[[2.705,1.52,2.925,2.4],[5.705,1.45,5.925,2.47],[7.275,1.26,7.495,2.25],[9.975,1.9,10.195,2.9]],
  outside:[[2.65,-.53,3.38,-.23],[6.23,-.53,6.99,-.23],[9.62,-.53,10.37,-.23],[-.53,2.9,-.15,3.73]]
};

/* ================= Render fotorealistik (Blender Cycles, 24 Okt, kedudukan matahari Kangar) ================= */
const RENDERS=[
  {f:'luar_pagi', t:'Pandangan dari timur laut (lorong)', m:'8:00 pagi'},
  {f:'lanai_petang', t:'Lanai dan pintu masuk utama', m:'5:15 petang'},
  {f:'luar_jalan', t:'Hadapan dari jalan berturap', m:'12:45 tengah hari'},
  {f:'luar_udara', t:'Pandangan udara', m:'11:30 pagi'},
  {f:'luar_senja', t:'Senja, lampu menyala', m:'7:12 malam'},
  {f:'dalam_tamu', t:'Ruang tamu ke ruang makan', m:'4:30 petang'},
  {f:'dalam_bilik1', t:'Bilik 1 (utama)', m:'4:30 petang'},
  {f:'dalam_dapur', t:'Dapur', m:'12:30 tengah hari'},
  {f:'dalam_bilikair1', t:'Bilik Air 1', m:'12:30 tengah hari'}
];
/* ================= Gaya kemasan (pilihan pemilik; BUKAN sebahagian lukisan arkitek) =================
   'arkitek' = kemasan ikut lukisan (lalai). Gaya lain menukar warna bahan & jubin sahaja; geometri tidak berubah.
   warna: kunci bahan M (core.js) · roof = jubin & bubung · frame = bingkai & louvre. lantai: id bilik → kunci FIN. */
const GAYA=[
  {id:'arkitek', n:'Arkitek', t:'Ikut lukisan AZR', sw:['#f2f0eb','#5f6265'], nota:'Kemasan dan warna ikut set lukisan arkitek (D1001–D1006). Pilih gaya lain untuk melihat cadangan earth tone; lukisan tidak berubah.'},
  {id:'tropika', n:'Tropika', t:'Tropika moden · Nippon Paint', sw:['#dcc4ae','#5a4334'],
   nota:'Dinding pasir hangat, aksen tanah liat pada tiang dan gable, plinth gelap untuk percikan hujan. Cat luar Nippon Weatherbond (anti-kulat). Kod warna ≈ daripada carian; sahkan dengan kad warna sebenar.',
   warna:{aksen:'#ad664b',wall:'#dcc4ae',wallIn:'#f1e6d6',col:'#ad664b',siding:'#ad664b',plinth:'#79544b',fascia:'#79544b',soffit:'#f1e6d6',ceil:'#f3ede1',roof:'#5a4334',frame:'#4a3c30',door:'#7b4f2c',rail:'#1e1e1e',
          kcab:'#6b4a33',kcab2:'#ede3d1',counter:'#d9cbb3',wood2:'#6b4a33',oak:'#8a5a3b',fabric:'#cbb89a',fabric2:'#8a6a4f',linen:'#ede3d1',throwA:'#ad664b',throwB:'#79544b'},
   lantai:{tamu:'sx05',makan:'sx05',dapur:'sx05',b2:'sx05',b3:'sx05',b4:'sx05',lanai:'ls02',balkoni:'ls02',yard:'ls02'}, langsir:'#ede3d1',
   butiran:[['Dinding TV','Nippon Good Earth NP YO 2415D','#ad664b'],['Dinding luar','Nippon Basket Beige NP N 1879P · LRV 58','#dcc4ae'],['Dinding dalam','Nippon Almond Bits NP OW 2204P','#f1e6d6'],['Tiang & gable','Nippon Good Earth NP YO 2415D','#ad664b'],
     ['Plinth & fascia','Nippon Red Earth NP R 1379A','#79544b'],['Siling','Nippon Cotton White NP OW 2200P','#f3ede1'],['Bumbung','Monier Elabana Tropical · Mocha Brown','#5a4334'],
     ['Bingkai','Aluminium dark bronze','#4a3c30'],['Pintu utama','Kayu chengal / merbau, minyak semula jadi','#7b4f2c'],['Lantai dalam','Feruni Stone X Lime SX05M · 600×600 matt','#cdbb9e'],
     ['Lanai & balkoni','Feruni Limestone 2.0 Beige LS02 · 300×600 Griptech','#b9aa8c'],['Bilik 1','Strip kayu (ikut lukisan)','#9e6039'],['Kabinet dapur','Walnut (bawah) + krim (atas)','#6b4a33']]},
  {id:'japandi', n:'Japandi', t:'Japandi hangat · Nippon Paint', sw:['#ddcfc0','#2c2b2a'],
   nota:'Beige hangat, oak cerah dan hitam lembut (palet artikel Japandi Nippon Malaysia). Hitam hanya pada plinth, fascia dan bingkai. Bumbung Ebony paling panas: pasang penebat di bawah jubin. Kod ≈; sahkan dengan kad warna.',
   warna:{aksen:'#c3a585',wall:'#ddcfc0',wallIn:'#ddcfc0',col:'#c3a585',siding:'#c3a585',plinth:'#504845',fascia:'#504845',soffit:'#f3ede1',ceil:'#f3ede1',roof:'#2c2b2a',frame:'#232221',door:'#c8a57a',rail:'#2a2726',
          kcab:'#c9a77c',kcab2:'#e6ddcf',counter:'#efe9df',wood2:'#b08a60',oak:'#c9a77c',fabric:'#d8cfc0',fabric2:'#8f8578',linen:'#efe9de',throwA:'#504845',throwB:'#c3a585'},
   lantai:{tamu:'blitzen',makan:'blitzen',dapur:'blitzen',b1:'oakstrip',b2:'blitzen',b3:'blitzen',b4:'blitzen',lanai:'ls01',balkoni:'ls01',yard:'ls01'}, langsir:'#efe9de',
   butiran:[['Dinding TV','Nippon Natural Oak NP N 1871T','#c3a585'],['Dinding luar & dalam','Nippon Wall Arte NP N 1865P · LRV 64','#ddcfc0'],['Pilihan ruang tamu','Nippon Birch Patina NP N 1852P','#d4ccbf'],['Tiang & gable','Nippon Natural Oak NP N 1871T','#c3a585'],
     ['Plinth & fascia','Nippon Painted Faces NP N 1925A','#504845'],['Siling & sofit','Nippon Cotton White NP OW 2200P','#f3ede1'],['Bumbung','Monier Elabana Tropical · Ebony','#2c2b2a'],
     ['Bingkai','Aluminium hitam matte','#232221'],['Pintu utama','Kayu nyatoh / oak cerah, matte jernih','#c8a57a'],['Lantai dalam','Niro Granite Blitzen Stone Bright GGBZ01 · 60×120 / 60×60','#d9d2c4'],
     ['Lanai & balkoni','Feruni Limestone 2.0 Almond LS01 · 300×600 Griptech','#d3c8b3'],['Bilik 1','Strip oak cerah','#c9a77c'],['Kabinet dapur','Oak cerah + krim matte','#c9a77c']]},
  {id:'bali', n:'Bali', t:'Bali / rustik tropika · Jotun', sw:['#d0a892','#8e4a35'],
   nota:'Dinding Tuscany berlepa pasir halus, aksen terracotta, plinth batu, bumbung merah tanah. Warna dinding sederhana gelap menyerap lebih haba; cucur 725 mm membantu. Batu & terracotta perlu sealer. Kod ≈; sahkan dengan kad warna.',
   warna:{aksen:'#d0a892',wall:'#d0a892',wallIn:'#f0efe2',col:'#9e6e63',siding:'#9e6e63',plinth:'#c9b48e',fascia:'#59473f',soffit:'#f0efe2',ceil:'#f0efe2',roof:'#8e4a35',frame:'#6b4a30',door:'#4a2f1f',rail:'#1c1c1c',
          kcab:'#5a3a26',kcab2:'#efe6d4',counter:'#d9cbb3',wood2:'#4a2f1f',oak:'#6a3f27',fabric:'#e8dcc6',fabric2:'#9e6e63',linen:'#efe6d4',throwA:'#af957a',throwB:'#9e6e63'},
   lantai:{tamu:'tv02',makan:'tv02',dapur:'tv02',b1:'merbau',b2:'tv02',b3:'tv02',b4:'tv02',lanai:'terra',balkoni:'terra',yard:'terra'}, langsir:'#c9b28d',
   butiran:[['Dinding TV','Jotun 2225 Tuscany, rupa limewash','#d0a892'],['Dinding luar','Jotun 2225 Tuscany · Jotashield · LRV ≈44','#d0a892'],['Dinding dalam','Jotun 1453 Vanilla','#f0efe2'],['Tiang & gable','Jotun 2111 Burned Terracotta','#9e6e63'],
     ['Plinth','Batu pasir Palimanan (perlu sealer)','#c9b48e'],['Fascia','Nippon Painted Frame NP N 1904A','#59473f'],['Bumbung','Monier Elabana Tropical · Antique Red','#8e4a35'],
     ['Bingkai','Powder coat rupa kayu / bronze gelap','#6b4a30'],['Pintu utama','Merbau / chengal, stain walnut gelap','#4a2f1f'],['Lantai dalam','Feruni Travertino 2.0 Beige TV02MH · 600×600','#dccba8'],
     ['Lanai & balkoni','Terracotta Vietnam 300×300 (GNG Tiles)','#b5653f'],['Bilik 1','Strip merbau gelap','#6a3f27'],['Kabinet dapur','Walnut gelap + krim','#5a3a26']]}
];
/* Dinding aksen (muka dalam sahaja): dinding TV ruang tamu (M1004). h = dinding mendatar pada y = f, dari a1 ke a2; sg = sisi (−1 = sisi −y) */
const AKSEN=[{h:true,f:7.8,a1:8.4,a2:12.3,sg:-1}];
/* Syot render untuk gaya earth tone (render/gaya/<id>/); set Arkitek kekal dalam render/.
   GAYA_SEDIA = gaya yang rendernya sudah ada; gaya lain memaparkan set Arkitek dengan nota. */
const GAYA_SEDIA=['tropika','japandi','bali'];
const RENDER_GAYA=['luar_pagi','lanai_petang','luar_senja','dalam_tamu','dalam_bilik1','dalam_dapur'];
const PANO_GAYA=['p_tamu'];
/* Panorama 360° (equirectangular); yaw = arah pandangan awal (darjah): 0 = utara (+x, jalan), −90 = barat (+y, rumah keluarga), 90 = timur (−y, lorong), 180 = selatan (−x, bendang) */
const PANOS=[
  {f:'p_tamu', t:'Ruang tamu & makan', yaw:0},
  {f:'p_bilik1', t:'Bilik 1 (utama)', yaw:-90},
  {f:'p_dapur', t:'Dapur', yaw:-110},
  {f:'p_lanai', t:'Lanai & teres', yaw:180}
];
