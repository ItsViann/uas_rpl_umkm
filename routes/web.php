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
});

require __DIR__.'/settings.php';
