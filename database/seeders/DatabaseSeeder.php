<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockLog;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 0. Create Store Setting
        \App\Models\StoreSetting::create([
            'store_name' => 'UMKMku',
            'store_address' => 'Jl. Raya RPL UMKM No. 12, Malang',
            'store_phone' => '0812-3456-7890',
            'whatsapp_number' => '628123456789',
            'receipt_footer' => 'Struk belanja sah sebagai bukti transaksi digital RitelKM',
        ]);

        // 1. Create Default Users
        $owner = User::create([
            'name' => 'Budi Santoso (Owner)',
            'email' => 'owner@ritelkm.com',
            'password' => bcrypt('password123'),
            'role' => 'owner',
        ]);

        $cashier = User::create([
            'name' => 'Ahmad Kasir',
            'email' => 'kasir@ritelkm.com',
            'password' => bcrypt('password123'),
            'role' => 'kasir',
        ]);

        // 2. Create Categories
        $kopi = Category::create(['name' => 'Kopi', 'slug' => 'kopi']);
        $teh = Category::create(['name' => 'Teh', 'slug' => 'teh']);
        $cemilan = Category::create(['name' => 'Cemilan', 'slug' => 'cemilan']);
        $minuman = Category::create(['name' => 'Minuman', 'slug' => 'minuman']);
        $makanan = Category::create(['name' => 'Makanan Berat', 'slug' => 'makanan-berat']);
        $sembako = Category::create(['name' => 'Sembako', 'slug' => 'sembako']);

        // 3. Create Products list with Unsplash images
        $productsData = [
            [
                'category_id' => $kopi->id,
                'name' => 'Kopi Arabika Gayo 250g',
                'slug' => 'kopi-arabika-gayo-250g',
                'description' => 'Kopi Gayo Arabika asli mutu tinggi, medium roast.',
                'price_buy' => 15000.00,
                'price_sell' => 25000.00,
                'stock_current' => 50,
                'stock_min' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $teh->id,
                'name' => 'Teh Melati Premium',
                'slug' => 'teh-melati-premium',
                'description' => 'Teh wangi melati pilihan dengan daun teh segar.',
                'price_buy' => 5000.00,
                'price_sell' => 8000.00,
                'stock_current' => 30,
                'stock_min' => 4,
                'image_path' => 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $cemilan->id,
                'name' => 'Keripik Singkong Pedas',
                'slug' => 'keripik-singkong-pedas',
                'description' => 'Keripik singkong gurih dengan bumbu cabai asli.',
                'price_buy' => 6000.00,
                'price_sell' => 10000.00,
                'stock_current' => 2, // Low stock alert trigger
                'stock_min' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $minuman->id,
                'name' => 'Suku UHT Full Cream 1L',
                'slug' => 'susu-uht-full-cream-1l',
                'description' => 'Susu segar UHT rasa full cream padat nutrisi.',
                'price_buy' => 12000.00,
                'price_sell' => 18000.00,
                'stock_current' => 24,
                'stock_min' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $makanan->id,
                'name' => 'Mie Instan Goreng',
                'slug' => 'mie-instan-goreng',
                'description' => 'Mie instan goreng favorit keluarga.',
                'price_buy' => 2500.00,
                'price_sell' => 3500.00,
                'stock_current' => 120,
                'stock_min' => 10,
                'image_path' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $sembako->id,
                'name' => 'Beras Premium 5kg',
                'slug' => 'beras-premium-5kg',
                'description' => 'Beras putih pulen premium kemasan 5 kilogram.',
                'price_buy' => 60000.00,
                'price_sell' => 75000.00,
                'stock_current' => 15,
                'stock_min' => 3,
                'image_path' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $sembako->id,
                'name' => 'Minyak Goreng 2L',
                'slug' => 'minyak-goreng-2l',
                'description' => 'Minyak goreng kelapa sawit jernih ganda penyaringan.',
                'price_buy' => 28000.00,
                'price_sell' => 34000.00,
                'stock_current' => 3, // Low stock alert trigger
                'stock_min' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $sembako->id,
                'name' => 'Gula Pasir 1kg',
                'slug' => 'gula-pasir-1kg',
                'description' => 'Gula pasir tebu kristal putih alami kualitas tinggi.',
                'price_buy' => 13000.00,
                'price_sell' => 16000.00,
                'stock_current' => 40,
                'stock_min' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1581781870027-04212e231e96?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $cemilan->id,
                'name' => 'Roti Tawar Gandum',
                'slug' => 'roti-tawar-gandum',
                'description' => 'Roti tawar gandum tinggi serat dan bergizi.',
                'price_buy' => 12000.00,
                'price_sell' => 15000.00,
                'stock_current' => 8,
                'stock_min' => 3,
                'image_path' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop',
            ],
            [
                'category_id' => $cemilan->id,
                'name' => 'Cokelat Bar Premium 100g',
                'slug' => 'cokelat-bar-premium-100g',
                'description' => 'Cokelat batang premium lezat rasa susu cashew.',
                'price_buy' => 14000.00,
                'price_sell' => 19000.00,
                'stock_current' => 25,
                'stock_min' => 5,
                'image_path' => 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=300&auto=format&fit=crop',
            ],
        ];

        foreach ($productsData as $data) {
            $product = Product::create($data);

            // 4. Record Initial Stock Logs
            StockLog::create([
                'product_id' => $product->id,
                'user_id' => $owner->id,
                'type' => 'in',
                'quantity' => $product->stock_current,
                'note' => 'Inisialisasi stok awal',
            ]);
        }
    }
}
