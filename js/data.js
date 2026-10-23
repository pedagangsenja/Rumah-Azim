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
  RAIL:{t:'Pagar besi',ref:'D6001–D6004',rows:[['Tinggi','900 mm dari FFL'],['Bahan','Besi lembut, salutan serbuk hitam matte'],['Susunan','Pemegang atas 50×10 mm; bar isian menegak 40×10 mm @ 100 mm c/c'],['Lokasi','Yard, lanai, balkoni']]},
  STEPS:{t:'Anak tangga',ref:'D7006 · D7007',rows:[['Ukuran','4 anak tangga, naik 100 mm, jejak 300 mm'],['Lokasi','Yard (lebar 900) dan lanai (lebar 900–1200)']]},
  ROOF:{t:'Bumbung limas',ref:'M1004 · M1006',rows:[['Jubin','Jubin bumbung konkrit interlocking + rabung & bubung sepadan'],['Cerun','30°'],['Aras','Rasuk bumbung +3.80 m, rabung +6.40 m'],['Cucur atap','600 mm (725 mm ukuran luar)'],['Struktur','Kekuda keluli ringan, foil pemantul di bawah jubin'],['Fascia','Papan simen gentian'],['Warna','Belum ditetapkan dalam lukisan']]},
  CEIL:{t:'Siling gipsum',ref:'D4001',rows:[['Bahan','Papan gipsum 9 mm pada rangka logam bergalvani tergantung'],['Tinggi','≈2850 mm dari FFL (anggaran daripada keratan)'],['Kemasan','Cat; warna ikut pilihan arkitek']]},
  CEILMR:{t:'Siling gipsum tahan lembap',ref:'D4001',rows:[['Bahan','Papan gipsum MR 9 mm, cat anti-kulat'],['Tinggi','Bilik air 2400 mm dari FFL; dapur ≈2850 mm'],['Lokasi','Dapur dan bilik air']]},
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
  KIT:{t:'Kabinet dapur',ref:'M1004 · M1006',rows:[['Kaunter','Tinggi ≈900 mm, bentuk L di sepanjang dinding W5'],['Kabinet atas','Di atas tingkap W5'],['Nota','Saiz anggaran daripada pelan perabot']]}
};

/* ================= Bilik (luas ikut M1003) ================= */
const ROOMS=[
  {id:'yard', n:'Yard', a:'4.86', f:'orche', lv:.45, r:[[0,5.1,1.8,6.6],[0.9,6.6,1.8,7.8]], full:[0,5.1,1.8,7.8], c:'SOFFIT', ch:CEIL},
  {id:'ba3', n:'Bilik Air 3', a:'2.16', f:'trav', lv:.45, r:[[0,3.9,1.8,5.1]], s:.75, c:'CEILMR', ch:CEILW},
  {id:'dapur', n:'Dapur', a:'12.87', f:'castello', lv:.5, r:[[1.8,3.9,5.1,7.8]], c:'CEILMR', ch:CEIL},
  {id:'makan', n:'Ruang Makan', a:'15.39', f:'padova', lv:.5, r:[[5.1,3.9,8.4,7.8],[6,1.8,7.2,3.9]], at:[6.75,5.9], c:'CEIL', ch:CEIL},
  {id:'tamu', n:'Ruang Tamu', a:'15.21', f:'padova', lv:.5, r:[[8.4,3.9,12.3,7.8]], c:'CEIL', ch:CEIL},
  {id:'lanai', n:'Lanai', a:'10.53', f:'orche', lv:.45, r:[[12.3,3.9,13.8,7.8],[13.8,3.9,15,4.25],[13.8,5.2,15,7.8]], full:[12.3,3.9,15,7.8], at:[13.65,6.1], c:'SOFFIT', ch:CEIL},
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
  [0,3.9,6.0,3.9,[op('D2',2.45),op('D2',5.55,-1)]],
  [7.2,3.9,15,3.9,[op('D2',.55,-1),op('D2',3.2,-1)]],
  [3,0,3,3.9],[6,0,6,3.9],[7.2,0,7.2,3.9],
  [6,1.8,7.2,1.8,[op('D3',.45)]],
  [9.3,0,9.3,1.8],[9.3,1.8,10.95,1.8],[10.95,0,10.95,1.8,[op('D3',1.35,-1)]],[9.9,1.8,9.9,3.9],
  [1.8,3.9,1.8,7.8,[op('D3',.75,-1),op('D1',1.75,-1)]],
  [0,5.1,1.8,5.1],
  [5.1,3.9,5.1,7.8,[op('GD2',.55)]],
  [12.3,3.9,12.3,7.8,[op('MD1',.8,1),op('W6',2.625)]]
];
