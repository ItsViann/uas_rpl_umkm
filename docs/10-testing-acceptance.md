# Rencana Pengujian & Penerimaan Pengguna (UAT) - RitelKM

Dokumen ini mendefinisikan rencana pengujian fungsionalitas sistem RitelKM dan lembar skenario User Acceptance Testing (UAT) untuk memastikan semua kebutuhan produk berjalan dengan baik sebelum diserahterimakan.

---

## 1. Strategi Pengujian (Testing Strategy)

Proses pengujian RitelKM dibagi menjadi tiga tingkat utama:

1.  **Pengujian Unit (Unit Testing):** Menguji fungsi-fungsi logika bisnis terkecil secara terisolasi. Pengujian unit ditulis menggunakan pustaka pengujian bawaan Laravel (PHPUnit/Pest) di direktori `tests/Unit/` (misal: pengujian logika perhitungan kembalian kasir).
2.  **Pengujian Integrasi (Integration Testing):** Memastikan interaksi antar komponen berjalan lancar, seperti integrasi antara Controller, database, dan middleware otentikasi. Ditulis di direktori `tests/Feature/`.
3.  **User Acceptance Testing (UAT):** Pengujian manual yang dilakukan oleh pengguna akhir (pemilik UMKM atau kasir) untuk memvalidasi alur kerja aplikasi dari ujung ke ujung (end-to-end).

---

## 2. Lembar Skenario UAT (UAT Test Cases)

Berikut adalah tabel skenario pengujian fungsionalitas utama yang harus diuji dan lolos verifikasi:

| ID Tes | Fitur / Modul | Skenario Pengujian | Tindakan Pengujian | Hasil yang Diharapkan | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Autentikasi | Login dengan kredensial valid | Masukkan email & password terdaftar, klik "Login". | Sistem mengalihkan pengguna ke Dashboard/POS dan menampilkan menu admin sesuai role. | Belum Uji |
| **TC-02** | Autentikasi | Login dengan sandi salah | Masukkan email valid tetapi password acak, klik "Login". | Muncul pesan eror "Email atau kata sandi salah" dan tetap di halaman login. | Belum Uji |
| **TC-03** | Inventaris | Menambah produk baru | Masuk ke menu Inventaris, klik "Tambah Produk", isi form lengkap, klik "Simpan". | Produk tersimpan di database, stok tercatat, foto terupload, produk tampil di tabel inventaris. | Belum Uji |
| **TC-04** | Inventaris | Deteksi stok menipis (Alert) | Ubah jumlah stok salah satu produk hingga berada di bawah nilai stok minimum. | Sistem menampilkan label berwarna merah/kuning "Stok Menipis" di dashboard admin. | Belum Uji |
| **TC-05** | POS Kasir | Menambahkan barang ke keranjang | Cari produk di menu POS, klik produk tersebut. | Produk muncul di daftar belanja sebelah kanan, subtotal terhitung otomatis secara benar. | Belum Uji |
| **TC-06** | POS Kasir | Penghitungan uang kembalian | Isi nominal pembayaran di input bayar dengan jumlah melebihi total belanjaan. | Sistem menghitung dan menampilkan nilai kembalian uang secara instan dan tepat. | Belum Uji |
| **TC-07** | POS Kasir | Pengurangan stok otomatis | Selesaikan transaksi belanja di POS kasir. | Transaksi tersimpan di database, dan stok barang fisik produk berkurang sesuai jumlah yang dibeli. | Belum Uji |
| **TC-08** | Katalog Publik | Menggunakan filter kategori | Akses katalog publik, klik salah satu tombol kategori (misal: "Kopi"). | Katalog hanya menampilkan produk-produk yang masuk dalam kategori "Kopi". | Belum Uji |
| **TC-09** | Katalog Publik | Pemesanan via WhatsApp | Tambah item ke keranjang belanja pelanggan, isi nama, klik "Pesan via WhatsApp". | Browser membuka tab baru mengarah ke WhatsApp dengan teks rincian pesanan yang terformat rapi. | Belum Uji |

---

## 3. Kriteria Penerimaan Proyek (Acceptance Criteria)

Sistem RitelKM dinyatakan **diterima** dan siap digunakan untuk UAS jika memenuhi kriteria berikut:
1.  Semua skenario pengujian berstatus **Lolos (Pass)** pada saat demonstrasi aplikasi.
2.  Tidak ada bug berkategori **Kritis (Blocker)** yang dapat menghentikan jalannya aplikasi secara tiba-tiba (aplikasi macet atau database crash).
3.  Kode backend dan frontend bersih dari error/warning linting saat diverifikasi melalui perintah `npm run ci:check`.
