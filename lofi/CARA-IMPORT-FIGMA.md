# Cara Import Lo-Fi ke Figma

## Menggunakan Plugin "JSON to Figma"

1. Buka Figma
2. Buat file baru (New File)
3. Klik menu **Plugins** → **Browse plugins in Community**
4. Cari **"JSON to Figma"** (oleh Dani Poyraz) → Install
5. Kembali ke canvas, buka plugin: **Plugins → JSON to Figma**
6. Klik **Load JSON** → pilih file `landing-page-lofi.json`
7. Klik **Create** → wireframe akan muncul di canvas

---

## Alternatif: Plugin "Figma JSON Importer"

1. Cari di Community: **"Figma JSON Importer"**
2. Paste isi file `landing-page-lofi.json` ke dalam text area plugin
3. Klik **Import**

---

## Struktur Wireframe

| # | Section           | Tinggi (px) |
|---|-------------------|-------------|
| 1 | Navbar            | 72          |
| 2 | Hero              | 620         |
| 3 | Tentang QLC       | 520         |
| 4 | Pendiri           | 580         |
| 5 | Visi & Misi       | 420         |
| 6 | Pilar Inti        | 440         |
| 7 | Program Layanan   | 560         |
| 8 | Galeri Kegiatan   | 500         |
| 9 | Kerja Sama (CTA)  | 460         |
|10 | Footer            | 120         |

**Total tinggi: 4292px | Lebar: 1440px (Desktop)**

---

## Konvensi Penamaan Node

- Setiap section bernama `01 – Navbar`, `02 – Hero Section`, dst.
- Elemen dalam section diberi nama deskriptif, contoh: `CTA Primary: Pelajari Lebih Lanjut`
- Placeholder gambar: `RECTANGLE` abu-abu + `ELLIPSE` ikon di tengah
- Teks direpresentasikan sebagai blok abu-abu (lo-fi style)
