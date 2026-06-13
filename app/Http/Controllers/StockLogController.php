<?php

namespace App\Http\Controllers;

use App\Models\StockLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StockLogController extends Controller
{
    /**
     * Display the stock history logs list.
     */
    public function index(Request $request): Response
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengakses log stok.');
        }

        $logs = StockLog::with(['product', 'user'])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (StockLog $log) {
                return [
                    'id' => $log->id,
                    'product_name' => $log->product->name ?? 'Produk Terhapus',
                    'user_name' => $log->user->name ?? 'Sistem / Pelanggan',
                    'type' => $log->type, // 'in' or 'out'
                    'quantity' => $log->quantity,
                    'note' => $log->note,
                    'created_at' => $log->created_at->toISOString(),
                ];
            });

        return Inertia::render('stok-log', [
            'logs' => $logs,
        ]);
    }
}
