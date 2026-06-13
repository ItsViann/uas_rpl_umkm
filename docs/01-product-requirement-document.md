# Product Requirement Document (PRD) - RitelKM

## 1. Latar Belakang & Masalah
Banyak Usaha Mikro, Kecil, dan Menengah (UMKM) masih mengandalkan proses manual untuk operasional sehari-hari mereka:
*   **Pencatatan Stok Manual:** Menyebabkan ketidaksesuaian stok (selisih), kehilangan barang, dan keterlambatan pengadaan stok baru.
*   **Transaksi Kasir Konvensional:** Transaksi dicatat pada buku nota kertas yang rentan hilang, rusak, atau salah hitung.
*   **Pemasaran Terbatas:** Sulit menjangkau pasar di luar wilayah fisik toko karena tidak memiliki katalog digital yang mudah diakses pelanggan.
*   **Ketiadaan Analisis Penjualan:** Pemilik UMKM kesulitan mengetahui produk mana yang paling laris dan berapa keuntungan bersih riil mereka setiap bulannya.

**RitelKM** hadir sebagai solusi terpadu untuk menyelesaikan masalah-masalah di atas dalam satu platform yang sederhana, efisien, dan modern.

---

## 2. Visi & Tujuan Produk
*   **Visi:** Menjadi platform digitalisasi operasional UMKM ritel paling mudah dan andal untuk meningkatkan produktivitas dan memperluas pasar.
*   **Tujuan:**
    *   Mengotomatisasi pengelolaan inventaris (stok barang).
    *   Menyediakan sistem Point of Sales (POS) kasir yang cepat dan terintegrasi stok.
    *   Membuat katalog produk online publik yang responsif agar pelanggan bisa memesan langsung.
    *   Menyediakan dasbor analitik penjualan yang instan bagi pemilik toko.

---

## 3. Target Pengguna (User Personas)

Sistem RitelKM dirancang untuk 3 jenis pengguna utama:

| Peran | Deskripsi | Kebutuhan Utama |
| :--- | :--- | :--- |
| **Pemilik UMKM (Admin/Owner)** | Pemilik bisnis yang mengelola toko secara keseluruhan. | Melihat laporan laba rugi, memantau kinerja staf, menambah/menghapus katalog produk, dan melihat tren penjualan. |
| **Kasir (Staf Toko)** | Staf operasional yang melayani pelanggan langsung di toko fisik. | Antarmuka kasir cepat untuk memindai/memilih barang, menerima pembayaran, memperbarui stok otomatis, dan mencetak struk transaksi. |
| **Pelanggan (Customer)** | Masyarakat umum yang ingin melihat barang dagangan UMKM secara daring. | Mengakses katalog produk yang selalu terbarui, mencari produk, dan melakukan reservasi/pemesanan barang. |

---

## 4. Kebutuhan Fungsional (Functional Requirements)

Fitur-fitur utama sistem dibagi menjadi 4 modul utama:

### 4.1 Modul Manajemen Inventaris (Owner & Kasir)
*   **INV-01:** Sistem harus dapat mencatat produk baru dengan atribut: nama produk, deskripsi, harga beli, harga jual, stok minimum, stok saat ini, kategori produk, dan foto produk.
*   **INV-02:** Sistem harus mendeteksi dan memberi peringatan (alert) ketika stok produk berada di bawah batas stok minimum.
*   **INV-03:** Sistem harus mencatat riwayat masuk dan keluar barang (stock movement log).

### 4.2 Modul Point of Sales / POS (Kasir & Owner)
*   **POS-01:** Kasir dapat mencari produk secara cepat berdasarkan nama atau kategori, dan memasukkannya ke dalam keranjang transaksi.
*   **POS-02:** Sistem secara otomatis menghitung total harga belanja, potongan harga (jika ada), dan jumlah kembalian setelah memasukkan nominal uang yang dibayarkan.
*   **POS-03:** Sistem harus mengurangi stok produk secara otomatis saat transaksi penjualan berhasil disimpan (finalized).
*   **POS-04:** Kasir dapat membatalkan transaksi atau mencetak struk belanja (dalam format digital/PDF atau printer termal).

### 4.3 Modul Katalog Produk Online (Publik/Pelanggan)
*   **CAT-01:** Publik dapat melihat katalog produk UMKM secara online tanpa perlu login.
*   **CAT-02:** Pelanggan dapat menyaring produk berdasarkan kategori dan melakukan pencarian produk berdasarkan kata kunci.
*   **CAT-03:** Pelanggan dapat membuat keranjang belanja virtual dan mengirimkan ringkasan pesanan ke WhatsApp admin toko untuk penyelesaian pembayaran dan pengiriman.

### 4.4 Modul Dasbor & Laporan (Owner)
*   **REP-01:** Dasbor harus menampilkan ringkasan performa hari ini: total pendapatan, jumlah transaksi, barang terlaris, dan produk yang kehabisan stok.
*   **REP-02:** Sistem harus dapat menghasilkan laporan penjualan dalam rentang waktu harian, mingguan, bulanan, atau tahunan.
*   **REP-03:** Sistem harus menghitung perkiraan laba kotor dan laba bersih berdasarkan selisih harga beli dan harga jual produk yang terjual.

---

## 5. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| Kategori | Parameter Kebutuhan |
| :--- | :--- |
| **Kinerja (Performance)** | *   Waktu respons halaman dasbor kasir harus di bawah 1,5 detik saat mencari barang.<br>*   Pencarian barang di katalog online harus cepat (< 1 detik). |
| **Keamanan (Security)** | *   Akses ke halaman manajemen stok dan laporan harus diamankan dengan otentikasi ketat.<br>*   Kata sandi pengguna harus dienkripsi menggunakan algoritma *Bcrypt* bawaan Laravel. |
| **Kemudahan Penggunaan (Usability)** | *   Antarmuka kasir harus ramah perangkat tablet dan ponsel (responsive design).<br>*   Desain minimalis dengan ukuran tombol yang cukup besar untuk memudahkan penekanan layar sentuh (touchscreen friendly). |
| **Ketersediaan (Availability)** | *   Sistem harus dapat diakses secara lokal tanpa koneksi internet penuh (untuk sistem POS toko fisik) atau di-host di cloud untuk sinkronisasi katalog online. |

---

## 6. Batasan & Asumsi Proyek
*   **Batasan:** Sistem POS pada versi awal tidak mendukung integrasi mesin EDC pembayaran kartu kredit/debit secara otomatis. Pembayaran non-tunai (Qris) dikonfirmasi secara manual oleh kasir.
*   **Asumsi:** Pengguna admin memiliki pemahaman dasar dalam mengoperasikan peramban web (browser) di komputer atau ponsel pintar.
*   **Ketergantungan:** Pengiriman pesanan via WhatsApp mengandalkan API tautan WhatsApp eksternal (`https://wa.me/`).
