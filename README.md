# Banglo Azim 3D

Model 3D interaktif untuk banglo setingkat 4 bilik, 3 bilik air (97.56 m²) di Kangar, Perlis. Model ini dibina daripada set lukisan AZR (M1001–D9001) dan berjalan terus dalam pelayar web menggunakan three.js. Tiada langkah build.

## Cara buka

- **Komputer:** buka `index.html` dalam pelayar (Chrome, Edge atau Safari).
- **Telefon / kongsi pautan:** hidupkan GitHub Pages dengan memilih *Settings → Pages → Deploy from branch → `main` / root*. Model akan tersedia di `https://pedagangsenja.github.io/Rumah-Azim/`.

Model memerlukan internet kerana three.js dan fon dimuatkan dari CDN.

## Fungsi

| Tab / tindakan | Fungsi |
|---|---|
| Ketik objek | Papar saiz, jenis, model produk dan rujukan lukisan (termasuk bumbung, longkang, tangki, sempadan lot) |
| Paparan | Sudut 3D, pelan atas, depan (dari jalan berturap), **Jalan**; **Lawat bilik** untuk masuk ke dalam bilik |
| Jalan | Mod orang pertama pada paras mata 1.6 m. Telefon: seret bulatan untuk berjalan, seret skrin untuk memandang. Komputer: W A S D / anak panah, Shift untuk laju, Esc untuk keluar. Dinding, pagar dan perabot menghalang; tangga dinaiki ikut aras sebenar |
| Waktu matahari | Kedudukan matahari sebenar untuk Kangar (≈6.44° U, 100.19° T) pada tarikh hari ini, 6:30 pagi hingga 7:30 malam. Bayang-bayang, warna langit dan pantulan kaca ikut waktu |
| Lapisan | Bumbung, potong dinding, siling, lampu & kipas, perabot, sanitari, label, landskap, sempadan lot |
| Panel | Butang anak panah di sebelah tab melipat atau membuka panel. Di telefon panel dilipat secara lalai dan dilipat semula bila skrin diseret; pandangan 3D dialih supaya rumah tidak terlindung |
| Kemasan | Warna bumbung, dinding, bingkai, pintu; jubin lantai setiap bilik |

## Struktur fail

| Fail | Isi |
|---|---|
| `index.html` | Susun atur halaman dan panel kawalan |
| `css/style.css` | Gaya, tema cerah/gelap |
| `js/data.js` | **Semua data lukisan**: aras, kemasan (D1001), jadual maklumat, bilik (M1003), dinding & bukaan (D3001/D3002), tangga & pagar (D6xxx, D7006/D7007), bumbung (M1004, D5001), jubin dinding bilik air (D1001–D1004), paip VP, sempadan lot & kemudahan tapak (M1001, M1002) |
| `js/core.js` | Renderer, kamera, langit, matahari ikut waktu, pantulan persekitaran, bahan, tekstur |
| `js/model.js` | Binaan rumah: apron, longkang, lantai, tangga, dinding, jubin dinding, pagar, bumbung, siling, lampu, perabot, sanitari, VP |
| `js/landskap.js` | Tanah, sempadan lot & batu sempadan, jalan, pokok sedia ada, tangki air, tangki septik, kebuk pemeriksaan, perigi |
| `js/ui.js` | Tab, lapisan, pandangan, waktu matahari, lawatan bilik, kad maklumat, pilihan kemasan, gelung animasi |
| `js/jalan.js` | Mod jalan orang pertama: kayu bedik, papan kekunci, perlanggaran, aras lantai |

Fail dimuatkan mengikut turutan `data → core → model → landskap → ui → jalan` dan berkongsi pemboleh ubah global.

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
- **Utara:** ke arah −x (sisi yard dan dapur). Timur = +y (sisi jiran), selatan = +x (jalan berturap), barat = −y (jalan dalam).
- **Kedudukan bukaan:** dalam `WALLS`, nilai `c` ialah jarak pusat bukaan dari hujung dinding yang lebih kecil koordinatnya.

## Perkara yang perlu disahkan dengan arkitek

1. **Lantai Bilik 2–4:** M1002/M1006 tulis *timber floor*, tetapi D1001/D1005 tulis porselin Norwich White. Model ikut D1001.
2. **Lantai yard, lanai, balkoni:** M1002 tulis *homogenous tiles*, tetapi D1001 tulis Kimgress Wood Collection (Orche). Model ikut D1001.
3. **Pintu D3 bilik air:** pelan 750 mm, jadual D3001 900 mm. Model ikut pelan.
4. **Tinggi siling ruang utama:** 2850 mm, dikira daripada rantai dimensi keratan 1-2 (M1006-4: ambang W5 1000 + W5 600 + 1250). Tiada dimensi siling yang ditulis terus. Siling bilik air 2400 mm ikut D4001.
5. **Warna bumbung dan dinding luar:** belum ditetapkan dalam lukisan (*to architect's selection*).
6. **Arah utara:** anak panah M1001 dan M1002 menghala ke grid 6, tetapi M1003–M1005 menghala ke grid 1. Model ikut grid 1 kerana bering sempadan M1001 hanya membentuk lilitan ikut arah jam (cara biasa pelan ukur) jika utara ke arah grid 1, dan gambar dron pemilik (utara di atas) sepadan dengan susunan ini.
7. **Kedudukan rumah dalam lot:** M1001 tulis 3 000 mm dari grid 1 ke sempadan utara, tetapi pada skala jaraknya ≈3.11 m. Dimensi 2 124, 1 100 dan 2 000 pada M1001 juga tidak sepadan dengan skala. Jarak grid A ke sempadan timur (≈1.52 m) tiada dimensi bertulis; model guna ukuran pada skala.
8. **Sisi sempadan selatan (tepi jalan berturap):** M1001 tulis 16.09 m; gambar dron pemilik menandakan ≈19 m. Model ikut M1001.
9. **Ketinggian bumbung:** M1005 tulis rabung 6400 sebagai *approx. max height*, tetapi elevation E1 pada skala ≈6.2 m. Model guna 6.40 m, cerun 30° dan cucur 725 mm dari muka dinding (D5001), jadi tepi cucur ≈3.69 m.
10. **Lebar tangga lanai:** E1 tunjuk 1 000, D6002 tunjuk 1 050, D7007 tunjuk 1 200 mm. Model guna ≈1 050.
11. **W6:** teks jadual D3002 tulis 3 panel sama, tetapi lukisan W6 tunjuk 4 panel. Model ikut teks (3 panel).
12. **Dinding gable teres:** E1 lukis papan mendatar dengan bolong udara, bahan tidak dinyatakan.
13. **Longkang U 300 mm:** keratan M1006 tulis apron 600 + longkang 300 dari muka dinding. Di sisi A longkang perlu melepasi balkoni (dalam 750 mm), jadi kedudukannya di situ ≈. Saluran keluar ke longkang awam tidak ditunjukkan.
14. **Jadual luas M1003:** ruang tamu + makan ditulis 30.06 m² (15.21 + 15.39 = 30.60). Jumlah "97.56 m² (1,050 sqft)" tidak sama dengan jumlah baris jadual (118.98 m²) atau jumlah tanpa lanai, yard dan balkoni (≈101.6 m²). Bilik Air 2 ditanda W4, tetapi pelan dan D3002 tunjuk W3.
15. **Bumbung teres pada E2 dan E4:** rabung gable dilukis setinggi rabung utama, berbeza daripada E1 dan M1004. Jika rabung setinggi itu, cerun gable jadi ≈45°, bukan 30°. Model ikut E1 dan M1004.
16. **Tinggi pagar:** nota tulis 900 mm, tetapi E3, E4 dan D6001–D6004 tunjuk 850 mm. Model guna 900.
17. **Ambang W5:** D3002 dan keratan 1-2 tulis 1000 mm, E4 tulis 900 mm. Model guna 1000.
18. **Keratan 1-3:** menunjukkan W1 berbidai di dinding A ruang tamu, sedangkan pelan menunjukkan dinding TV dengan dua W2. Kedudukan W1 Bilik 1: B-B tulis 300 dari dinding, M1003 tulis 600.
19. **Tangki air, kebuk pam dan perigi (M1001/M1002):** dilukis di luar sempadan timur lot. Model ikut lukisan.
20. **Dapur dan perabot:** model kini ikut M1004 (peti sejuk dua pintu di sebelah GD2, kaunter L di dinding W5 dan dinding yard, meja Bilik 4 di dinding grid 1, kabinet rendah di hadapan W1 Bilik 1). Unit penghawa dingin dan kondenser ikut D9001, diukur pada skala 1:75.

## Had model

- Saiz perabot dianggarkan daripada M1004.
- Kedudukan pintu dalaman dan sanitari dibaca daripada pelan; mungkin tersasar beberapa ratus mm.
- Soket dan suis (D9001) belum dimodelkan.
- Jalan, ketinggian pokok, rumput dan barisan pokok jauh ialah konteks anggaran. Kedudukan pokok sedia ada, tangki air, tangki septik, kebuk pemeriksaan, sump dan perigi dibaca daripada M1001/M1002.
- Ini model visual, bukan lukisan pembinaan.
