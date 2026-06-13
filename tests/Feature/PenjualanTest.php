<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PenjualanTest extends TestCase
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
            'name' => 'Makanan',
            'slug' => 'makanan',
        ]);

        $this->product = Product::create([
            'category_id' => $this->category->id,
            'name' => 'Kripik Singkong',
            'slug' => 'kripik-singkong',
            'price_buy' => 5000,
            'price_sell' => 8000,
            'stock_current' => 50,
            'stock_min' => 5,
        ]);
    }

    public function test_guests_cannot_view_sales_history()
    {
        $response = $this->get(route('penjualan'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_view_sales_history()
    {
        // Owner
        $this->actingAs($this->owner);
        $response = $this->get(route('penjualan'));
        $response->assertOk();

        // Cashier
        $this->actingAs($this->cashier);
        $response2 = $this->get(route('penjualan'));
        $response2->assertOk();
    }

    public function test_pos_checkout_reduces_stock_and_creates_log()
    {
        $this->actingAs($this->cashier);

        $response = $this->post(route('orders.store'), [
            'customer_name' => 'Budi POS',
            'total_paid' => 20000,
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 2,
                ]
            ]
        ]);

        $response->assertRedirect();
        
        // Product stock should reduce: 50 - 2 = 48
        $this->product->refresh();
        $this->assertEquals(48, $this->product->stock_current);

        // Order header should be created
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Budi POS',
            'total_price' => 16000, // 2 * 8000
            'total_paid' => 20000,
            'change_amount' => 4000,
            'status' => 'completed',
        ]);

        // Stock log should record output
        $this->assertDatabaseHas('stock_logs', [
            'product_id' => $this->product->id,
            'user_id' => $this->cashier->id,
            'type' => 'out',
            'quantity' => 2,
        ]);
    }

    public function test_online_order_checkout_keeps_status_pending()
    {
        // Public guest places online order
        $response = $this->post(route('orders.store'), [
            'customer_name' => 'Ani Online',
            'customer_whatsapp' => '0812345678',
            'items' => [
                [
                    'product_id' => $this->product->id,
                    'quantity' => 3,
                ]
            ]
        ]);

        $response->assertRedirect();

        // Product stock should reduce: 50 - 3 = 47
        $this->product->refresh();
        $this->assertEquals(47, $this->product->stock_current);

        // Order should be pending
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Ani Online',
            'customer_whatsapp' => '0812345678',
            'total_price' => 24000, // 3 * 8000
            'status' => 'pending',
        ]);
    }

    public function test_owner_or_cashier_can_complete_pending_online_order()
    {
        // Setup pending order
        $order = Order::create([
            'customer_name' => 'Siti Pending',
            'customer_whatsapp' => '08111222',
            'total_price' => 10000,
            'total_paid' => 0,
            'change_amount' => 0,
            'status' => 'pending',
        ]);

        $this->actingAs($this->cashier);

        $response = $this->post(route('penjualan.complete', $order->id), [
            'total_paid' => 15000,
        ]);

        $response->assertRedirect();
        
        $order->refresh();
        $this->assertEquals('completed', $order->status);
        $this->assertEquals(15000, $order->total_paid);
        $this->assertEquals(5000, $order->change_amount);
    }

    public function test_owner_or_cashier_can_cancel_order_restoring_stock()
    {
        $this->actingAs($this->cashier);

        // 1. Let's make an order first
        $order = Order::create([
            'user_id' => $this->cashier->id,
            'customer_name' => 'Cancel Target',
            'total_price' => 16000,
            'total_paid' => 20000,
            'change_amount' => 4000,
            'status' => 'completed',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $this->product->id,
            'quantity' => 2,
            'price_at_sale' => 8000,
            'price_buy_at_sale' => 5000,
            'subtotal' => 16000,
        ]);

        // Simulating the POS stock reduction (making it 48)
        $this->product->update(['stock_current' => 48]);

        // 2. Now let's cancel the order
        $response = $this->post(route('penjualan.cancel', $order->id));
        $response->assertRedirect();

        // 3. Status should change to cancelled
        $order->refresh();
        $this->assertEquals('cancelled', $order->status);

        // 4. Product stock should be restored to 50
        $this->product->refresh();
        $this->assertEquals(50, $this->product->stock_current);

        // 5. Audit log should record stock input
        $this->assertDatabaseHas('stock_logs', [
            'product_id' => $this->product->id,
            'user_id' => $this->cashier->id,
            'type' => 'in',
            'quantity' => 2,
            'note' => "Pembatalan Transaksi #{$order->id}",
        ]);
    }

    public function test_cashier_can_only_view_own_sales_history_and_pending_online_orders()
    {
        $cashierB = User::factory()->create(['role' => 'kasir']);

        // Order by current cashier (A)
        $orderA = Order::create([
            'user_id' => $this->cashier->id,
            'customer_name' => 'Order Cashier A',
            'total_price' => 10000,
            'total_paid' => 10000,
            'change_amount' => 0,
            'status' => 'completed',
        ]);

        // Order by cashier B
        $orderB = Order::create([
            'user_id' => $cashierB->id,
            'customer_name' => 'Order Cashier B',
            'total_price' => 10000,
            'total_paid' => 10000,
            'change_amount' => 0,
            'status' => 'completed',
        ]);

        // Pending online order (should be visible so cashier A can complete it)
        $orderPendingOnline = Order::create([
            'user_id' => null,
            'customer_name' => 'Pending Online',
            'customer_whatsapp' => '08998877',
            'total_price' => 10000,
            'total_paid' => 0,
            'change_amount' => 0,
            'status' => 'pending',
        ]);

        // Completed online order (should not be visible because it has no user_id and is already completed)
        $orderCompletedOnline = Order::create([
            'user_id' => null,
            'customer_name' => 'Completed Online',
            'customer_whatsapp' => '08998877',
            'total_price' => 10000,
            'total_paid' => 10000,
            'change_amount' => 0,
            'status' => 'completed',
        ]);

        $this->actingAs($this->cashier);

        $response = $this->get(route('penjualan'));
        $response->assertOk();

        // Cashier A should see: Order A, Pending Online
        // Cashier A should NOT see: Order B, Completed Online
        $response->assertInertia(fn ($page) => $page
            ->component('penjualan')
            ->has('orders', 2)
            ->where('orders.0.customer_name', 'Pending Online')
            ->where('orders.1.customer_name', 'Order Cashier A')
        );
    }
}
