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

use Illuminate\Support\Facades\Storage;

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
                    'image_url' => $product->image_path
                        ? (filter_var($product->image_path, FILTER_VALIDATE_URL) ? $product->image_path : Storage::url($product->image_path))
                        : null,
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

    /**
     * Display a listing of sales transactions (Riwayat Penjualan).
     */
    public function index(Request $request): Response
    {
        $query = Order::with(['user', 'items.product'])
            ->orderBy('id', 'desc');

        if (auth()->user()?->role === 'kasir') {
            $query->where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->orWhere(function ($sub) {
                      $sub->whereNull('user_id')
                          ->where('status', 'pending');
                  });
            });
        }

        $orders = $query->get()
            ->map(function (Order $order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'customer_whatsapp' => $order->customer_whatsapp,
                    'cashier_name' => $order->user->name ?? 'Online Customer',
                    'total_price' => (float) $order->total_price,
                    'total_paid' => (float) $order->total_paid,
                    'change_amount' => (float) $order->change_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                    'items' => $order->items->map(function (OrderItem $item) {
                        return [
                            'id' => $item->id,
                            'product_name' => $item->product->name ?? 'Produk Terhapus',
                            'quantity' => $item->quantity,
                            'price_at_sale' => (float) $item->price_at_sale,
                            'price_buy_at_sale' => (float) $item->price_buy_at_sale,
                            'subtotal' => (float) $item->subtotal,
                        ];
                    }),
                ];
            });

        return Inertia::render('penjualan', [
            'orders' => $orders,
        ]);
    }

    /**
     * Complete a pending online order.
     */
    public function complete(Request $request, int $id): RedirectResponse
    {
        $order = Order::findOrFail($id);

        if ($order->status !== 'pending') {
            return redirect()->back()->withErrors(['order' => 'Hanya pesanan pending yang dapat diselesaikan.']);
        }

        $request->validate([
            'total_paid' => 'required|numeric|min:'.$order->total_price,
        ]);

        $totalPaid = (float) $request->total_paid;
        $changeAmount = $totalPaid - (float) $order->total_price;

        $order->update([
            'user_id' => auth()->id(),
            'total_paid' => $totalPaid,
            'change_amount' => $changeAmount,
            'status' => 'completed',
        ]);

        return redirect()->back()->with('success', 'Pesanan online berhasil diselesaikan.');
    }

    /**
     * Cancel an order and restore stock levels.
     */
    public function cancel(int $id): RedirectResponse
    {
        $order = Order::findOrFail($id);

        if ($order->status === 'cancelled') {
            return redirect()->back()->withErrors(['order' => 'Transaksi sudah dibatalkan sebelumnya.']);
        }

        try {
            DB::transaction(function () use ($order) {
                // If the transaction was completed/pending (not already cancelled), restore the stock
                foreach ($order->items as $item) {
                    $product = Product::lockForUpdate()->find($item->product_id);
                    if ($product) {
                        $product->stock_current += $item->quantity;
                        $product->save();

                        // Log stock restoration
                        StockLog::create([
                            'product_id' => $product->id,
                            'user_id' => auth()->id(),
                            'type' => 'in',
                            'quantity' => $item->quantity,
                            'note' => "Pembatalan Transaksi #{$order->id}",
                        ]);
                    }
                }

                $order->update([
                    'status' => 'cancelled',
                ]);
            });

            return redirect()->back()->with('success', 'Transaksi berhasil dibatalkan dan stok dipulihkan.');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['order' => 'Gagal membatalkan transaksi: '.$e->getMessage()]);
        }
    }
}
