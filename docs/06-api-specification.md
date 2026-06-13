# Spesifikasi REST API - RitelKM

Dokumen ini menjelaskan rancangan endpoint API yang digunakan dalam aplikasi RitelKM. API ini memfasilitasi komunikasi antara Frontend (React SPA) dan Backend (Laravel), serta integrasi data yang fleksibel.

---

## 1. Ringkasan Endpoint

| No | Modul | HTTP Verb | Endpoint | Deskripsi | Hak Akses |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Autentikasi | `POST` | `/api/login` | Login ke sistem dan mendapatkan sesi | Publik |
| 2 | Autentikasi | `POST` | `/api/logout` | Menghapus sesi login | Kasir, Owner |
| 3 | Inventaris | `GET` | `/api/products` | Mendapatkan daftar produk (dengan pencarian/filter) | Publik |
| 4 | Inventaris | `POST` | `/api/products` | Menambah produk baru ke inventaris | Owner |
| 5 | Inventaris | `PUT` | `/api/products/{id}`| Memperbarui data produk | Owner |
| 6 | Inventaris | `DELETE`| `/api/products/{id}`| Menghapus produk dari database | Owner |
| 7 | Transaksi | `POST` | `/api/orders` | Menyimpan transaksi baru (Kasir/Online) | Publik, Kasir |
| 8 | Laporan | `GET` | `/api/reports/summary`| Mendapatkan data performa penjualan toko | Owner |

---

## 2. Detail Endpoint

### 2.1 Autentikasi: Login
*   **Endpoint:** `/api/login`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`
*   **Request Body:**
    ```json
    {
      "email": "owner@ritelkm.com",
      "password": "password123"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Login berhasil",
      "user": {
        "id": 1,
        "name": "Budi Santoso",
        "email": "owner@ritelkm.com",
        "role": "owner"
      }
    }
    ```
*   **Response (422 Unprocessable Entity):**
    ```json
    {
      "message": "Validasi gagal",
      "errors": {
        "email": ["Email atau kata sandi salah."]
      }
    }
    ```

---

### 2.2 Inventaris: Dapatkan Produk (Katalog / POS)
Mendukung pencarian menggunakan parameter query string `search` dan filter `category`.
*   **Endpoint:** `/api/products`
*   **Method:** `GET`
*   **Query Parameters:**
    *   `search` (opsional): Mencari nama produk (e.g. `?search=kopi`)
    *   `category` (opsional): Filter slug kategori (e.g. `?category=minuman`)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": [
        {
          "id": 3,
          "name": "Kopi Gayo",
          "slug": "kopi-gayo",
          "description": "Kopi Arabika Gayo asli ukuran 250gr",
          "price_buy": 15000,
          "price_sell": 25000,
          "stock_current": 48,
          "stock_min": 5,
          "image_url": "/storage/products/kopi-gayo.jpg",
          "category": {
            "id": 1,
            "name": "Kopi"
          }
        }
      ]
    }
    ```

---

### 2.3 Inventaris: Tambah Produk
Menambahkan produk baru. Memerlukan autentikasi level **Owner**.
*   **Endpoint:** `/api/products`
*   **Method:** `POST`
*   **Request Body (Multipart Form-Data):**
    *   `name`: "Kopi Robusta"
    *   `category_id`: 1
    *   `price_buy`: 12000
    *   `price_sell`: 20000
    *   `stock_current`: 30
    *   `stock_min`: 3
    *   `image`: [File Binary]
*   **Response (210 Created):**
    ```json
    {
      "success": true,
      "message": "Produk berhasil ditambahkan",
      "product_id": 4
    }
    ```

---

### 2.4 Transaksi: Buat Transaksi Baru
Menyimpan data penjualan dari POS Kasir atau mencatat pesanan katalog online.
*   **Endpoint:** `/api/orders`
*   **Method:** `POST`
*   **Request Body:**
    ```json
    {
      "customer_name": "Pelanggan Toko",
      "customer_whatsapp": null,
      "total_paid": 50000,
      "items": [
        {
          "product_id": 3,
          "quantity": 2
        }
      ]
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Transaksi berhasil disimpan",
      "order": {
        "id": 154,
        "customer_name": "Pelanggan Toko",
        "total_price": 50000,
        "total_paid": 50000,
        "change_amount": 0,
        "status": "completed",
        "created_at": "2026-06-13T16:30:00Z"
      }
    }
    ```

---

### 2.5 Laporan: Ringkasan Analitik Dashboard
Mendapatkan metrik ringkasan performa bisnis untuk ditampilkan di dashboard Owner.
*   **Endpoint:** `/api/reports/summary`
*   **Method:** `GET`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "summary": {
        "total_sales_today": 1250000,
        "transaction_count_today": 25,
        "net_profit_this_month": 4500000,
        "low_stock_alerts_count": 2
      },
      "top_products": [
        {
          "product_id": 3,
          "name": "Kopi Gayo",
          "total_sold": 85
        },
        {
          "product_id": 1,
          "name": "Teh Manis",
          "total_sold": 72
        }
      ]
    }
    ```
