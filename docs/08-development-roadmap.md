# Peta Jalan Pengembangan (Roadmap) - RitelKM

Dokumen ini merinci garis waktu (timeline) pengembangan dan pembagian fase kerja berbasis metodologi **Agile / Scrum** dengan siklus rilis 2 mingguan (Sprint).

---

## 1. Ringkasan Garis Waktu & Milestone

Proyek ini direncanakan selesai dalam waktu **8 minggu** (4 Sprint) dengan pembagian milestone sebagai berikut:

```text
Fase 1: Fondasi & Auth (Minggu 1-2)  ======> Milestone 1: Sistem dapat login & migrasi DB siap
Fase 2: Inventaris & Katalog (Minggu 3-4) ===> Milestone 2: Katalog online publik dapat diakses
Fase 3: POS & Transaksi (Minggu 5-6) ========> Milestone 3: Transaksi kasir tersimpan otomatis & potong stok
Fase 4: Laporan & Uji (Minggu 7-8) =========> Milestone 4: Sistem lolos pengujian UAT & siap rilis
```

---

## 2. Detail Rencana Kerja Sprint

### Sprint 1: Setup Proyek & Autentikasi Pengguna (Minggu 1 - 2)
*   **Fokus Utama:** Menyusun arsitektur dasar backend, frontend, database, dan sistem login.
*   **Daftar Pekerjaan (Backlog):**
    *   Inisialisasi repositori Git dan konfigurasi Laravel 13 dengan Inertia.js + React.
    *   Membuat migration database untuk tabel `users`, `sessions`, dan data seeder awal.
    *   Membuat sistem autentikasi (Login, Logout) menggunakan Laravel Fortify.
    *   Membuat tata letak (layout) dasar dashboard admin dan navigasi navigasi.
*   **Milestone:** Halaman login berfungsi penuh dan hak akses admin terproteksi middleware Laravel.

### Sprint 2: Manajemen Inventaris & Katalog Publik (Minggu 3 - 4)
*   **Fokus Utama:** Menyelesaikan modul pengelolaan barang dan visualisasi katalog online untuk pelanggan.
*   **Daftar Pekerjaan (Backlog):**
    *   Membuat tabel migration database untuk `categories` dan `products`.
    *   Membuat modul CRUD kategori dan produk di halaman dashboard admin (Upload foto produk, input deskripsi, harga beli, harga jual, dan stok).
    *   Membuat halaman katalog publik untuk pelanggan (Responsive Layout).
    *   Mengimplementasikan filter kategori dan fitur pencarian real-time pada katalog produk.
*   **Milestone:** Katalog online dapat diakses publik dan admin dapat menambah produk baru dari dasbor.

### Sprint 3: Modul Point of Sales (POS) & Integrasi Pemesanan (Minggu 5 - 6)
*   **Fokus Utama:** Membangun antarmuka kasir dan menghubungkan pesanan online pelanggan dengan WhatsApp toko.
*   **Daftar Pekerjaan (Backlog):**
    *   Membuat antarmuka POS kasir satu layar (Single-page POS) yang memuat produk cepat.
    *   Mengimplementasikan fungsi logika keranjang belanja di sisi kasir (tambah, edit jumlah, hitung subtotal otomatis).
    *   Membuat sistem transaksi POS (Mengurangi stok produk dan menyimpan ke tabel `orders` & `order_items`).
    *   Mengintegrasikan keranjang belanja katalog online pelanggan dengan link generator WhatsApp API (`wa.me`).
*   **Milestone:** Kasir dapat memproses transaksi belanja tunai langsung di toko fisik, dan pelanggan dapat checkout ke WhatsApp.

### Sprint 4: Laporan Keuangan, Poles UI, & Pengujian (Minggu 7 - 8)
*   **Fokus Utama:** Penyajian grafik analitis penjualan bagi owner, pembersihan kode (linting), dan pengujian akhir (UAT).
*   **Daftar Pekerjaan (Backlog):**
    *   Membuat halaman analitik dashboard owner (Grafik penjualan menggunakan *Recharts*, ringkasan omzet, laba kotor, dan laba bersih).
    *   Penyempurnaan navigasi responsif di mobile browser.
    *   Menjalankan tool `laravel/pint` untuk merapikan kode PHP/Laravel dan ESLint untuk TypeScript/React.
    *   Melakukan UAT (User Acceptance Testing) berdasarkan skenario pengujian yang telah direncanakan.
*   **Milestone:** Aplikasi siap di-deploy ke produksi (hosting/VPS) dan bebas dari bug kritis.

---

## 3. Manajemen Risiko & Mitigasi

| Identifikasi Risiko | Dampak | Probabilitas | Rencana Mitigasi |
| :--- | :--- | :--- | :--- |
| **Keterlambatan Pengerjaan Integrasi POS** | Tinggi | Sedang | Membatasi fitur POS pada penyelesaian transaksi tunai terlebih dahulu; fitur integrasi e-wallet dikesampingkan pada rilis awal. |
| **Ketidakcocokan Tipe Data/Eror Query** | Sedang | Rendah | Menggunakan skema database relasional sederhana dan menulis test case unit testing untuk menguji fungsi pengurangan stok produk. |
| **Kesulitan Mengoperasikan POS Kasir** | Sedang | Sedang | Membuat dokumentasi petunjuk penggunaan singkat (User Guide) di halaman setting aplikasi. |
