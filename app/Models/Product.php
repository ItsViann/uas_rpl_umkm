<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $category_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property float $price_buy
 * @property float $price_sell
 * @property int $stock_current
 * @property int $stock_min
 * @property string|null $image_path
 * @property-read Category $category
 */
class Product extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price_buy',
        'price_sell',
        'stock_current',
        'stock_min',
        'image_path',
    ];

    protected $casts = [
        'price_buy' => 'decimal:2',
        'price_sell' => 'decimal:2',
        'stock_current' => 'integer',
        'stock_min' => 'integer',
    ];

    /**
     * Get the category that owns the product.
     *
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the order items for the product.
     *
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the stock logs for the product.
     *
     * @return HasMany<StockLog, $this>
     */
    public function stockLogs(): HasMany
    {
        return $this->hasMany(StockLog::class);
    }
}
