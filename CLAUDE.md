# CLAUDE.md — Banglo Azim 3D

## Projek
Model 3D three.js (r128, global `THREE` dari CDN) untuk banglo setingkat milik pemilik repo, dibina daripada set lukisan arkitek AZR (M1001–D9001). Statik sepenuhnya: tiada build, tiada pakej npm. Buka `index.html` untuk menguji.

## Peraturan kerja
- **Bahasa:** Teks antara muka dan komen dalam Bahasa Melayu baku. Istilah lukisan (W1, D2, FFL, kod produk) dikekalkan seperti dalam lukisan.
- **Sumber data:** Semua dimensi dan maklumat datang daripada lukisan. Jangan reka nilai. Jika sesuatu dianggarkan, tandakan "anggaran" atau "≈" dalam teks maklumat dan sebutkan dalam README (bahagian *Perkara yang perlu disahkan*).
- **Data vs kod:** Data (bilik, bukaan, jadual, kemasan) diletakkan dalam `js/data.js`. Kod binaan diletakkan dalam `js/model.js`. Jangan campurkan.
- **Privasi:** Repo ini awam. Jangan tambah PDF lukisan, alamat lot, nombor lot atau nama penuh pemilik.
- **Turutan skrip:** `data.js → core.js → model.js → landskap.js → ui.js → jalan.js → galeri.js`. Semua skrip klasik berkongsi `const` peringkat atas, jadi elakkan nama berulang antara fail.
- **Telefon:** Pemilik kebanyakannya menggunakan telefon. Pastikan susun atur berfungsi pada lebar ~400 px dan sentuhan (ketik / seret / cubit) masih berfungsi.

## Render fotorealistik
- `render/` mengandungi gambar Blender Cycles (pegun 1600×900, panorama 360° 3072×1536, lakaran kecil dalam `render/kecil/`). Senarai & kapsyen dalam `RENDERS` / `PANOS` (`js/data.js`).
- Jana semula dengan `alat/render/`: `eksport.js` (GLB daripada adegan three.js) → `adegan.py` (adegan Cycles) → `render.py <syot>` (Blender sebagai modul Python `bpy`).
- Jika geometri model berubah, render perlu dijana semula supaya gambar sepadan.
- Gaya kemasan (`GAYA` dalam `js/data.js`): 'arkitek' = lukisan, lalai dan tidak boleh diubah oleh gaya lain. Render gaya dalam `render/gaya/<id>/`; jangan tulis ganti `render/` untuk gaya.

## Koordinat
- Pelan: x = grid 1→6 (m), y = grid C→A (m). Utara ≈ +x (jalan; utara sebenar = +x diputar `UTARA` 8.9° ke arah +y), timur ≈ −y (lorong).
- Three.js: `(x, aras, -y)`. Gunakan `boxPlan(x1,y1,x2,y2,z1,z2,mat,group)`.
- Aras dari tanah:
  - FFL 0.50
  - Kawasan basah 0.45
  - Rasuk bumbung `PLATE` 3.80
  - Siling `CEIL` = FFL + 2.85
  - Siling bilik air `CEILW` = FFL + 2.40
- `item(parent, x, y, aras, face, info)`: `face` = arah hadapan objek (`'x+'`, `'x-'`, `'y+'`, `'y-'`).
- Objek yang boleh diketik mesti mempunyai `userData.info` (kunci `INFO` atau objek `{t, ref, rows}`) dan dimasukkan ke dalam `pick` melalui `item()` atau `tagged()`.

## Rujukan lukisan utama
| Lukisan | Isi |
|---|---|
| M1001 | Pelan tapak: sempadan lot, pokok sedia ada, tangki |
| M1002 | Pelan tingkat bawah & perparitan |
| M1003 | Luas bilik, lokasi pintu/tingkap |
| M1004 | Bumbung (limas + gable atas lanai), perabot |
| M1005 | Elevation |
| M1006 | Keratan |
| D1001–D1006 | Kemasan |
| D2001–D2008 | Sanitari |
| D3001 / D3002 | Jadual pintu / tingkap |
| D4001 | Siling |
| D5001 | Butiran bumbung: cucur 725, lurah, rabung |
| D6001–D6004 | Pagar |
| D7001 / D7006 / D7007 | Skirting, tangga yard & lanai |
| D8001–D8005 | Ambang tingkap, bucu, pintu |
| D9001 | Elektrik |
