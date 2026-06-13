# Aturan Pengembangan Berbasis AI & Standar Coding - RitelKM

Dokumen ini mendefinisikan standar teknis, konvensi penulisan kode, alur kerja Git, dan panduan instruksi (prompting) untuk pengembang manusia maupun agen AI agar basis kode RitelKM tetap konsisten, bersih, dan mudah dirawat.

---

## 1. Konvensi Penulisan Kode (Coding Standards)

Semua kode yang ditulis untuk RitelKM harus mematuhi aturan linting dan pemformatan otomatis yang sudah dikonfigurasi pada proyek.

### 1.1 Kode Backend (PHP & Laravel)
*   **Standar Sintaks:** Menggunakan standar **PSR-12** melalui konfigurasi **Laravel Pint** (`pint.json`).
*   **Aturan Utama PHP:**
    *   Gunakan deklarasi tipe data yang ketat (`declare(strict_types=1);`) di baris paling atas berkas jika memungkinkan.
    *   Tulis tipe kembalian (return type) secara eksplisit untuk setiap method controller, model, dan service.
    *   Hindari penulisan logika bisnis yang kompleks di dalam Route file (`routes/web.php`). Gunakan Controller yang terdedikasi.
*   **Pemformatan Kode:** Jalankan perintah pemformatan otomatis sebelum melakukan commit:
    ```bash
    composer run lint
    ```

### 1.2 Kode Frontend (TypeScript & React)
*   **Standar Sintaks:** Menggunakan TypeScript ketat dengan pemformatan melalui **ESLint** (`eslint.config.js`) dan **Prettier** (`.prettierrc`).
*   **Aturan Utama React:**
    *   Gunakan fungsional komponen dengan hooks (`useState`, `useEffect`, dll) ketimbang class-based components.
    *   Definisikan tipe data Props menggunakan interface atau type TypeScript.
    *   Jangan gunakan tipe data `any` secara sembarangan; definisikan tipe data yang spesifik.
    *   Pastikan semua komponen React memiliki ekspor tunggal (`export default`).
*   **Pemformatan Kode:** Jalankan perintah berikut untuk memeriksa kepatuhan tipe dan format:
    ```bash
    npm run lint:check
    npm run types:check
    ```

---

## 2. Pola Arsitektur Aplikasi (Laravel + Inertia)

Aplikasi RitelKM menggunakan integrasi **Inertia.js** untuk menjembatani Backend Laravel dan Frontend React. Ikuti aturan arsitektur berikut:

1.  **Inertia Routing:** Semua perutean (routing) dikendalikan dari backend Laravel (`routes/web.php` dan `routes/settings.php`).
2.  **State Management:** State data dilewatkan dari Controller Laravel sebagai props melalui fungsi penolong `Inertia::render('NamaHalaman', $data)`.
3.  **Controllers:** Controller harus tipis (*Thin Controllers*). Logika manipulasi data database harus dilakukan via model Eloquent atau dipindahkan ke Service Class terpisah jika terlalu rumit.
4.  **Database:** Selalu gunakan **Eloquent ORM** untuk interaksi dengan database. Hindari menulis query mentah (*Raw SQL*) kecuali jika sangat dibutuhkan demi performa.

---

## 3. Konvensi Git Commit & Branching

Mengikuti standardisasi **Conventional Commits** untuk memudahkan pembuatan log perubahan otomatis (changelog) dan melacak histori kode.

### 3.1 Format Pesan Commit
Pesan commit harus ditulis dalam bahasa Inggris/Indonesia yang jelas dengan format:
```text
<type>(<scope>): <description>

[body] (opsional)
```

**Daftar Tipe Commit (`type`):**
*   `feat`: Penambahan fitur baru (misal: `feat(pos): add cash change calculation logic`).
*   `fix`: Perbaikan bug/eror (misal: `fix(auth): redirect loop on user login`).
*   `docs`: Perubahan atau penambahan file dokumentasi (misal: `docs(db): update ERD diagrams`).
*   `style`: Perubahan tampilan/styling tanpa mengubah fungsi kode (misal: `style(welcome): fix header spacing`).
*   `refactor`: Pengorganisasian ulang kode tanpa mengubah perilaku (misal: `refactor(product): simplify controller validation`).

### 3.2 Nama Branch (Cabang Git)
Gunakan prefix tipe branch diikuti dengan deskripsi singkat:
*   `feature/nama-fitur` (e.g. `feature/pos-interface`)
*   `bugfix/deskripsi-error` (e.g. `bugfix/stock-decrement-failed`)

---

## 4. Aturan Interaksi dengan AI (AI Prompting Rules)

Ketika meminta bantuan AI Coding Assistant untuk memodifikasi proyek ini, gunakan aturan ini sebagai konteks wajib:
1.  **Pertahankan Komentar Asli:** AI dilarang menghapus komentar atau dokumentasi internal kode (docstring) yang sudah ada sebelumnya.
2.  **Gunakan Link File:** Tulis tautan file yang jelas dalam format Markdown (misal: [UserController.php](file:///c:/Users/Viannnnn/Documents/uas_rpl_umkm/app/Http/Controllers/UserController.php)) saat menjelaskan modifikasi file.
3.  **Prioritaskan Linting:** Sebelum menyerahkan hasil kode baru, pastikan AI memverifikasi keabsahan sintaksis agar tidak merusak proses build saat `npm run dev` dijalankan.
