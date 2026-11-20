# PT Contoh Jaya — Company Profile

Proyek ini mengubah tampilan frontend Company-Profile menjadi tema gelap berdasarkan gambar referensi, dengan isi tetap mengikuti Company Profile PT Contoh Jaya, sambil mempertahankan backend Express, API layanan, autentikasi, dan skema Prisma dari source ZIP.

## Isi
- `public/index.html` — halaman utama PT Contoh Jaya.
- `public/style.css` — desain responsif, navigasi, hero orbit, halaman admin/login/register.
- `public/app.js` — mengambil daftar layanan dari `GET /api/services`.
- `public/login.html`, `register.html` — halaman autentikasi.
- `private/admin.html` — panel CRUD layanan.
- `controllers/`, `routes/`, `middleware/`, `config/` — backend.
- `prisma/` — skema dan migration bawaan source.

## Kebutuhan
- Node.js 18 atau lebih baru
- MySQL/MariaDB
- Database `company_profile`

## Instalasi di CachyOS / Linux
1. Ekstrak ZIP dan masuk ke folder proyek:
   ```bash
   cd Company-Profile-ArtCraft
   ```
2. Pasang dependency:
   ```bash
   npm install
   ```
3. Buat file konfigurasi:
   ```bash
   cp .env.example .env
   nano .env
   ```
   Sesuaikan `DATABASE_URL` dan ganti `AUTH_SECRET` dengan secret acak panjang.
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Jalankan server:
   ```bash
   npm start
   ```
6. Buka `http://localhost:3000`.

## XAMPP
Pastikan MySQL XAMPP aktif. Contoh URL untuk root tanpa password:
```env
DATABASE_URL="mysql://root:@127.0.0.1:3306/company_profile"
```
Jika root memiliki password, isi setelah `root:` dan sebelum `@`.

## Database — penting
Folder `prisma/migrations` dan `prisma/schema.prisma` dipertahankan dari source ZIP. Proyek ini tidak otomatis menghapus, reset, atau membuat ulang database. Jangan menjalankan `prisma migrate reset`. Jika database yang sudah ada memiliki riwayat migration berbeda, periksa dan selesaikan riwayat migration terlebih dahulu sebelum menjalankan migration baru. Untuk proyek yang sedang berjalan, buat backup database sebelum mengubah struktur tabel.

## Admin
- Buka `/register.html` untuk membuat akun.
- Login melalui `/login.html`.
- Setelah login, halaman admin berada di `/admin.html`.
- Pendaftaran publik pada source hanya membuat akun biasa; jangan mengubahnya menjadi admin tanpa mekanisme otorisasi yang sesuai.

## Catatan
- Google Fonts dimuat dari internet; jika offline, font fallback akan digunakan.
- Form kontak saat ini hanya validasi tampilan (belum mengirim email atau menyimpan pesan).
- Tombol launcher dan aplikasi adalah tautan/placeholder UI, bukan installer aplikasi sungguhan.
