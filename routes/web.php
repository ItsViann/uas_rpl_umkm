<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

// Public catalog routes
Route::get('/', [ProductController::class, 'index'])->name('home');
Route::post('/orders', [OrderController::class, 'store'])->name('orders.store');

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Owner Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // POS cashier module
    Route::get('/pos', [OrderController::class, 'pos'])->name('pos');

    // Inventaris / Product management CRUD (Owner only checks are inside controller methods)
    Route::get('/inventaris', [ProductController::class, 'manage'])->name('inventaris');
    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{id}', [ProductController::class, 'update'])->name('products.update');
    Route::delete('/products/{id}', [ProductController::class, 'destroy'])->name('products.destroy');

    // Staff / Cashier management (Owner only checks are inside controller methods)
    Route::get('/staf', [\App\Http\Controllers\StaffController::class, 'index'])->name('staf.index');
    Route::post('/staf', [\App\Http\Controllers\StaffController::class, 'store'])->name('staf.store');
    Route::put('/staf/{id}', [\App\Http\Controllers\StaffController::class, 'update'])->name('staf.update');
    Route::delete('/staf/{id}', [\App\Http\Controllers\StaffController::class, 'destroy'])->name('staf.destroy');

    // Stock Mutation Audits (Owner only checks are inside controller methods)
    Route::get('/stok-log', [\App\Http\Controllers\StockLogController::class, 'index'])->name('stok-log');

    // Sales History / Riwayat Penjualan (Owner & Kasir)
    Route::get('/penjualan', [\App\Http\Controllers\OrderController::class, 'index'])->name('penjualan');
    Route::post('/penjualan/{id}/complete', [\App\Http\Controllers\OrderController::class, 'complete'])->name('penjualan.complete');
    Route::post('/penjualan/{id}/cancel', [\App\Http\Controllers\OrderController::class, 'cancel'])->name('penjualan.cancel');

    // Financial Reports & CSV Export (Owner only checks are inside controller)
    Route::get('/laporan', [\App\Http\Controllers\ReportController::class, 'index'])->name('laporan');
    Route::get('/laporan/export', [\App\Http\Controllers\ReportController::class, 'export'])->name('laporan.export');
});

require __DIR__.'/settings.php';
