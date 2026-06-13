# Spesifikasi Endpoint Inertia & React Props - RitelKM

Aplikasi RitelKM dikembangkan menggunakan arsitektur monolitik modern berbasis **Laravel Inertia.js & React**. Komunikasi data antara Backend (Laravel) dan Frontend (React) tidak memerlukan REST API JSON biasa. Data dilewatkan sebagai **React Props** saat me-render halaman, dan aksi input dikirim menggunakan **Inertia Form Helper / Router** (`router.post`, `router.put`, `router.delete`).

Dokumen ini mendefinisikan rute halaman (routes), nama komponen React (Pages), properti (*props*) yang dikirimkan, serta skema pengiriman formulir (*form submission*).

---

## 1. Ringkasan Endpoint & Halaman (Inertia Pages)

| No | Rute URL | HTTP Method | Nama Halaman React | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | `GET` | `welcome` | Halaman katalog produk interaktif untuk publik. | Publik |
| 2 | `/orders` | `POST` | (Redirect Back) | Menyimpan transaksi baru (dari kasir POS atau pesanan online). | Publik / Kasir |
| 3 | `/dashboard`| `GET` | `dashboard` | Halaman dasbor analitik penjualan untuk Owner. | Owner |
| 4 | `/pos` | `GET` | `pos` | Halaman kasir penjualan langsung (POS). | Kasir / Owner |
| 5 | `/inventaris`| `GET` | `inventaris` | Halaman kelola produk dan stok barang. | Owner |
| 6 | `/products` | `POST` | (Redirect Back) | Menambah produk baru ke inventaris. | Owner |
| 7 | `/products/{id}`| `PUT` / `POST` | (Redirect Back) | Memperbarui detail data produk. | Owner |
| 8 | `/products/{id}`| `DELETE` | (Redirect Back) | Menghapus produk dari database. | Owner |

---

## 2. Detail Props Halaman & Skema Form

### 2.1 Halaman Katalog Produk Publik (`welcome`)
*   **Rute URL:** `/`
*   **Komponen React:** `resources/js/pages/welcome.tsx`
*   **Props yang Diterima:**
    ```typescript
    interface WelcomeProps {
      products: Array<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        price_buy: number;
        price_sell: number;
        stock_current: number;
        stock_min: number;
        image_url: string | null;
        category: {
          id: number;
          name: string;
        }
      }>;
      categories: Array<{
        id: number;
        name: string;
        slug: string;
      }>;
      filters: {
        search?: string;
        category?: string;
      };
    }
    ```

---

### 2.2 Halaman Kasir POS (`pos`)
*   **Rute URL:** `/pos`
*   **Komponen React:** `resources/js/pages/pos.tsx`
*   **Props yang Diterima:**
    ```typescript
    interface POSProps {
      products: Array<{
        id: number;
        name: string;
        price_sell: number;
        stock_current: number;
        category: string;
      }>;
    }
    ```
*   **Aksi Checkout Transaksi (`router.post` ke `/orders`):**
    *   **Payload Pengiriman:**
        ```typescript
        interface OrderForm {
          customer_name: string; // default "Pelanggan Toko" jika POS kasir
          customer_whatsapp?: string; // Diisi jika pemesanan katalog online
          total_paid?: number; // Nominal pembayaran tunai (Kasir POS)
          items: Array<{
            product_id: number;
            quantity: number;
          }>;
        }
        ```
    *   **Respon Sukses (Flashed props pada `usePage().props.flash`):**
        Sistem melakukan redirect back dan me-lempar data transaksi yang sukses agar React dapat memunculkan struk belanja secara otomatis:
        ```typescript
        interface FlashOrderProps {
          success: string; // "Transaksi berhasil disimpan."
          order: {
            id: number;
            customer_name: string;
            total_price: number;
            total_paid: number;
            change_amount: number;
            status: 'pending' | 'completed';
            created_at: string;
          }
        }
        ```
    *   **Respon Eror (Flashed errors pada `usePage().props.errors`):**
        ```typescript
        interface FlashErrorsProps {
          transaction?: string; // Pesan kesalahan stok habis atau uang pembayaran kurang
        }
        ```

---

### 2.3 Halaman Dasbor Owner (`dashboard`)
*   **Rute URL:** `/dashboard`
*   **Komponen React:** `resources/js/pages/dashboard.tsx`
*   **Props yang Diterima:**
    ```typescript
    interface DashboardProps {
      summary: {
        total_sales_today: number; // Omzet Penjualan Hari Ini
        transaction_count_today: number; // Jumlah Transaksi Hari Ini
        net_profit_this_month: number; // Laba Bersih Bulan Ini
        low_stock_alerts_count: number; // Jumlah produk stok menipis
      };
      top_products: Array<{
        product_id: number;
        name: string;
        total_sold: number;
      }>;
    }
    ```

---

### 2.4 Halaman Manajemen Inventaris (`inventaris`)
*   **Rute URL:** `/inventaris`
*   **Komponen React:** `resources/js/pages/inventaris.tsx`
*   **Props yang Diterima:**
    ```typescript
    interface InventarisProps {
      products: Array<{
        id: number;
        name: string;
        slug: string;
        description: string | null;
        price_buy: number;
        price_sell: number;
        stock_current: number;
        stock_min: number;
        image_url: string | null;
        category: {
          id: number;
          name: string;
        }
      }>;
      categories: Array<{
        id: number;
        name: string;
      }>;
    }
    ```
*   **Aksi Simpan / Tambah Produk (`router.post` ke `/products`):**
    Mengirim data formulir Multipart (untuk mengupload file gambar):
    ```typescript
    interface ProductCreateForm {
      name: string;
      category_id: number;
      price_buy: number;
      price_sell: number;
      stock_current: number;
      stock_min: number;
      description?: string;
      image?: File; // file input
    }
    ```
