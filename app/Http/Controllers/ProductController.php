<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display the public catalog (welcome page).
     */
    public function index(Request $request): Response
    {
        $query = Product::with('category');

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && ! empty($request->category)) {
            $categorySlug = $request->category;
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        $products = $query->get()->map(function (Product $product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price_buy' => (float) $product->price_buy,
                'price_sell' => (float) $product->price_sell,
                'stock_current' => $product->stock_current,
                'stock_min' => $product->stock_min,
                'image_url' => $product->image_path ? Storage::url($product->image_path) : null,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ],
            ];
        });

        $categories = Category::all();

        return Inertia::render('welcome', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['search', 'category']),
        ]);
    }

    /**
     * Display the product management page (for Owner).
     */
    public function manage(Request $request): Response
    {
        if (! auth()->user() || auth()->user()->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang diperbolehkan.');
        }

        $products = Product::with('category')->latest()->get()->map(function (Product $product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'description' => $product->description,
                'price_buy' => (float) $product->price_buy,
                'price_sell' => (float) $product->price_sell,
                'stock_current' => $product->stock_current,
                'stock_min' => $product->stock_min,
                'image_url' => $product->image_path ? Storage::url($product->image_path) : null,
                'category' => [
                    'id' => $product->category->id,
                    'name' => $product->category->name,
                ],
            ];
        });

        $categories = Category::all();

        return Inertia::render('inventaris', [
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! auth()->user() || auth()->user()->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang diperbolehkan.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price_buy' => 'required|numeric|min:0',
            'price_sell' => 'required|numeric|min:0',
            'stock_current' => 'required|integer|min:0',
            'stock_min' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $product = Product::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name).'-'.time(),
            'category_id' => $request->category_id,
            'price_buy' => $request->price_buy,
            'price_sell' => $request->price_sell,
            'stock_current' => $request->stock_current,
            'stock_min' => $request->stock_min,
            'description' => $request->description,
            'image_path' => $imagePath,
        ]);

        if ($product->stock_current > 0) {
            StockLog::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => 'in',
                'quantity' => $product->stock_current,
                'note' => 'Inisialisasi stok awal',
            ]);
        }

        return redirect()->back()->with('success', 'Produk berhasil ditambahkan.');
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        if (! auth()->user() || auth()->user()->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang diperbolehkan.');
        }

        $product = Product::find($id);
        if (! $product instanceof Product) {
            abort(404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price_buy' => 'required|numeric|min:0',
            'price_sell' => 'required|numeric|min:0',
            'stock_current' => 'required|integer|min:0',
            'stock_min' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|max:2048',
        ]);

        $imagePath = $product->image_path;
        if ($request->hasFile('image')) {
            if ($imagePath && Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('products', 'public');
        }

        $oldStock = $product->stock_current;
        $newStock = (int) $request->stock_current;

        $product->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name).'-'.time(),
            'category_id' => $request->category_id,
            'price_buy' => $request->price_buy,
            'price_sell' => $request->price_sell,
            'stock_current' => $newStock,
            'stock_min' => $request->stock_min,
            'description' => $request->description,
            'image_path' => $imagePath,
        ]);

        if ($newStock !== $oldStock) {
            $diff = $newStock - $oldStock;
            StockLog::create([
                'product_id' => $product->id,
                'user_id' => auth()->id(),
                'type' => $diff > 0 ? 'in' : 'out',
                'quantity' => abs($diff),
                'note' => 'Penyesuaian stok via Edit Produk',
            ]);
        }

        return redirect()->back()->with('success', 'Produk berhasil diperbarui.');
    }

    /**
     * Remove the specified product.
     */
    public function destroy(int $id): RedirectResponse
    {
        if (! auth()->user() || auth()->user()->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang diperbolehkan.');
        }

        $product = Product::find($id);
        if (! $product instanceof Product) {
            abort(404);
        }

        if ($product->image_path && Storage::disk('public')->exists($product->image_path)) {
            Storage::disk('public')->delete($product->image_path);
        }

        $product->delete();

        return redirect()->back()->with('success', 'Produk berhasil dihapus.');
    }
}
