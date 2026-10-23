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
  trav:    {base:'#e7dabe',grout:'#c8b994',pw:1.2,ph:0.6,speck:true,stagger:true,seed:29,rough:.6, nama:'Travertine Cream', kod:'Kimgress A36TV2LME · 300×600 · flat satin'}
};
/* ================= Data maklumat (jadual lukisan) ================= */
const INFO={
  W1:{t:'W1 · Tingkap bilik tidur',ref:'D3002',rows:[['Jenis','Casement aluminium 3 panel + panel kaca tetap atas'],['Saiz','1800 × 2100 mm, ambang 300 mm (kepala 2400)'],['Kaca','Kaca keselamatan terbaja berwarna'],['Bingkai','Aluminium, salutan serbuk'],['Kuantiti','4 (semua bilik tidur)']]},
  W2:{t:'W2 · Tingkap sempit',ref:'D3002',rows:[['Jenis','Top-hung aluminium + panel kaca tetap atas'],['Saiz','450 × 2100 mm, ambang 300 mm'],['Kaca','Kaca keselamatan terbaja berwarna'],['Kuantiti','5 (Bilik 1: 3, Ruang tamu: 2)']]},
  W3:{t:'W3 · Tingkap bilik air',ref:'D3002',rows:[['Jenis','Top-hung atas + kaca tetap bawah'],['Saiz','750 × 900 mm, ambang 1200 mm'],['Kaca','Kaca frosted / obscure terbaja'],['Kuantiti','2 (Bilik air 1 & 2)']]},
  W4:{t:'W4 · Tingkap bilik air 3',ref:'D3002',rows:[['Jenis','Top-hung aluminium 2 panel (525 + 525)'],['Saiz','1050 × 450 mm, ambang 1650 mm'],['Kaca','Kaca frosted / obscure terbaja'],['Kuantiti','1']]},
  W5:{t:'W5 · Tingkap dapur',ref:'D3002',rows:[['Jenis','Gelangsar 4 panel: 2 tetap di tepi, 2 gelangsar di tengah'],['Saiz','3150 × 600 mm (4 × 788), ambang 1000 mm'],['Kaca','Kaca jernih / berwarna terbaja'],['Kuantiti','1']]},
  W6:{t:'W6 · Tingkap kaca tetap ruang tamu',ref:'D3002',rows:[['Jenis','Kaca tetap aluminium, 3 panel sama'],['Saiz','2100 × 2100 mm, ambang 300 mm'],['Kaca','Kaca terbaja (tertakluk kelulusan arkitek)'],['Kuantiti','1 (menghadap lanai)']]},
  MD1:{t:'MD1 · Pintu masuk utama',ref:'D3001',rows:[['Jenis','Pintu kayu pejal satu daun'],['Saiz','1000 × 2400 mm'],['Daun','Kayu pejal 44 mm'],['Bingkai','Kayu keras, kemasan stain + varnis'],['Perkakasan','Engsel berat, pemegang tuil, kunci mortis, deadbolt'],['Lokasi','Lanai ke ruang tamu (1)']]},
  D1:{t:'D1 · Pintu dapur ke yard',ref:'D3001',rows:[['Jenis','Pintu kayu pejal satu daun'],['Saiz','900 × 2100 mm'],['Ambang','Batu tumit konkrit 100 mm'],['Lokasi','Dapur ke yard (1)']]},
  D2:{t:'D2 · Pintu bilik tidur',ref:'D3001',rows:[['Jenis','Pintu flush kayu satu daun'],['Saiz','900 × 2100 mm'],['Daun','Papan lapis 38 mm, lipping kayu keras'],['Bingkai','Keluli lembut tekan, salutan serbuk'],['Kuantiti','4 (semua bilik tidur)']]},
  D3:{t:'D3 · Pintu bilik air',ref:'D3001',rows:[['Jenis','Pintu lipat (bi-fold) panel komposit aluminium, corak louver'],['Saiz','750 mm pada pelan (jadual tulis 900) × 2100 mm — perlu sahkan'],['Ambang','Batu tumit konkrit 100 mm'],['Kuantiti','3 (Bilik air 1, 2, 3)']]},
  GD1:{t:'GD1 · Pintu kaca lipat balkoni',ref:'D3001',rows:[['Jenis','Pintu kaca lipat aluminium 4 panel + panel tetap atas 300 mm'],['Saiz','2700 × 2100 mm (jumlah 2400 dengan panel atas)'],['Kaca','Kaca keselamatan terbaja berwarna'],['Lokasi','Ruang makan ke balkoni (1)']]},
  GD2:{t:'GD2 · Pintu kaca dapur',ref:'D3001',rows:[['Jenis','Pintu kaca aluminium berengsel + panel kaca tetap atas'],['Saiz','900 × 2100 mm (jumlah 2850 dengan panel atas)'],['Kaca','Kaca keselamatan terbaja jernih'],['Lokasi','Ruang makan ke dapur (1)']]},
  WALL:{t:'Dinding',ref:'D7001 · M1006',rows:[['Binaan','Bata 110 mm + lepa simen-pasir 20 mm kedua-dua muka'],['Tebal','≈150 mm'],['Tinggi','FFL ke rasuk bumbung 3300 mm'],['Kemasan','Cat; warna ikut pilihan arkitek']]},
  COL:{t:'Tiang & rasuk konkrit',ref:'M1005',rows:[['Binaan','Konkrit bertetulang 200 × 200 mm'],['Kemasan','Lepa simen-pasir + cat luar'],['Lokasi','Bucu yard, lanai dan teres']]},
  RAIL:{t:'Pagar besi',ref:'D6001–D6004',rows:[['Tinggi','900 mm dari FFL (nota); E3, E4 dan butiran D6001–D6004 tunjuk 850 mm'],['Bahan','Besi lembut, salutan serbuk hitam matte'],['Susunan','Pemegang atas 50×10 mm; bar isian menegak 40×10 mm @ 100 mm c/c'],['Tapak','Plat asas 100×100×6 mm, 2 bolt sauh (D6002)'],['Lokasi','Yard, lanai (termasuk sisi tangga), balkoni']]},
  STEPS:{t:'Anak tangga',ref:'D7006 · D7007',rows:[['Ukuran','Naik 100 mm, jejak 300 mm, stepnose bucu bulat'],['Lanai','3 naik dari lanai, jejak bawah 900 mm, lebar ≈1050 mm'],['Yard','4 jejak × 300 mm, lebar 900 mm'],['Kemasan','Jubin homogenous ±10 mm atas screed 1:3']]},
  ROOF:{t:'Bumbung',ref:'M1004 · M1005 · D5001',rows:[['Bentuk','Limas, dengan gable di atas lanai & teres'],['Jubin','Jubin konkrit interlocking + rabung, bubung & verge sepadan'],['Cerun','30°'],['Aras','Rasuk bumbung +3.80 m; rabung ≈+6.40 m (anggaran maksimum M1005)'],['Cucur atap','725 mm dari muka dinding'],['Lurah (valley)','Talang G.I. 18 gauge, lebar 375 mm'],['Struktur','Kekuda keluli ringan @ 600 mm, foil pemantul di bawah jubin'],['Fascia & sofit','Papan simen gentian; sofit luaran mengikut cerun'],['Warna','Belum ditetapkan dalam lukisan']]},
  GABLE:{t:'Dinding gable teres',ref:'M1005 (E1)',rows:[['Kemasan','Papan mendatar (≈ ikut lukisan E1) dengan bolong udara'],['Kedudukan','Atas rasuk teres, grid 6 + 1200'],['Nota','Bahan tepat tidak dinyatakan']]},
  VP:{t:'Paip udara (VP)',ref:'M1001 · M1002',rows:[['Saiz','uPVC Ø100 mm'],['Ketinggian','Sekurang-kurangnya 600 mm (M1001) / 900 mm (M1002) di atas bumbung, dengan cowl'],['Lokasi','VP1 Bilik Air 1, VP2 Bilik Air 2, VP3 Bilik Air 3']]},
  DB:{t:'Papan agihan (DB)',ref:'M1002 · D9001',rows:[['Lokasi','Dinding lanai, sebelah tangga']]},
  TILEW:{t:'Jubin dinding bilik air',ref:'D1001–D1004',rows:[['Jubin','Kimgress Travertine A36TV2LME · 300×600 · Cream · flat satin'],['Susunan','Mendatar, lantai ke siling, semua bilik air']]},
  KITKAT:{t:'Jubin ciri Kit Kat',ref:'D1001 · D1002',rows:[['Jubin','GNG & TTC Kit Kat KBT CT-CZ0919Y · 300×300 · Deep Brown, glazed'],['Lokasi','Bilik Air 1, dinding 2 & 4, dari ≈900 mm ke siling']]},
  SILL:{t:'Ambang tingkap luar',ref:'D3002 · D8001 · D8002',rows:[['Bahan','Aluminium / konkrit'],['Kecerunan','Condong ke luar']]},
  DRAIN:{t:'Longkang U',ref:'M1002',rows:[['Jenis','Longkang U konkrit pratuang, lebar 300 mm, condong mengalir'],['Kedudukan','Apron 600 mm + longkang 300 mm dari muka dinding (keratan M1006); sisi A di luar balkoni ≈'],['Saluran keluar','Tidak ditunjukkan dalam lukisan'],['Penutup','Papak konkrit di sisi teres']]},
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
  SQ:{t:'Mangkuk tandas cangkung (Bilik air 3)',ref:'D2001 · D2007',rows:[['Model','Sericite SQ7004 Regal square, tangki PVC tuil'],['Butiran','Stepnose bucu bulat, kawasan cangkung dp 75 mm']]},
  B1:{t:'Sinki atas kaunter (Bilik air 1)',ref:'D2001 · D2002',rows:[['Sinki','Johnson Suisse WBVC950143WW Valencia slim, putih matte'],['Pili','Johnson Suisse WBFA301351CP Trento tuil tinggi'],['Perangkap','WBFT400992CP brass bottle trap'],['Kaunter','Meja konkrit 100 mm berjubin, tinggi 850 mm']]},
  B2:{t:'Sinki dinding (Bilik air 2 & 3)',ref:'D2001',rows:[['Sinki','Sericite WB 2027 Natralite 345 × 305 × 125 mm'],['Pili','Sericite SR91020 tuil tunggal air sejuk'],['Sisa','Sericite A70001 pop-up 32 mm']]},
  SHW1:{t:'Pancuran (Bilik air 1)',ref:'D2001',rows:[['Model','Johnson Suisse WBFA301568CP Trento mixer dinding + palang gelangsar'],['Perangkap lantai','Evans SG-668ST linear 600 mm keluli tahan karat']]},
  SHW2:{t:'Pancuran (Bilik air 2 & 3)',ref:'D2001',rows:[['Kepala','Sericite SH60005 + lengan A70006 150 mm'],['Injap','Sericite SR16002 tuil tersembunyi'],['Perangkap lantai','Sericite A70004C 5" × 5"']]},
  HB:{t:'Bidet tangan',ref:'D2001',rows:[['Model','Johnson Suisse WBFA301562CP, hos 1.2 m, injap sudut']]},
  WTHS:{t:'Pili dengan semburan tangan',ref:'D2001',rows:[['Model','Sericite SR16012 pili dinding 2 hala + SR12022']]},
  MR:{t:'Cermin LED (Bilik air 1)',ref:'D2001',rows:[['Model','Evans LW03 cermin bujur LED 900 × 500 mm'],['Cahaya','3 warna']]},
  FURN:{t:'Perabot',ref:'M1004',rows:[['Sumber','Susun atur perabot M1004'],['Saiz','Anggaran sahaja — bukan sebahagian kontrak bangunan']]},
  KIT:{t:'Kabinet dapur',ref:'M1004 · M1006-4',rows:[['Kaunter','Tinggi 900 mm, bentuk L di dinding W5 dan dinding yard'],['Dapur masak & sinki','Kedua-duanya di bawah tingkap W5 (sinki ikut kedudukan KT)'],['Kabinet atas','Di atas tingkap W5'],['Nota','Saiz anggaran daripada pelan perabot']]},
  AC:{t:'Penghawa dingin (split)',ref:'D9001',rows:[['Unit dalam','Unit dinding di Bilik 1, 2, 3 dan 4'],['Unit luar','3 kondenser di luar dinding grid C, 1 di luar dinding grid 1'],['Kapasiti','Tidak dinyatakan dalam lukisan']]}
};

/* ================= Bilik (luas ikut M1003) ================= */
const ROOMS=[
  {id:'yard', n:'Yard', a:'4.86', f:'orche', lv:.45, r:[[0,5.1,1.8,6.6],[0.9,6.6,1.8,7.8]], full:[0,5.1,1.8,7.8], c:'SOFFIT', ch:CEIL},
  {id:'ba3', n:'Bilik Air 3', a:'2.16', f:'trav', lv:.45, r:[[0,3.9,1.8,5.1]], s:.75, c:'CEILMR', ch:CEILW},
  {id:'dapur', n:'Dapur', a:'12.87', f:'castello', lv:.5, r:[[1.8,3.9,5.1,7.8]], c:'CEILMR', ch:CEIL},
  {id:'makan', n:'Ruang Makan', a:'15.39', f:'padova', lv:.5, r:[[5.1,3.9,8.4,7.8],[6,1.8,7.2,3.9]], at:[6.75,5.9], c:'CEIL', ch:CEIL},
  {id:'tamu', n:'Ruang Tamu', a:'15.21', f:'padova', lv:.5, r:[[8.4,3.9,12.3,7.8]], c:'CEIL', ch:CEIL},
  {id:'lanai', n:'Lanai', a:'10.53', f:'orche', lv:.45, r:[[12.3,3.9,13.5,7.8],[13.5,3.9,15,4.25],[13.5,5.3,15,7.8]], full:[12.3,3.9,15,7.8], at:[13.65,6.1], c:'SOFFIT', ch:CEIL},
  {id:'balkoni', n:'Balkoni', a:'2.52', f:'orche', lv:.45, r:[[5.1,7.8,8.4,8.55]], s:.7, lift:.2, c:null},
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
  W6:{w:2.1,sill:.3,h:2.1,k:'win',div:3},
  GD1:{w:2.7,sill:0,h:2.4,k:'win',div:4,tr:[2.1]},
  GD2:{w:.9,sill:0,h:2.85,k:'gdoor',tr:[2.1]},
  MD1:{w:1.0,sill:0,h:2.4,k:'door'},
  D1:{w:.9,sill:0,h:2.1,k:'door'},
  D2:{w:.9,sill:0,h:2.1,k:'door'},
  D3:{w:.75,sill:0,h:2.1,k:'bifold'}
};
const op=(type,c,open)=>Object.assign({type,c,open:open||1},TYPES[type]);
const WALLS=[
  [0,0,15,0,[op('W1',1.425),op('W1',4.425),op('W3',6.525),op('W1',8.175),op('W3',9.675),op('W1',13.5)]],
  [15,0,15,3.9,[op('W2',1.275),op('W2',2.025),op('W2',2.775)]],
  [1.8,7.8,12.3,7.8,[op('W5',1.65),op('GD1',4.95),op('W2',7.275),op('W2',9.75)]],
  [0,0,0,5.1,[op('W4',4.5)]],
  [0,3.9,6.0,3.9,[op('D2',2.45,-1),op('D2',5.55,-1)]],
  [7.2,3.9,15,3.9,[op('D2',.55,-1),op('D2',3.2,-1)]],
  [3,0,3,3.9],[6,0,6,3.9],[7.2,0,7.2,3.9],
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
  {id:'lanai', x1:13.5, y1:4.25, x2:15, y2:5.3, dir:'x+', d:[.3,.3,.9], h:[.35,.25,.15]},
  {id:'yard',  x1:0,    y1:6.6,  x2:.9, y2:7.8, dir:'y+', d:[.3,.3,.3,.3], h:[.35,.25,.15,.05]}
];
/* [x1,y1,x2,y2,aras tapak] */
const RAILS=[
  [0,5.1,0,7.8,.45],[.9,7.8,1.8,7.8,.45],
  [15,5.3,15,7.8,.45],[12.3,7.8,15,7.8,.45],[15,3.9,15,4.25,.45],[13.5,5.3,15,5.3,.45],
  [5.1,8.55,8.4,8.55,.45],[5.1,7.8,5.1,8.55,.45],[8.4,7.8,8.4,8.55,.45]
];
const COLS=[[0,7.8],[15,7.8],[16.1,7.7],[16.1,3.9]];

/* ================= Bumbung (M1004, M1005, D5001) ================= */
/* Cucur 725 mm dari muka dinding = 0.80 m dari grid. Cerun 30°. Rabung utama ≈ +6.40 m (anggaran maksimum M1005).
   Gable di atas lanai & teres: rabung di tengah lanai (y = 5.85), hujung pada grid 6 + 1.2 + 0.8. */
const RF={x0:-.8, x1:15.8, y0:-.8, y1:8.6, ridge:6.4, pitch:Math.PI/6, gx:17.0, gy:5.85, depth:.25, gableX:16.2};

/* ================= Kemasan dinding bilik air (D1001–D1004) ================= */
/* kit: sisi dinding berjubin Kit Kat ('y1' = sisi y kecil, 'y2' = sisi y besar, 'x1', 'x2'); kz = tinggi mula dari lantai */
const WTILE={ba1:{kit:['y1','y2'],kz:.9}, ba2:{}, ba3:{}};

/* ================= Paip udara VP (M1001, M1002) ================= */
const VPIPE=[{n:'VP1',x:9.4,y:-.13},{n:'VP2',x:6.15,y:-.13},{n:'VP3',x:-.13,y:4.05}];

/* ================= Tapak (M1001, M1002) ================= */
/* Utara = −x (ke arah grid 1). Sempadan ikut bering & jarak M1001 (dilalui ikut arah jam).
   Grid 1 → sempadan utara 3 000 (bertulis); grid A → sempadan timur ≈ 1.52 m (diukur pada skala 1:100). */
const LOT=[[-3,9.322],[23.94,9.322],[24.534,-6.757],[-3,-2.678]];
const LOT_SIDES=[['Timur','26.94 m','S 0°00′00″ W','jiran'],['Selatan','16.09 m','S 87°52′59″ W','jalan berturap'],['Barat','27.83 m','N 8°26′09″ E','jalan dalam'],['Utara','12.00 m','N 90°00′00″ E','']];
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
  {k:'well',x:11.59,y:12.95,d:1.2,t:'Perigi sedia ada',rows:[['Cadangan','Pam perigi tenggelam (submersible)']]}
];

/* ================= Penghawa dingin (D9001, diukur pada skala 1:75) ================= */
const AC={
  inside:[[2.705,1.52,2.925,2.4],[5.705,1.45,5.925,2.47],[7.275,1.26,7.495,2.25],[9.975,1.9,10.195,2.9]],
  outside:[[2.65,-.53,3.38,-.23],[6.23,-.53,6.99,-.23],[9.62,-.53,10.37,-.23],[-.53,2.9,-.15,3.73]]
};

/* ================= Render fotorealistik (Blender Cycles, 23 Okt, kedudukan matahari Kangar) ================= */
const RENDERS=[
  {f:'luar_petang', t:'Pandangan dari barat daya', m:'5:30 petang'},
  {f:'lanai_petang', t:'Lanai dan pintu masuk utama', m:'5:15 petang'},
  {f:'luar_jalan', t:'Hadapan dari jalan berturap', m:'12:45 tengah hari'},
  {f:'luar_udara', t:'Pandangan udara', m:'11:30 pagi'},
  {f:'luar_senja', t:'Senja, lampu menyala', m:'7:12 malam'},
  {f:'dalam_tamu', t:'Ruang tamu ke ruang makan', m:'4:30 petang'},
  {f:'dalam_bilik1', t:'Bilik 1 (utama)', m:'4:30 petang'},
  {f:'dalam_dapur', t:'Dapur', m:'12:30 tengah hari'},
  {f:'dalam_bilikair1', t:'Bilik Air 1', m:'12:30 tengah hari'}
];
/* Panorama 360° (equirectangular); yaw = arah pandangan awal (darjah) */
const PANOS=[
  {f:'p_tamu', t:'Ruang tamu & makan', yaw:0},
  {f:'p_bilik1', t:'Bilik 1 (utama)', yaw:0},
  {f:'p_dapur', t:'Dapur', yaw:0},
  {f:'p_lanai', t:'Lanai & teres', yaw:0}
];
