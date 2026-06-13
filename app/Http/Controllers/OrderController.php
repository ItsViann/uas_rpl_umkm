<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * Display the POS Cashier interface.
     */
    public function pos(Request $request): Response
    {
        $products = Product::with('category')
            ->where('stock_current', '>', 0)
            ->get()
            ->map(function (Product $product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price_sell' => (float) $product->price_sell,
                    'stock_current' => $product->stock_current,
                    'category' => $product->category->name,
                ];
            });

        return Inertia::render('pos', [
            'products' => $products,
        ]);
    }

    /**
     * Process checkout transaction.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:150',
            'customer_whatsapp' => 'nullable|string|max:20',
            'total_paid' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $customerName = $request->input('customer_name', 'Pelanggan Toko');
        $customerWhatsapp = $request->input('customer_whatsapp');
        $totalPaid = $request->input('total_paid', 0.00);

        try {
            $order = DB::transaction(function () use ($customerName, $customerWhatsapp, $totalPaid, $request) {
                // 1. Create order header with initial zero amounts
                $order = Order::create([
                    'user_id' => auth()->id(), // null if guest/online customer checkout
                    'customer_name' => $customerName,
                    'customer_whatsapp' => $customerWhatsapp,
                    'total_price' => 0.00,
                    'total_paid' => $totalPaid,
                    'change_amount' => 0.00,
                    'status' => $customerWhatsapp ? 'pending' : 'completed',
                ]);

                $totalPrice = 0.00;

                // 2. Process items
                foreach ($request->items as $itemData) {
                    $product = Product::lockForUpdate()->find($itemData['product_id']);
                    if (! $product instanceof Product) {
                        throw new \Exception('Produk tidak ditemukan.');
                    }
                    $qty = (int) $itemData['quantity'];

                    // Validate stock availability
                    if ($product->stock_current < $qty) {
                        throw new \Exception("Stok tidak mencukupi! Sisa stok {$product->name} tinggal {$product->stock_current} unit.");
                    }

                    $subtotal = $qty * $product->price_sell;
                    $totalPrice += $subtotal;

                    // Create order item
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $product->id,
                        'quantity' => $qty,
                        'price_at_sale' => $product->price_sell,
                        'price_buy_at_sale' => $product->price_buy,
                        'subtotal' => $subtotal,
                    ]);

                    // Decrement stock
                    $product->stock_current -= $qty;
                    $product->save();

                    // Record stock log
                    StockLog::create([
                        'product_id' => $product->id,
                        'user_id' => auth()->id(),
                        'type' => 'out',
                        'quantity' => $qty,
                        'note' => $customerWhatsapp ? "Pesanan Online #{$order->id}" : "Penjualan POS #{$order->id}",
                    ]);
                }

                // 3. Calculate change for POS Cash
                $changeAmount = 0.00;
                if (! $customerWhatsapp) {
                    if ($totalPaid < $totalPrice) {
                        throw new \Exception('Uang Pembayaran Kurang! Total belanja: Rp'.number_format($totalPrice, 0, ',', '.').', dibayarkan: Rp'.number_format($totalPaid, 0, ',', '.'));
                    }
                    $changeAmount = $totalPaid - $totalPrice;
                }

                // 4. Update order totals
                $order->update([
                    'total_price' => $totalPrice,
                    'change_amount' => $changeAmount,
                ]);

                return $order;
            });

            // Redirect back and flash the order information for structural receipt display in React UI
            return redirect()->back()->with([
                'success' => 'Transaksi berhasil disimpan.',
                'order' => [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'total_price' => (float) $order->total_price,
                    'total_paid' => (float) $order->total_paid,
                    'change_amount' => (float) $order->change_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            return redirect()->back()->withErrors([
                'transaction' => $e->getMessage(),
            ]);
        }
    }
}
