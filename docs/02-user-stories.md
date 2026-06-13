# User Stories & Kriteria Penerimaan - RitelKM

Dokumen ini mendefinisikan kebutuhan pengguna dalam bentuk *User Stories* bersama dengan *Acceptance Criteria* (Kriteria Penerimaan) menggunakan format standar BDD (Behavior-Driven Development): **Given** (Kondisi Awal) - **When** (Tindakan) - **Then** (Hasil yang Diharapkan).

---

## 1. Peran: Pemilik UMKM (Owner/Admin)

### US-01: Mengelola Produk di Inventaris
> **Sebagai** Pemilik UMKM,
> **Saya ingin** menambah, mengubah, dan menghapus data produk di sistem,
> **Sehingga** saya bisa menyinkronkan data barang fisik dengan katalog digital toko saya.

*   **Skenario 1: Menambah produk baru dengan sukses**
    *   **Given:** Owner sudah masuk ke dashboard admin dan berada di halaman "Manajemen Inventaris".
    *   **When:** Owner mengklik tombol "Tambah Produk", mengisi form (Nama: "Kopi Gayo", Kategori: "Kopi", Harga Beli: 15000, Harga Jual: 25000, Stok: 50, Stok Minimum: 5), lalu mengklik "Simpan".
    *   **Then:** Sistem menyimpan data produk ke database dan menampilkan pesan sukses "Produk berhasil ditambahkan". Produk baru langsung muncul di tabel inventaris.
*   **Skenario 2: Gagal menyimpan karena data tidak lengkap**
    *   **Given:** Owner berada di form "Tambah Produk".
    *   **When:** Owner membiarkan input "Harga Jual" kosong dan mengklik "Simpan".
    *   **Then:** Sistem menolak penyimpanan, memberikan sorotan merah pada input "Harga Jual", dan menampilkan pesan kesalahan "Harga Jual wajib diisi".

### US-02: Memantau Laporan Penjualan
> **Sebagai** Pemilik UMKM,
> **Saya ingin** melihat ringkasan penjualan harian dan laporan laba-rugi bulanan,
> **Sehingga** saya dapat menganalisis kesehatan keuangan toko dan mengambil keputusan bisnis yang tepat.

*   **Skenario 1: Melihat total penjualan bulan berjalan**
    *   **Given:** Owner sudah login dan membuka halaman "Laporan Penjualan".
    *   **When:** Owner memilih filter waktu "Bulan Ini".
    *   **Then:** Sistem menampilkan grafik omzet harian, ringkasan total pendapatan, total pengeluaran (harga beli pokok), dan estimasi keuntungan bersih untuk bulan tersebut.

---

## 2. Peran: Kasir (Staf Toko)

### US-03: Melakukan Transaksi POS (Point of Sales)
> **Sebagai** Kasir,
> **Saya ingin** memasukkan produk yang dibeli pelanggan ke kasir digital dan merekam pembayaran mereka,
> **Sehingga** transaksi dapat selesai dengan cepat dan stok barang langsung berkurang secara akurat.

*   **Skenario 1: Transaksi penjualan barang dengan pembayaran tunai pas**
    *   **Given:** Kasir berada di halaman kasir (POS) dan terdapat 2 unit "Kopi Gayo" di keranjang belanja (total Rp50.000).
    *   **When:** Kasir mengklik tombol "Bayar", memilih metode "Tunai", mengetikkan jumlah uang Rp50.000, lalu menekan tombol "Selesaikan Transaksi".
    *   **Then:** Sistem menyimpan transaksi penjualan, memperbarui stok "Kopi Gayo" dari 50 menjadi 48, menampilkan modal transaksi berhasil, dan menyediakan opsi "Cetak Struk".
*   **Skenario 2: Transaksi gagal karena stok tidak mencukupi**
    *   **Given:** Stok fisik "Kopi Gayo" di database adalah 1 unit.
    *   **When:** Kasir mencoba menambahkan 2 unit "Kopi Gayo" ke keranjang belanja.
    *   **Then:** Sistem memunculkan notifikasi peringatan "Stok tidak mencukupi! Sisa stok Kopi Gayo tinggal 1 unit" dan membatasi jumlah barang di keranjang maksimal 1 unit.

---

## 3. Peran: Pelanggan (Customer)

### US-04: Menjelajahi Katalog Produk Online
> **Sebagai** Pelanggan,
> **Saya ingin** melihat katalog produk yang dijual toko secara online melalui HP saya,
> **Sehingga** saya bisa mengetahui barang apa saja yang tersedia beserta harganya sebelum berkunjung atau memesan.

*   **Skenario 1: Mencari produk tertentu**
    *   **Given:** Pelanggan mengakses halaman utama katalog online RitelKM.
    *   **When:** Pelanggan mengetik kata kunci "Kopi" pada kolom pencarian dan menekan Enter.
    *   **Then:** Sistem menampilkan seluruh daftar produk yang memiliki nama mengandung kata "Kopi" (misal: Kopi Gayo, Kopi Robusta, Bubuk Kopi).

### US-05: Melakukan Pemesanan via WhatsApp
> **Sebagai** Pelanggan,
> **Saya ingin** mengirimkan keranjang belanja online saya langsung ke WhatsApp toko,
> **Sehingga** saya bisa memesan barang dengan mudah tanpa harus mendaftar akun/melakukan transfer rumit di web.

*   **Skenario 1: Mengirim detail pesanan ke WhatsApp**
    *   **Given:** Pelanggan telah menambahkan 2 item ke keranjang belanja katalog online.
    *   **When:** Pelanggan membuka keranjang belanja, mengisi nama mereka ("Budi") dan alamat pengiriman, lalu mengklik tombol "Pesan via WhatsApp".
    *   **Then:** Sistem secara otomatis membuka tab baru mengarah ke `wa.me` dengan nomor telepon toko yang sudah terkonfigurasi, membawa teks format pesanan berisi daftar belanjaan Budi, total harga, dan detail pengiriman.
