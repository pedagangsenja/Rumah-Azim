# Banglo Azim 3D

Model 3D interaktif untuk banglo setingkat 4 bilik, 3 bilik air (97.56 m²) di Kangar, Perlis. Model ini dibina daripada set lukisan AZR (M1001–D9001) dan berjalan terus dalam pelayar web menggunakan three.js. Tiada langkah build.

## Cara buka

- **Komputer:** buka `index.html` dalam pelayar (Chrome, Edge atau Safari).
- **Telefon / kongsi pautan:** `https://pedagangsenja.github.io/Rumah-Azim/` (GitHub Pages daripada cawangan `main`, folder root). Boleh dibuka di Safari iPhone tanpa akaun.

Model memerlukan internet kerana three.js dan fon dimuatkan dari CDN.

## Fungsi

| Tab / tindakan | Fungsi |
|---|---|
| Ketik objek | Papar saiz, jenis, model produk dan rujukan lukisan (termasuk bumbung, longkang, tangki, sempadan lot) |
| Paparan | Sudut 3D, pelan atas, depan (dari jalan berturap), **Jalan**; **Lawat bilik** untuk masuk ke dalam bilik |
| Jalan | Mod orang pertama pada paras mata 1.6 m. Telefon: seret bulatan untuk berjalan, seret skrin untuk memandang. Komputer: W A S D / anak panah, Shift untuk laju, Esc untuk keluar. Dinding, pagar dan perabot menghalang; tangga dinaiki ikut aras sebenar |
| Waktu matahari | Kedudukan matahari sebenar untuk Kangar (≈6.44° U, 100.19° T) pada tarikh hari ini, 6:30 pagi hingga 7:30 malam. Bayang-bayang, warna langit dan pantulan kaca ikut waktu |
| Lapisan | Bumbung, potong dinding, siling, lampu & kipas, perabot, sanitari, label, landskap, sempadan lot |
| Galeri | Gambar fotorealistik (Blender Cycles) dari luar dan dalam: pagi, tengah hari, petang dan senja, dengan matahari ikut utara sebenar. Leret atau ketik anak panah |
| 360° | Panorama 360° ruang tamu & makan, Bilik 1, dapur, lanai & teres. Seret untuk memandang, cubit untuk zum |
| Panel | Butang anak panah di sebelah tab melipat atau membuka panel. Di telefon panel dilipat secara lalai dan dilipat semula bila skrin diseret; pandangan 3D dialih supaya rumah tidak terlindung |
| Kemasan | Warna bumbung, dinding, bingkai, pintu; jubin lantai setiap bilik |
| Gaya | Butang di bawah tajuk: **Arkitek** (ikut lukisan, lalai) atau tiga gaya earth tone (Tropika, Japandi, Bali). Gaya menukar warna dinding luar & dalam, dinding aksen TV, tiang, bumbung, bingkai, pintu, lantai, kabinet dapur dan perabot; galeri dan 360° ikut gaya yang dipilih. Butiran produk dalam tab Kemasan |

## Struktur fail

| Fail | Isi |
|---|---|
| `index.html` | Susun atur halaman dan panel kawalan |
| `css/style.css` | Gaya, tema cerah/gelap |
| `js/data.js` | **Semua data lukisan**: aras, kemasan (D1001), jadual maklumat, bilik (M1003), dinding & bukaan (D3001/D3002), tangga & pagar (D6xxx, D7006/D7007), balkoni & kanopi (D6004, keratan 2-1), bumbung (M1004, D5001), jubin dinding bilik air (D1001–D1004), pelmet (D4001), downlight (D9001), paip VP, sempadan lot & kemudahan tapak (M1001, M1002) |
| `js/core.js` | Renderer, kamera, langit, matahari ikut waktu, pantulan persekitaran, bahan, tekstur |
| `js/model.js` | Binaan rumah: apron, longkang, lantai, tangga, dinding, jubin dinding, pagar, bumbung, siling, lampu, perabot, sanitari, VP |
| `js/landskap.js` | Tanah, sempadan lot & batu sempadan, jalan, pokok sedia ada, tangki air, tangki septik, kebuk pemeriksaan, perigi |
| `js/ui.js` | Tab, lapisan, pandangan, waktu matahari, lawatan bilik, kad maklumat, pilihan kemasan, gelung animasi |
| `js/jalan.js` | Mod jalan orang pertama: kayu bedik, papan kekunci, perlanggaran, aras lantai |
| `js/galeri.js` | Galeri render dan pemapar panorama 360° |
| `render/` | Gambar render Blender Cycles dan panorama 360° |
| `alat/render/` | Skrip untuk menjana semula render: eksport GLB, adegan Cycles, render |

Fail dimuatkan mengikut turutan `data → core → model → landskap → ui → jalan → galeri` dan berkongsi pemboleh ubah global.

## Sistem koordinat

- **x:** sepanjang grid 1 → 6 (0 hingga 15.0 m; teres hingga 16.2 m).
- **y:** sepanjang grid C → A (0 hingga 7.8 m). Bilik tidur berada di sisi y = 0.
- **Aras (m dari tanah):**
  - Tanah 0.00
  - FFL 0.50
  - Kawasan basah dan luar 0.45
  - Rasuk bumbung 3.80
  - Cucur atap (atas jubin) ≈3.69
  - Rabung utama ≈6.40, rabung gable lanai ≈5.27
- **Utara:** ke arah +x (jalan berturap), seperti anak panah semua helaian. Utara sebenar (Google Earth) = +x diputar 8.9° ke arah +y (`UTARA` dalam `js/data.js`). Barat ≈ +y (rumah keluarga), timur ≈ −y (jalan dalam), selatan ≈ −x (bendang).
- **Kedudukan bukaan:** dalam `WALLS`, nilai `c` ialah jarak pusat bukaan dari hujung dinding yang lebih kecil koordinatnya.

## Perkara yang perlu disahkan dengan arkitek

1. **Lantai Bilik 2–4:** M1002/M1006 tulis *timber floor*, tetapi D1001/D1005 tulis porselin Norwich White. Model ikut D1001.
2. **Lantai yard, lanai, balkoni:** M1002 tulis *homogenous tiles*, tetapi D1001 tulis Kimgress Wood Collection (Orche). Model ikut D1001.
3. **Pintu D3 bilik air:** pelan 750 mm, jadual D3001 900 mm. Model ikut pelan.
4. **Tinggi siling ruang utama:** 2850 mm, dikira daripada rantai dimensi keratan 1-2 (M1006-4: ambang W5 1000 + W5 600 + 1250). Tiada dimensi siling yang ditulis terus. Siling bilik air 2400 mm ikut D4001.
5. **Warna bumbung dan dinding luar:** belum ditetapkan dalam lukisan (*to architect's selection*).
6. **Arah utara:** anak panah semua helaian (M1001–M1006, D1005, D1006) menghala ke jalan berturap, dan ini sepadan dengan Google Earth. Bering M1001 juga sepadan (dilalui lawan arah jam), tetapi dirujuk pada sisi rumah keluarga sebagai 0°00′00″; utara sebenar ≈8.9° berbeza. Model guna utara sebenar. (Versi model sebelum 24 Okt tersilap membaca anak panah M1003–M1005 dan meletakkan utara ke arah bendang.)
7. **Kedudukan rumah dalam lot:** M1001 tulis 3 000 mm dari grid 1 ke sempadan selatan (bendang); pada skala ≈3.07 m. Di sisi rumah keluarga, dimensi 2 000 (dinding) dan 1 100 (cucur) bermula ≈0.5 m di luar garisan sempadan; dari sempadan, dinding ≈1.5 m dan cucur ≈0.65 m. Jarak grid A ke sempadan barat (≈1.52 m) tiada dimensi bertulis; model guna ukuran pada skala.
8. **Ukuran sempadan:** M1001 tulis 16.09 / 27.83 / 12.00 / 26.94 m (382 m²). Poligon Google Earth pemilik: 16.03 / 27.76 / 12.40 / 27.97 m (393.3 m²). Model ikut M1001; sempadan muktamad perlu dipacak juruukur berlesen.
9. **Ketinggian bumbung:** M1005 tulis rabung 6400 sebagai *approx. max height*, tetapi elevation E1 pada skala ≈6.2 m. Butiran cucur D5001 (skala 1:10) memberi permukaan jubin ≈3.65 m di tepi cucur; dengan cerun 30° rabung jadi ≈6.36 m. Model guna 6.40 m, cerun 30° dan cucur 725 mm dari muka dinding, jadi tepi cucur ≈3.69 m.
10. **Tangga lanai:** E1 tunjuk pier 300 + tangga 1 000, D6002 (1:25) tunjuk pier 300 + tangga 1 050 + zon pagar 150, D7007 tunjuk 1 200 mm. Model ikut D6002: pier dinding penuh 300 mm di hujung dinding Bilik 1, tangga y 4.275–5.325, pagar sisi pada y 5.4. (Versi sebelum 24 Okt meletakkan pagar pendek di tempat pier.)
11. **W6:** teks jadual D3002 tulis "3 equal panels", tetapi gambar W6 dalam D3002 dan Elevation 1 (M1005) kedua-duanya tunjuk 4 panel sama. Model ikut gambar (4 panel). Tiada lukisan tunjuk satu kepingan kaca besar.
12. **Dinding gable teres:** E1 lukis papan mendatar dengan bolong udara, bahan tidak dinyatakan.
13. **Longkang U 300 mm:** keratan M1006 tulis apron 600 + longkang 300 dari muka dinding. Di sisi A, papak balkoni mengunjur 300 mm di atas apron (D6004), jadi longkang ikut ukuran yang sama. Saluran keluar ke longkang awam tidak ditunjukkan.
14. **Jadual luas M1003:** ruang tamu + makan ditulis 30.06 m² (15.21 + 15.39 = 30.60). Jumlah "97.56 m² (1,050 sqft)" tidak sama dengan jumlah baris jadual (118.98 m²) atau jumlah tanpa lanai, yard dan balkoni (≈101.6 m²). Bilik Air 2 ditanda W4, tetapi pelan dan D3002 tunjuk W3.
15. **Bumbung teres pada E2 dan E4:** rabung gable dilukis setinggi rabung utama, berbeza daripada E1 dan M1004. Jika rabung setinggi itu, cerun gable jadi ≈45°, bukan 30°. Model ikut E1 dan M1004.
16. **Tinggi pagar:** nota tulis 900 mm, tetapi E3, E4 dan D6001–D6004 tunjuk 850 mm. Model guna 900.
17. **Ambang W5:** D3002 dan keratan 1-2 tulis 1000 mm, E4 tulis 900 mm. Model guna 1000.
18. **Keratan 1-3 dan W1 Bilik 1:** keratan 1-3 melabel W6 (dinding grid 5, dilihat dari dalam ruang tamu) sebagai W1. Kedudukan W1 Bilik 1: B-B tulis 300 dari muka dalam dinding grid 6 dan E2 tulis 450 dari muka luar (kedua-duanya meletakkan tepi tingkap ≈14.625 m), M1003 tulis 600 dari grid (14.40 m), dan pelan M1003 dilukis ≈14.48 m. Model guna 600.
19. **Tangki air, kebuk pam dan perigi (M1001/M1002):** dilukis di luar sempadan barat lot (tanah keluarga). Model ikut lukisan.
20. **Dapur dan perabot:** model kini ikut M1004 dan keratan A-A, 1-2 (peti sejuk dua pintu ≈1900 tinggi di sebelah GD2, kaunter bentuk U di dinding yard, dinding W5 dan dinding ruang makan, kabinet atas di atas W5 dan di dinding ruang makan dengan kabinet microwave, kabinet TV ruang tamu ≈2100 dengan TV di tengah antara dua W2, Bilik 3 dengan kabinet rendah dan TV 42" (keratan 1-2), meja Bilik 4 di dinding grid 1, kabinet rendah di hadapan W1 Bilik 1). Unit penghawa dingin, kondenser dan 42 downlight ikut D9001, diukur pada skala 1:75. Pelmet langsir ikut D4001: ruang tamu ada dua pelmet pendek di W2 dan satu di W6, bukan satu pelmet di sepanjang dinding TV.
21. **Balkoni dan GD1:** M1002, M1003, D1005, D1006, D3002, D4001, D6004, D9001 dan keratan 2-1 menunjukkan GD1 450 mm ke dalam dari grid A, dan balkoni 750 mm dalam (450 di dalam garis grid A + 300 di luar). Model kini ikut ini; versi lama meletakkan GD1 pada grid A. Luas ruang makan 15.39 m² (M1003) dikira hingga grid A, jadi bertindih dengan balkoni 2.52 m². GD1 375 mm dari grid 3 (M1003, D3002), tetapi D6004 tulis 225 di sisi itu. Papak kanopi 100 mm pada kepala GD1 hanya ditunjukkan dalam keratan 2-1, dan unjurannya diukur pada skala (≈).
22. **Label lukisan:** E3 melabel pintu dapur ke yard sebagai D3, tetapi pelan, D3001 dan keratan 1-1 menunjukkan D1. Keratan 1-1 melabel Bilik 4 sebagai Bilik 3, dan keratan 1-2 melabel Bilik 3 sebagai Bedroom 2.
23. **Siling lanai dan teres:** D4001 menanda gipsum tahan lembap, tetapi keratan A-A menulis panel sofit gred luaran. Model guna sofit, pada aras siling 2850 mm (keratan A-A), penuh termasuk di atas tangga; bawah rasuk teres dan lanai rata dengan sofit (A-A, E1: rasuk 450 mm).
24. **Tangga yard:** D6001 dan D7006 tunjuk 3 naik 100 mm (jejak 300) dalam 900 mm terakhir sebelum grid A, lebar 900 mm, kemudian naik 100 ke apron. Model kini ikut ini (versi lama ada 4 jejak bermula 1.2 m dari grid A). Pagar yard di sisi tangga kekal rata pada aras yard seperti keratan D6001; tiangnya turun ke jejak.
25. **Sisi grid A yard:** M1002, D1006, D7006 dan E4 tunjuk dinding bata dari x ≈1.0 hingga grid 2, dengan bukaan 900 mm untuk tangga sahaja. Model kini ikut ini (versi lama ada pagar di situ). Keratan 1-1 tunjuk ruang dobi di dinding dapur: dua mesin muat depan di bawah kaunter, kabinet atas dan rak terbuka, pili WT 2 pada 1000 mm.
26. **Pintu Bilik 2 dan Bilik 3:** M1003, M1004, D3001, D9001 dan keratan 2-1 tunjuk kedua-dua pintu D2 pada dinding koridor (1050 mm dari dinding Bilik Air 2), bukan pada dinding grid B. Model kini ikut ini. Engsel pintu Bilik 4 di hujung dekat grid 2.
27. **Pelan kunci D3002:** dimensi W2 ruang tamu 750 + 450 + 2100 + 450 + 525 = 4275 mm, sedangkan grid 4–5 ialah 3900 mm. Model ikut M1003, E4 dan keratan A-A (W2 450 mm dari grid 4 dan 525 mm dari grid 5).
28. **Titik pemanas air (WHPP/WHI):** keratan D2003–D2008 tunjuk titik plag dan salur masuk pemanas air di setiap bilik air, tetapi jadual D2001 tiada pemanas air. Tidak dimodel.
29. **Perangkap & pili luar (M1002):** GT 1–3 di apron sebelah VP, perangkap gris GRT di luar dinding dapur, pili WT 1 di bucu teres dan perangkap lantai FT di yard dan dapur kini dimodel, kedudukan diukur pada skala 1:100 (≈). Kedudukan VP 1 dan VP 2 diselaraskan dengan M1002 dan E2.
30. **Butiran kecil yang kini dimodel:** skirting aluminium 80 mm (D7001), ambang dalam kuarza W3 (D8001), ambang dan bingkai kayu W5 (D8002), pemegang pintu 1050 mm (D8005), rak, gelang tuala, penyangkut jubah dan pili dinding bilik air (D2001–D2008). Kedudukan sinki, pancuran dan perangkap lantai Bilik Air 2 dan 3 diselaraskan dengan pelan D1003 dan D1004.

## Gaya earth tone (cadangan pemilik, bukan lukisan)

- Tiga palet dalam `GAYA` (`js/data.js`), dikaji untuk iklim panas lembap: dinding luar terang hingga sederhana (LRV ≈44–64) untuk kurangkan haba, aksen tanah liat / oak / terracotta pada tiang dan gable (≈10%), plinth gelap atau batu untuk percikan hujan, cat luar anti-kulat.
- **Tropika** (Nippon Paint): Basket Beige NP N 1879P, Good Earth NP YO 2415D, Red Earth NP R 1379A; bumbung Monier Elabana Tropical Mocha Brown; lantai Feruni Stone X Lime SX05M.
- **Japandi** (Nippon Paint): Wall Arte NP N 1865P, Natural Oak NP N 1871T, Painted Faces NP N 1925A; bumbung Monier Elabana Tropical Ebony (perlu penebat); lantai Niro Granite Blitzen Stone Bright GGBZ01.
- **Bali** (Jotun): 2225 Tuscany, 2111 Burned Terracotta, 1453 Vanilla; plinth batu pasir Palimanan; bumbung Monier Elabana Tropical Antique Red; lantai Feruni Travertino 2.0 Beige TV02MH, terracotta di lanai.
- Kod dan warna hex diambil daripada hasil carian (laman pengeluar tidak dapat dibuka semasa kajian), jadi semuanya ≈. Sahkan dengan kad warna dan sampel jubin sebenar sebelum membeli.
- Render setiap gaya dalam `render/gaya/<id>/` (6 gambar + panorama ruang tamu); set Arkitek dalam `render/` tidak berubah. Jana dengan `GAYA=<id> node eksport.js`, `GAYA=<id> python adegan.py`, `python render.py <syot> --gaya=<id>`.

## Had model

- Saiz perabot dianggarkan daripada M1004.
- Kedudukan pintu dalaman dan sanitari dibaca daripada pelan; mungkin tersasar beberapa ratus mm.
- Soket dan suis (D9001) belum dimodelkan.
- Jalan, ketinggian pokok, rumput dan barisan pokok jauh ialah konteks anggaran. Kedudukan pokok sedia ada, tangki air, tangki septik, kebuk pemeriksaan, sump dan perigi dibaca daripada M1001/M1002.
- Render Cycles: geometri dan ukuran ikut model; warna bumbung/dinding ikut pilihan lalai (belum ditetapkan arkitek); bahan, perabot, langsir (di pelmet D4001), rumput, pokok dan langit ialah ilustrasi. Kedudukan matahari dikira untuk Kangar pada 23 Okt.
- Render Galeri dan 360° dijana semula pada 24 Okt selepas W6 (4 panel), balkoni/GD1 dan downlight D9001 dibetulkan. Pandangan udara dan Bilik Air 1 kekal daripada 23 Okt (tiada perubahan yang kelihatan).
- Ini model visual, bukan lukisan pembinaan.
