# Deskripsi Use Case & Alur Bisnis - RitelKM

Dokumen ini merinci skenario penggunaan (*use cases*) utama dari sistem RitelKM beserta alur bisnis (*business flow*) prosedural yang menggambarkan bagaimana sistem merespons tindakan pengguna.

---

## 1. Daftar Use Case Utama

| ID Use Case | Nama Use Case | Aktor Utama | Deskripsi Singkat |
| :--- | :--- | :--- | :--- |
| **UC-01** | Mengelola Inventaris Produk | Owner | Owner dapat menambah, melihat, mengedit, atau menghapus produk dari database. |
| **UC-02** | Memproses Penjualan Toko (POS) | Kasir, Owner | Kasir memasukkan item belanjaan, menghitung total, menerima uang, dan merekam transaksi penjualan. |
| **UC-03** | Menjelajahi Katalog & Memesan | Pelanggan | Pelanggan melihat produk yang dijual dan mengirim pesanan belanja ke WhatsApp toko. |
| **UC-04** | Memantau Laporan Keuangan | Owner | Owner melihat ringkasan omzet, modal (HPP), dan laba bersih di dashboard. |

---

## 2. Deskripsi Detail Skenario Use Case

### UC-01: Mengelola Inventaris Produk (Owner)
*   **Aktor:** Owner (Admin)
*   **Kondisi Awal (Preconditions):** Owner telah masuk ke halaman admin menggunakan akun yang valid.
*   **Alur Utama (Main Flow):**
    1.  Owner membuka menu **Manajemen Inventaris**.
    2.  Sistem menampilkan tabel berisi daftar seluruh produk saat ini beserta harga beli, harga jual, dan stoknya.
    3.  Owner mengklik tombol **"Tambah Produk Baru"**.
    4.  Sistem menampilkan form input produk.
    5.  Owner menginput data produk (Nama, Kategori, Harga Beli, Harga Jual, Stok Awal, Stok Minimum, Foto).
    6.  Owner mengklik tombol **"Simpan"**.
    7.  Sistem memvalidasi input, menyimpan data ke database, lalu memperbarui tabel inventaris.
*   **Alur Alternatif/Pengecualian (Alternative/Exception Flow):**
    *   *5a. Input Tidak Valid:* Jika ada input numerik bernilai negatif atau input wajib dibiarkan kosong, sistem menampilkan pesan eror spesifik di sebelah input yang bermasalah dan membatalkan penyimpanan sampai data diperbaiki.

### UC-02: Memproses Penjualan Toko / POS (Kasir)
*   **Aktor:** Kasir / Owner
*   **Kondisi Awal (Preconditions):** Pengguna telah login sebagai kasir dan berada di halaman modul kasir (POS).
*   **Alur Utama (Main Flow):**
    1.  Kasir mencari barang berdasarkan nama atau memindai kode barang (jika menggunakan pemindai).
    2.  Kasir mengklik barang tersebut untuk menambahkannya ke **Keranjang Belanja POS**.
    3.  Sistem menampilkan item di keranjang beserta harga satuan, jumlah (quantity), subtotal, dan total belanja keseluruhan.
    4.  Kasir dapat memperbarui kuantitas barang belanjaan langsung di keranjang (misal: mengubah jumlah dari 1 menjadi 3).
    5.  Sistem mengalkulasi ulang total pembayaran secara instan.
    6.  Kasir mengklik tombol **"Proses Pembayaran"**.
    7.  Kasir memasukkan nominal uang tunai yang diberikan pelanggan.
    8.  Sistem menghitung kembalian uang dan mengaktifkan tombol **"Selesaikan Transaksi"**.
    9.  Kasir menekan tombol selesaikan transaksi.
    10. Sistem menyimpan data transaksi ke tabel penjualan, memperbarui sisa stok barang di tabel produk secara otomatis, dan memunculkan pop-up struk transaksi.
*   **Alur Alternatif/Pengecualian (Alternative/Exception Flow):**
    *   *4a. Stok Kosong:* Jika stok barang bernilai 0 di database, sistem menampilkan pesan peringatan merah "Stok Habis" dan mencegah barang dimasukkan ke keranjang belanja POS.
    *   *7a. Uang Kurang:* Jika nominal uang tunai yang diinput kasir kurang dari total belanjaan, tombol "Selesaikan Transaksi" dinonaktifkan dan muncul keterangan "Uang Pembayaran Kurang".

### UC-03: Menjelajahi Katalog & Memesan (Pelanggan)
*   **Aktor:** Pelanggan (Publik)
*   **Kondisi Awal (Preconditions):** Pelanggan memiliki koneksi internet dan membuka alamat URL katalog online RitelKM.
*   **Alur Utama (Main Flow):**
    1.  Pelanggan membuka beranda katalog RitelKM.
    2.  Sistem menampilkan kartu produk (product cards) yang dikelompokkan per kategori.
    3.  Pelanggan mencari nama produk di kolom pencarian atau memfilter berdasarkan kategori produk.
    4.  Pelanggan mengklik tombol **"Tambah ke Keranjang"** pada produk yang diinginkan.
    5.  Pelanggan membuka ikon **Keranjang Belanja** di pojok atas layar.
    6.  Pelanggan mengisi form data pemesanan (Nama Pelanggan dan Catatan tambahan).
    7.  Pelanggan mengklik tombol **"Kirim Pesanan via WhatsApp"**.
    8.  Sistem menyusun teks pesanan otomatis, membuka tautan WhatsApp eksternal (`https://wa.me/{nomor_toko}`), dan mengarahkan pengguna ke aplikasi WhatsApp.
*   **Alur Alternatif/Pengecualian (Alternative/Exception Flow):**
    *   *4a. Barang Kosong:* Jika barang berstatus stok kosong di database, sistem menampilkan tombol "Habis" dan menonaktifkan klik tambah ke keranjang belanja.
