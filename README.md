# RitelKM - Dokumentasi Sistem Manajemen UMKM

Selamat datang di repositori dokumentasi **RitelKM**, sebuah sistem manajemen terpadu yang dirancang khusus untuk Usaha Mikro, Kecil, dan Menengah (UMKM). Proyek ini dikembangkan sebagai bagian dari tugas Ujian Akhir Semester (UAS) Rekayasa Perangkat Lunak (RPL).

## Deskripsi Singkat Sistem
**RitelKM** adalah aplikasi berbasis web yang menggabungkan fitur **Point of Sales (POS)**, **Manajemen Inventaris (Stok)**, dan **Katalog Produk Online**. Sistem ini bertujuan membantu pelaku UMKM beralih dari pencatatan manual ke sistem digital yang efisien, akurat, dan mudah digunakan.

Dengan RitelKM, UMKM dapat:
1.  Memajang produk secara online melalui katalog interaktif tanpa biaya operasional tinggi.
2.  Mencatat transaksi penjualan secara langsung (POS) di toko fisik.
3.  Memantau stok barang secara otomatis saat terjadi transaksi.
4.  Melihat laporan keuangan dan penjualan berkala secara instan.

---

## Struktur Dokumentasi

Dokumentasi ini dibagi menjadi 10 bagian utama yang mencakup seluruh siklus pengembangan perangkat lunak (SDLC) dari analisis kebutuhan hingga pengujian:

```text
docs/
├── README.md                              # Panduan Utama (Dokumen Ini)
├── 01-product-requirement-document.md    # Kebutuhan Produk & Ruang Lingkup Proyek
├── 02-user-stories.md                     # Kebutuhan Pengguna & Kriteria Penerimaan
├── 03-usecase-business-flow.md            # Alur Bisnis & Detail Use Case
├── 04-system-diagrams.md                  # Diagram Use Case & Flowchart Sistem
├── 05-database-design.md                  # Skema Database & ERD
├── 06-api-specification.md                # Spesifikasi Endpoint REST API
├── 07-ui-pages.md                         # Peta Situs & Desain Tata Letak UI
├── 08-development-roadmap.md              # Rencana Rilis & Milestone Proyek
├── 09-ai-development-rules.md             # Panduan Pengodean & Standar AI
└── 10-testing-acceptance.md               # Rencana Uji & Kasus Uji (UAT)
```

---

## Spesifikasi Teknologi Utama

Sistem RitelKM dirancang dengan arsitektur modern yang ringan dan mudah dipelihara:

*   **Backend & Framework Utama:** Laravel 13 (PHP ^8.3)
*   **Frontend Library:** React (TypeScript)
*   **Jembatan Penghubung:** Inertia.js (menghubungkan Laravel & React tanpa membangun API terpisah jika tidak diperlukan, melainkan menggunakan routing controller yang efisien)
*   **Database:** SQLite / MySQL
*   **Alat Bantu Styling:** Tailwind CSS & Shaded UI (atau vanilla CSS sesuai preferensi)
*   **Standardisasi Kode:** Laravel Pint (PHP) & ESLint/Prettier (TypeScript/React)

---

## Anggota Pengembang & Kontribusi
*Dokumen ini disusun sebagai bagian dari pemenuhan UAS mata kuliah Rekayasa Perangkat Lunak.*
Silakan baca masing-masing berkas markdown untuk mempelajari detail dari sistem ini.
