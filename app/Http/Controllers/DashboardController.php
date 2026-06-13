<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the owner dashboard with sales metrics.
     */
    public function index(Request $request): \Inertia\Response|\Illuminate\Http\RedirectResponse
    {
        if (auth()->user()?->role === 'kasir') {
            return redirect()->route('pos');
        }

        if (! auth()->user() || auth()->user()->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang diperbolehkan.');
        }

        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        // 1. Total Sales Today (Omzet Hari Ini)
        $totalSalesToday = Order::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->sum('total_price');

        // 2. Transaction Count Today
        $transactionCountToday = Order::where('status', 'completed')
            ->whereDate('created_at', $today)
            ->count();

        // 3. Net Profit This Month (Laba Bersih Bulan Ini)
        $netProfitThisMonth = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startOfMonth, $endOfMonth])
            ->select(DB::raw('SUM(order_items.quantity * (order_items.price_at_sale - order_items.price_buy_at_sale)) as net_profit'))
            ->value('net_profit') ?? 0.00;

        // 4. Low Stock Alerts Count
        $lowStockAlertsCount = Product::whereRaw('stock_current <= stock_min')->count();

        // 5. Top Products (Barang Terlaris)
        $topProducts = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->where('orders.status', 'completed')
            ->select('products.id as product_id', 'products.name', DB::raw('SUM(order_items.quantity) as total_sold'))
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_sold')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'summary' => [
                'total_sales_today' => (float) $totalSalesToday,
                'transaction_count_today' => (int) $transactionCountToday,
                'net_profit_this_month' => (float) $netProfitThisMonth,
                'low_stock_alerts_count' => (int) $lowStockAlertsCount,
            ],
            'top_products' => $topProducts,
        ]);
    }
}
