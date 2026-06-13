<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    private $owner;
    private $cashier;
    private $category;
    private $product;

    protected function setUp(): void
    {
        parent::setUp();

        $this->owner = User::factory()->create(['role' => 'owner']);
        $this->cashier = User::factory()->create(['role' => 'kasir']);

        $this->category = Category::create([
            'name' => 'Minuman',
            'slug' => 'minuman',
        ]);

        $this->product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Es Teh Manis',
            'slug' => 'es-teh-manis',
            'price_buy' => 2000,
            'price_sell' => 5000,
            'stock_current' => 100,
            'stock_min' => 10,
        ]);
    }

    public function test_guests_cannot_view_reports_or_export_csv()
    {
        $response = $this->get(route('laporan'));
        $response->assertRedirect(route('login'));

        $responseExport = $this->get(route('laporan.export'));
        $responseExport->assertRedirect(route('login'));
    }

    public function test_cashiers_cannot_view_reports_or_export_csv()
    {
        $this->actingAs($this->cashier);

        $response = $this->get(route('laporan'));
        $response->assertStatus(403);

        $responseExport = $this->get(route('laporan.export'));
        $responseExport->assertStatus(403);
    }

    public function test_owners_can_view_reports_with_correct_metrics()
    {
        $this->actingAs($this->owner);

        // Place a completed order
        $order1 = Order::create([
            'user_id' => $this->cashier->id,
            'customer_name' => 'Pelanggan A',
            'total_price' => 15000, // 3 items * 5000
            'total_paid' => 20000,
            'change_amount' => 5000,
            'status' => 'completed',
            'created_at' => Carbon::now(),
        ]);

        OrderItem::create([
            'order_id' => $order1->id,
            'product_id' => $this->product->id,
            'quantity' => 3,
            'price_at_sale' => 5000,
            'price_buy_at_sale' => 2000,
            'subtotal' => 15000,
        ]);

        // Place a cancelled order (should not be calculated in profit/revenue)
        $order2 = Order::create([
            'user_id' => $this->cashier->id,
            'customer_name' => 'Pelanggan B',
            'total_price' => 10000,
            'total_paid' => 10000,
            'change_amount' => 0,
            'status' => 'cancelled',
            'created_at' => Carbon::now(),
        ]);

        OrderItem::create([
            'order_id' => $order2->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'price_at_sale' => 5000,
            'price_buy_at_sale' => 2000,
            'subtotal' => 10000,
        ]);

        $response = $this->get(route('laporan'));
        $response->assertOk();

        // Revenue = 15000, Cost = 3 * 2000 = 6000, Profit = 15000 - 6000 = 9000
        $response->assertInertia(fn ($page) => $page
            ->component('laporan')
            ->where('metrics.revenue', 15000)
            ->where('metrics.cost', 6000)
            ->where('metrics.profit', 9000)
            ->where('metrics.transactions', 1)
            ->has('categorySales', 1)
            ->where('categorySales.0.category_name', 'Minuman')
            ->where('categorySales.0.total_sales', 15000)
            ->where('categorySales.0.total_qty', 3)
        );
    }

    public function test_owners_can_export_sales_data_to_csv()
    {
        $this->actingAs($this->owner);

        // Place a completed order
        $order = Order::create([
            'user_id' => $this->cashier->id,
            'customer_name' => 'Pelanggan Ekspor',
            'total_price' => 10000,
            'total_paid' => 15000,
            'change_amount' => 5000,
            'status' => 'completed',
            'created_at' => Carbon::now(),
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'price_at_sale' => 5000,
            'price_buy_at_sale' => 2000,
            'subtotal' => 10000,
        ]);

        $response = $this->get(route('laporan.export'));
        $response->assertOk();

        // Verify CSV headers and content type
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename=laporan-penjualan-' . Carbon::now()->startOfMonth()->toDateString() . '-to-' . Carbon::now()->endOfMonth()->toDateString() . '.csv');

        // Capture output from streamed response
        ob_start();
        $response->sendContent();
        $content = ob_get_clean();

        // Check columns are present
        $this->assertStringContainsString('ID Transaksi', $content);
        $this->assertStringContainsString('Waktu Transaksi', $content);
        $this->assertStringContainsString('Nama Pelanggan', $content);
        $this->assertStringContainsString('Tipe Transaksi', $content);
        $this->assertStringContainsString('Pelanggan Ekspor', $content);
        $this->assertStringContainsString('COMPLETED', $content);
    }
}
