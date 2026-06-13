# Rancangan Halaman & Antarmuka - RitelKM

Dokumen ini merancang struktur antarmuka pengguna (UI) aplikasi RitelKM, termasuk peta situs (sitemap) serta susunan tata letak (wireframe layout) untuk setiap halaman utama.

---

## 1. Peta Situs (Sitemap) & Rute Navigasi

Struktur navigasi aplikasi RitelKM dirancang responsif, membedakan hak akses publik dan admin/kasir:

*   **Area Publik (Pelanggan):**
    *   `/` (Katalog Online Publik)
        *   `/cart` (Keranjang Belanja Pelanggan & Form Pesan WA)
*   **Autentikasi:**
    *   `/login` (Halaman Masuk Admin & Kasir)
*   **Area Terproteksi (Dashboard / Back-office):**
    *   `/dashboard` (Dasbor Utama & Metrik Penjualan - khusus Owner)
    *   `/pos` (Halaman Kasir/POS - Kasir & Owner)
    *   `/inventaris` (Manajemen Stok & Produk - khusus Owner)
    *   `/settings` (Pengaturan Akun & Profil Toko - Kasir & Owner)

---

## 2. Tata Letak Tata Halaman Utama (Layout Layouts)

### 2.1 Katalog Produk Publik (`/`)
Halaman pertama yang dilihat pelanggan. Berfungsi memajang produk yang dijual UMKM.

```text
+-------------------------------------------------------------------------+
| [RitelKM Logo]             [Cari Produk...]           (Keranjang [3])   |
+-------------------------------------------------------------------------+
|  Kategori: [ Semua ] [ Kopi ] [ Teh ] [ Cemilan ]                       |
+-------------------------------------------------------------------------+
|                                                                         |
|  +-------------------+  +-------------------+  +-------------------+    |
|  | [ Gambar Produk ] |  | [ Gambar Produk ] |  | [ Gambar Produk ] |    |
|  | Kopi Gayo 250gr   |  | Teh Melati        |  | Keripik Singkong  |    |
|  | Rp 25.000         |  | Rp 8.000          |  | Rp 10.000         |    |
|  | [ + Keranjang ]   |  | [ + Keranjang ]   |  | [ Habis ]         |    |
|  +-------------------+  +-------------------+  +-------------------+    |
|                                                                         |
+-------------------------------------------------------------------------+
```

*   **Komponen Interaktif:**
    *   **Pencarian Real-Time:** Mengetik nama produk langsung memperbarui kartu produk di bawah secara otomatis tanpa reload halaman.
    *   **Filter Kategori:** Mengklik chip kategori langsung menyaring produk.
    *   **Keranjang Belanja (Modal):** Mengklik tombol keranjang memunculkan laci (drawer) dari samping kanan yang berisi daftar belanja, total harga, formulir nama pembeli, dan tombol "Kirim ke WhatsApp".

---

### 2.2 Halaman Kasir / POS (`/pos`)
Antarmuka kerja kasir untuk mencatat transaksi langsung di toko fisik secara cepat.

```text
+-------------------------------------------------------------------------+
| [RitelKM POS]  [Menu: POS | Inventaris | Dasbor]          (User: Ahmad) |
+-------------------------------------------------------------------------+
| CARI PRODUK: [ Masukkan nama/barcode... ]  | KERANJANG BELANJA          |
| Kategori: [Semua] [Kopi] [Makanan]         | -------------------------  |
|                                            | 1. Kopi Gayo x2    50,000  |
| +--------------------+ +-----------------+ | 2. Keripik x1      10,000  |
| | Kopi Gayo          | | Teh Melati      | |                            |
| | Rp 25.000 (Stok:50)| | Rp 8.000(Stok:2)| |                            |
| +--------------------+ +-----------------+ |                            |
| +--------------------+ +-----------------+ | TOTAL:          Rp 60,000  |
| | Roti Bakar         | | Keripik         | | Bayar (Tunai): [ 100,000 ] |
| | Rp 12.000(Stok:0)  | | Rp 10.000(Stok:8| | Kembali:        Rp 40,000  |
| | [Stok Kosong]      | |                 | |                            |
| +--------------------+ +-----------------+ | [SELESAIKAN TRANSAKSI (F8)]|
+-------------------------------------------------------------------------+
```

*   **Komponen Interaktif:**
    *   **Klik Cepat (Quick Add):** Kasir cukup mengklik kartu produk untuk menambah kuantitas barang di keranjang belanja sisi kanan.
    *   **Perhitungan Otomatis:** Subtotal dan uang kembalian kasir langsung terhitung begitu input nominal "Bayar (Tunai)" diketikkan.
    *   **Shortcut Keyboard:** Mendukung penekanan tombol `F8` untuk menyelesaikan transaksi, mempercepat alur kasir tanpa menggunakan mouse.

---

### 2.3 Dasbor Owner (`/dashboard`)
Halaman khusus bagi pemilik untuk memantau performa penjualan secara visual.

```text
+-------------------------------------------------------------------------+
|  [Sidebar]    |  RINGKASAN HARI INI                                     |
|  * Dasbor     |  +------------------+ +----------------+ +------------+ |
|  * Inventaris |  | Omzet Hari Ini   | | Jml Transaksi  | | Stok Tipis | |
|  * POS        |  | Rp 1.250.000     | | 25 Transaksi   | | 2 Produk   | |
|  * Laporan    |  +------------------+ +----------------+ +------------+ |
|  * Pengaturan |  |                                                    |
|               |  |  GRAFIK PENJUALAN MINGGU INI (Bar Chart)           |
|               |  |  [ Sen | Sel | Rab | Kam | Jum | Sab | Min ]       |
|               |  |                                                    |
|               |  |  PRODUK TERLARIS                                   |
|               |  |  1. Kopi Gayo (85 unit terjual)                    |
|               |  |  2. Teh Melati (72 unit terjual)                   |
+-------------------------------------------------------------------------+
```

*   **Komponen Interaktif:**
    *   **Widget Kartu Indikator:** Menampilkan data ringkasan real-time. Bagian "Stok Tipis" dapat diklik untuk langsung membuka daftar inventaris yang kehabisan barang.
    *   **Chart Visualisasi:** Menggunakan pustaka *Recharts* (React) untuk menggambar grafik omzet secara dinamis.
