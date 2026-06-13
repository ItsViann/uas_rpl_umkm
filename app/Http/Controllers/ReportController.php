<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    /**
     * Display the financial analysis dashboard.
     */
    public function index(Request $request): Response
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengakses laporan.');
        }

        // Default to current month if no dates selected
        $startDateStr = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDateStr = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $startDate = Carbon::parse($startDateStr)->startOfDay();
        $endDate = Carbon::parse($endDateStr)->endOfDay();

        // 1. Core financial metrics in date range
        $totalRevenue = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('total_price');

        $totalCost = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select(DB::raw('SUM(order_items.quantity * order_items.price_buy_at_sale) as total_cost'))
            ->value('total_cost') ?? 0.00;

        $netProfit = (float) $totalRevenue - (float) $totalCost;

        $transactionCount = Order::where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->count();

        // 2. Sales by Category (for charting)
        $categorySales = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$startDate, $endDate])
            ->select('categories.name as category_name', DB::raw('SUM(order_items.subtotal) as total_sales'), DB::raw('SUM(order_items.quantity) as total_qty'))
            ->groupBy('categories.name')
            ->get()
            ->map(function ($item) {
                return [
                    'category_name' => $item->category_name,
                    'total_sales' => (float) $item->total_sales,
                    'total_qty' => (int) $item->total_qty,
                ];
            });

        return Inertia::render('laporan', [
            'startDate' => $startDateStr,
            'endDate' => $endDateStr,
            'metrics' => [
                'revenue' => (float) $totalRevenue,
                'cost' => (float) $totalCost,
                'profit' => $netProfit,
                'transactions' => $transactionCount,
            ],
            'categorySales' => $categorySales,
        ]);
    }

    /**
     * Export completed transactions to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengekspor laporan.');
        }

        $startDateStr = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDateStr = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        $startDate = Carbon::parse($startDateStr)->startOfDay();
        $endDate = Carbon::parse($endDateStr)->endOfDay();

        $orders = Order::with('user')
            ->where('status', 'completed')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->orderBy('id', 'asc')
            ->get();

        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=laporan-penjualan-{$startDateStr}-to-{$endDateStr}.csv",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($orders) {
            $file = fopen('php://output', 'w');
            
            // Add UTF-8 BOM for proper excel loading
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));
            
            // Header row
            fputcsv($file, [
                'ID Transaksi', 
                'Waktu Transaksi', 
                'Nama Pelanggan', 
                'Tipe Transaksi', 
                'Uang Diterima (Paid)', 
                'Uang Kembalian (Change)', 
                'Total Belanja (Revenue)', 
                'Status'
            ]);

            foreach ($orders as $order) {
                fputcsv($file, [
                    '#' . $order->id,
                    $order->created_at->format('Y-m-d H:i:s'),
                    $order->customer_name,
                    $order->customer_whatsapp ? 'Online (WA)' : 'POS Kasir',
                    (float) $order->total_paid,
                    (float) $order->change_amount,
                    (float) $order->total_price,
                    strtoupper($order->status)
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
