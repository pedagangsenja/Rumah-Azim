# Banglo Azim 3D

Model 3D interaktif untuk banglo setingkat 4 bilik, 3 bilik air (97.56 m²) di Kangar, Perlis. Model ini dibina daripada set lukisan AZR (M1001–D9001) dan berjalan terus dalam pelayar web menggunakan three.js. Tiada langkah build.

## Cara buka

- **Komputer:** buka `index.html` dalam pelayar (Chrome, Edge atau Safari).
- **Telefon / kongsi pautan:** hidupkan GitHub Pages dengan memilih *Settings → Pages → Deploy from branch → `main` / root*. Model akan tersedia di `https://pedagangsenja.github.io/Rumah-Azim/`.

Model memerlukan internet kerana three.js dan fon dimuatkan dari CDN.

## Fungsi

| Tab / tindakan | Fungsi |
|---|---|
| Ketik objek | Papar saiz, jenis, model produk dan rujukan lukisan |
| Paparan | Sudut 3D, pelan atas, depan; **Lawat bilik** untuk masuk ke dalam bilik |
| Lapisan | Bumbung, potong dinding, siling, lampu & kipas, perabot, sanitari, label |
| Kemasan | Warna bumbung, dinding, bingkai, pintu; jubin lantai setiap bilik |

## Struktur fail

| Fail | Isi |
|---|---|
| `index.html` | Susun atur halaman dan panel kawalan |
| `css/style.css` | Gaya, tema cerah/gelap |
| `js/data.js` | **Semua data lukisan**: aras, kemasan (D1001), jadual maklumat, bilik (M1003), dinding & bukaan (D3001/D3002) |
| `js/core.js` | Renderer, kamera, cahaya, bahan, tekstur |
| `js/model.js` | Binaan model: lantai, dinding, pagar, bumbung, siling, lampu, perabot, sanitari |
| `js/ui.js` | Tab, lapisan, lawatan bilik, kad maklumat, pilihan kemasan |

Fail dimuatkan mengikut turutan `data → core → model → ui` dan berkongsi pemboleh ubah global.

## Sistem koordinat

- **x:** sepanjang grid 1 → 6 (0 hingga 15.0 m; teres hingga 16.2 m).
- **y:** sepanjang grid C → A (0 hingga 7.8 m). Bilik tidur berada di sisi y = 0.
- **Aras (m dari tanah):**
  - Tanah 0.00
  - FFL 0.50
  - Kawasan basah dan luar 0.45
  - Rasuk bumbung 3.80
  - Rabung 6.40
- **Utara:** ke arah −x (sisi yard dan dapur), ikut pelan kunci M1005.
- **Kedudukan bukaan:** dalam `WALLS`, nilai `c` ialah jarak pusat bukaan dari hujung dinding yang lebih kecil koordinatnya.

## Perkara yang perlu disahkan dengan arkitek

1. **Lantai Bilik 2–4:** M1002/M1006 tulis *timber floor*, tetapi D1001/D1005 tulis porselin Norwich White. Model ikut D1001.
2. **Lantai yard, lanai, balkoni:** M1002 tulis *homogenous tiles*, tetapi D1001 tulis Kimgress Wood Collection (Orche). Model ikut D1001.
3. **Pintu D3 bilik air:** pelan 750 mm, jadual D3001 900 mm. Model ikut pelan.
4. **Tinggi siling ruang utama:** ≈2850 mm, dibaca daripada skala keratan kerana tiada dimensi bertulis. Siling bilik air 2400 mm ikut D4001.
5. **Warna bumbung dan dinding luar:** belum ditetapkan dalam lukisan (*to architect's selection*).

## Had model

- Saiz perabot dianggarkan daripada M1004.
- Kedudukan pintu dalaman dan sanitari dibaca daripada pelan; mungkin tersasar beberapa ratus mm.
- Soket dan suis (D9001) belum dimodelkan.
- Ini model visual, bukan lukisan pembinaan.
