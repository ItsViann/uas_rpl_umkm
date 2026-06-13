<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $customer_name
 * @property string|null $customer_whatsapp
 * @property float $total_price
 * @property float $total_paid
 * @property float $change_amount
 * @property string $status
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class Order extends Model
{
    protected $fillable = [
        'user_id',
        'customer_name',
        'customer_whatsapp',
        'total_price',
        'total_paid',
        'change_amount',
        'status',
    ];

    protected $casts = [
        'total_price' => 'decimal:2',
        'total_paid' => 'decimal:2',
        'change_amount' => 'decimal:2',
    ];

    /**
     * Get the user (cashier) that processed the order.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the order.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
