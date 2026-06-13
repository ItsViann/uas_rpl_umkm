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

        // 3. Create Products
        $p1 = Product::create([
            'category_id' => $kopi->id,
            'name' => 'Kopi Arabika Gayo 250g',
            'slug' => 'kopi-arabika-gayo-250g',
            'description' => 'Kopi Gayo Arabika asli mutu tinggi, medium roast.',
            'price_buy' => 15000.00,
            'price_sell' => 25000.00,
            'stock_current' => 50,
            'stock_min' => 5,
            'image_path' => null,
        ]);

        $p2 = Product::create([
            'category_id' => $teh->id,
            'name' => 'Teh Melati Premium',
            'slug' => 'teh-melati-premium',
            'description' => 'Teh wangi melati pilihan dengan daun teh segar.',
            'price_buy' => 5000.00,
            'price_sell' => 8000.00,
            'stock_current' => 30,
            'stock_min' => 4,
            'image_path' => null,
        ]);

        $p3 = Product::create([
            'category_id' => $cemilan->id,
            'name' => 'Keripik Singkong Pedas',
            'slug' => 'keripik-singkong-pedas',
            'description' => 'Keripik singkong gurih dengan bumbu cabai asli.',
            'price_buy' => 6000.00,
            'price_sell' => 10000.00,
            'stock_current' => 2, // Low stock on purpose to test warnings!
            'stock_min' => 5,
            'image_path' => null,
        ]);

        // 4. Record Initial Stock Logs
        StockLog::create([
            'product_id' => $p1->id,
            'user_id' => $owner->id,
            'type' => 'in',
            'quantity' => 50,
            'note' => 'Inisialisasi stok awal',
        ]);

        StockLog::create([
            'product_id' => $p2->id,
            'user_id' => $owner->id,
            'type' => 'in',
            'quantity' => 30,
            'note' => 'Inisialisasi stok awal',
        ]);

        StockLog::create([
            'product_id' => $p3->id,
            'user_id' => $owner->id,
            'type' => 'in',
            'quantity' => 2,
            'note' => 'Inisialisasi stok awal',
        ]);
    }
}
