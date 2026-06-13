<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StokLogTest extends TestCase
{
    use RefreshDatabase;

    private $owner;
    private $cashier;
    private $category;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create(['role' => 'owner']);
        $this->cashier = User::factory()->create(['role' => 'kasir']);

        $this->category = Category::create([
            'name' => 'Snack',
            'slug' => 'snack',
        ]);
    }

    public function test_guests_cannot_view_stock_logs()
    {
        $response = $this->get(route('stok-log'));
        $response->assertRedirect(route('login'));
    }

    public function test_cashiers_cannot_view_stock_logs()
    {
        $this->actingAs($this->cashier);

        $response = $this->get(route('stok-log'));
        $response->assertStatus(403);
    }

    public function test_owners_can_view_stock_logs()
    {
        $this->actingAs($this->owner);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Basreng',
            'slug' => 'basreng',
            'price_buy' => 4000,
            'price_sell' => 6000,
            'stock_current' => 20,
            'stock_min' => 2,
        ]);

        StockLog::create([
            'product_id' => $product->id,
            'user_id' => $this->owner->id,
            'type' => 'in',
            'quantity' => 20,
            'note' => 'Inisialisasi test log',
        ]);

        $response = $this->get(route('stok-log'));
        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('stok-log')
            ->has('logs', 1)
            ->where('logs.0.product_name', 'Basreng')
            ->where('logs.0.note', 'Inisialisasi test log')
        );
    }

    public function test_creating_product_with_stock_creates_log()
    {
        $this->actingAs($this->owner);

        $response = $this->post(route('products.store'), [
            'name' => 'Basreng Pedas',
            'category_id' => $this->category->id,
            'price_buy' => 5000,
            'price_sell' => 7000,
            'stock_current' => 15,
            'stock_min' => 2,
            'description' => 'Basreng pedas daun jeruk',
        ]);

        $response->assertRedirect();

        $product = Product::where('slug', 'like', 'basreng-pedas-%')->first();
        $this->assertNotNull($product);

        $this->assertDatabaseHas('stock_logs', [
            'product_id' => $product->id,
            'user_id' => $this->owner->id,
            'type' => 'in',
            'quantity' => 15,
            'note' => 'Inisialisasi stok awal',
        ]);
    }

    public function test_updating_product_stock_creates_adjustment_log()
    {
        $this->actingAs($this->owner);

        $product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Kerupuk Rambak',
            'slug' => 'kerupuk-rambak',
            'price_buy' => 10000,
            'price_sell' => 13000,
            'stock_current' => 10,
            'stock_min' => 1,
        ]);

        // Update to increase stock
        $response1 = $this->put(route('products.update', $product->id), [
            'name' => 'Kerupuk Rambak',
            'category_id' => $this->category->id,
            'price_buy' => 10000,
            'price_sell' => 13000,
            'stock_current' => 15, // increase by 5
            'stock_min' => 1,
        ]);

        $response1->assertRedirect();
        $this->assertDatabaseHas('stock_logs', [
            'product_id' => $product->id,
            'type' => 'in',
            'quantity' => 5,
            'note' => 'Penyesuaian stok via Edit Produk',
        ]);

        // Update to decrease stock
        $response2 = $this->put(route('products.update', $product->id), [
            'name' => 'Kerupuk Rambak',
            'category_id' => $this->category->id,
            'price_buy' => 10000,
            'price_sell' => 13000,
            'stock_current' => 8, // decrease by 7
            'stock_min' => 1,
        ]);

        $response2->assertRedirect();
        $this->assertDatabaseHas('stock_logs', [
            'product_id' => $product->id,
            'type' => 'out',
            'quantity' => 7,
            'note' => 'Penyesuaian stok via Edit Produk',
        ]);
    }
}
