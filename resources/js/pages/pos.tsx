import { Head, useForm, usePage, router } from '@inertiajs/react';
import {
    Search,
    ShoppingCart,
    Trash2,
    Plus,
    Minus,
    Printer,
    Check,
} from 'lucide-react';
import * as React from 'react';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { pos } from '@/routes';

interface Product {
    id: number;
    name: string;
    price_sell: number;
    stock_current: number;
    category: string;
    image_url: string | null;
}

interface POSProps {
    products: Product[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function POS({ products }: POSProps) {
    const { flash, store } = usePage().props as any;
    const [searchQuery, setSearchQuery] = React.useState('');
    const [cart, setCart] = React.useState<CartItem[]>([]);

    // Checkout states
    const [customerName, setCustomerName] = React.useState('Pelanggan Toko');
    const [customerWhatsapp, setCustomerWhatsapp] = React.useState('');
    const [totalPaid, setTotalPaid] = React.useState('');

    // Receipt modal states
    const [isReceiptOpen, setIsReceiptOpen] = React.useState(false);
    const [lastShownOrderId, setLastShownOrderId] = React.useState<
        number | null
    >(null);

    // Listen to flash.order for successful transactions to trigger receipt popup
    React.useEffect(() => {
        if (flash?.order && flash.order.id !== lastShownOrderId) {
            const timer = setTimeout(() => {
                setIsReceiptOpen(true);
                setLastShownOrderId(flash.order.id);
                setCart([]); // Clear cart upon successful transaction
                setCustomerName('Pelanggan Toko');
                setCustomerWhatsapp('');
                setTotalPaid('');
            }, 0);

            return () => clearTimeout(timer);
        }
    }, [flash?.order, lastShownOrderId]);

    const filteredProducts = products.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const addToCart = (product: Product) => {
        const existing = cart.find((item) => item.product.id === product.id);

        if (existing) {
            if (existing.quantity >= product.stock_current) {
                toast.error(
                    `Stok tidak mencukupi. Sisa stok ${product.name} adalah ${product.stock_current}`,
                );

                return;
            }

            setCart(
                cart.map((item) =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item,
                ),
            );
        } else {
            setCart([...cart, { product, quantity: 1 }]);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(
            cart
                .map((item) => {
                    if (item.product.id === productId) {
                        const nextQty = item.quantity + delta;

                        if (nextQty > item.product.stock_current) {
                            toast.error(
                                `Stok tidak mencukupi. Sisa stok ${item.product.name} adalah ${item.product.stock_current}`,
                            );

                            return item;
                        }

                        return { ...item, quantity: nextQty };
                    }

                    return item;
                })
                .filter((item) => item.quantity > 0),
        );
    };

    const removeFromCart = (productId: number) => {
        setCart(cart.filter((item) => item.product.id !== productId));
    };

    const totalCartPrice = cart.reduce(
        (sum, item) => sum + item.product.price_sell * item.quantity,
        0,
    );

    // Calculate change
    const changeAmount = totalPaid ? parseFloat(totalPaid) - totalCartPrice : 0;

    const { processing } = useForm();

    const handleCheckoutSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            toast.error('Keranjang belanja kosong');

            return;
        }

        // Validation for cash payments
        if (!customerWhatsapp) {
            const paid = parseFloat(totalPaid);

            if (isNaN(paid) || paid < totalCartPrice) {
                toast.error(
                    'Jumlah uang pembayaran tunai kurang atau tidak valid',
                );

                return;
            }
        }

        const payload = {
            customer_name: customerName,
            customer_whatsapp: customerWhatsapp || null,
            total_paid: customerWhatsapp ? 0 : parseFloat(totalPaid),
            items: cart.map((item) => ({
                product_id: item.product.id,
                quantity: item.quantity,
            })),
        };

        router.post('/orders', payload, {
            onSuccess: () => {
                toast.success('Transaksi berhasil!');
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0];
                toast.error(
                    (firstError as string) || 'Gagal memproses checkout',
                );
            },
        });
    };

    return (
        <>
            <Head title="POS Kasir" />
            <div className="grid h-auto grid-cols-1 gap-6 overflow-visible rounded-xl p-4 md:grid-cols-12 md:h-[calc(100vh-80px)] md:overflow-hidden">
                {/* Left Side: Product Catalog */}
                <div className="flex flex-col gap-4 md:col-span-7 lg:col-span-8 md:h-full md:overflow-hidden">
                    <div className="flex shrink-0 items-center justify-between gap-4 border-b border-sidebar-border/70 pb-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">
                                POS Kasir
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Catat transaksi penjualan kasir secara langsung
                            </p>
                        </div>
                        <div className="relative w-64">
                            <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Cari produk..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-background pl-8"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pr-1 sm:grid-cols-3 lg:grid-cols-4 max-h-[60vh] overflow-y-auto md:max-h-none md:flex-1 md:min-h-0 md:overflow-y-auto">
                        {filteredProducts.map((p) => {
                            const cartItem = cart.find(
                                (item) => item.product.id === p.id,
                            );
                            const remainingStock =
                                p.stock_current - (cartItem?.quantity || 0);

                            return (
                                <Card
                                    key={p.id}
                                    onClick={() =>
                                        remainingStock > 0 && addToCart(p)
                                    }
                                    className={`flex h-56 cursor-pointer flex-col gap-0 overflow-hidden bg-card p-0 py-0 transition-all hover:border-primary/50 ${
                                        remainingStock === 0
                                            ? 'cursor-not-allowed opacity-50'
                                            : ''
                                    }`}
                                >
                                    <div className="flex h-28 w-full shrink-0 items-center justify-center overflow-hidden border-b border-sidebar-border bg-muted">
                                        {p.image_url ? (
                                            <img
                                                src={p.image_url}
                                                alt={p.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground">
                                                No Image
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                                        <div>
                                            <span className="mb-0.5 block text-[9px] font-bold text-muted-foreground uppercase">
                                                {p.category}
                                            </span>
                                            <h3 className="line-clamp-2 text-xs leading-tight font-semibold text-foreground">
                                                {p.name}
                                            </h3>
                                        </div>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-xs font-bold text-primary">
                                                {formatRupiah(p.price_sell)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                Stok: {remainingStock}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                Tidak ada produk ditemukan.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Cart & Checkout Panel */}
                <div className="flex flex-col gap-4 md:col-span-5 lg:col-span-4 md:h-full md:overflow-hidden">
                    <Card className="flex flex-col border border-sidebar-border bg-card h-auto md:h-full">
                        <CardHeader className="flex shrink-0 flex-row items-center gap-2 border-b border-sidebar-border px-4 py-3">
                            <ShoppingCart className="size-5 text-primary" />
                            <CardTitle className="text-base font-bold">
                                Keranjang Belanja
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col justify-between gap-4 p-4 h-auto md:h-full md:flex-1 md:min-h-0 md:overflow-hidden">
                            {/* Cart Items List */}
                            <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[40vh] md:max-h-none">
                                {cart.map((item) => (
                                    <div
                                        key={item.product.id}
                                        className="flex items-center justify-between border-b border-sidebar-border/50 pb-2"
                                    >
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h4 className="truncate text-xs font-medium">
                                                {item.product.name}
                                            </h4>
                                            <span className="text-xs text-muted-foreground">
                                                {formatRupiah(
                                                    item.product.price_sell,
                                                )}{' '}
                                                x {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center rounded-md border border-sidebar-border">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.product.id,
                                                            -1,
                                                        )
                                                    }
                                                    className="size-7 rounded-none"
                                                >
                                                    <Minus className="size-3" />
                                                </Button>
                                                <span className="px-2 text-xs font-semibold">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.product.id,
                                                            1,
                                                        )
                                                    }
                                                    className="size-7 rounded-none"
                                                >
                                                    <Plus className="size-3" />
                                                </Button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeFromCart(
                                                        item.product.id,
                                                    )
                                                }
                                                className="size-7 text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                {cart.length === 0 && (
                                    <div className="flex h-full flex-col items-center justify-center py-12 text-muted-foreground">
                                        <ShoppingCart className="mb-2 size-8 stroke-[1.5] opacity-50" />
                                        <span className="text-xs">
                                            Keranjang masih kosong
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Checkout Form */}
                            <form
                                onSubmit={handleCheckoutSubmit}
                                className="shrink-0 space-y-4 border-t border-sidebar-border pt-4"
                            >
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="customer_name"
                                        className="text-xs font-semibold"
                                    >
                                        Nama Pelanggan
                                    </Label>
                                    <Input
                                        id="customer_name"
                                        value={customerName}
                                        onChange={(e) =>
                                            setCustomerName(e.target.value)
                                        }
                                        className="h-8 bg-background text-xs"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="customer_whatsapp"
                                        className="text-xs font-semibold"
                                    >
                                        WhatsApp (Opsional untuk Online Order)
                                    </Label>
                                    <Input
                                        id="customer_whatsapp"
                                        placeholder="Contoh: 08123456789"
                                        value={customerWhatsapp}
                                        onChange={(e) =>
                                            setCustomerWhatsapp(e.target.value)
                                        }
                                        className="h-8 bg-background text-xs"
                                    />
                                </div>

                                {!customerWhatsapp && (
                                    <div className="grid gap-2 rounded-lg border border-sidebar-border/50 bg-muted/40 p-3">
                                        <div className="mb-1 flex items-center justify-between">
                                            <Label
                                                htmlFor="total_paid"
                                                className="text-xs font-bold"
                                            >
                                                Uang Pembayaran (Cash)
                                            </Label>
                                            <span className="text-[10px] text-muted-foreground">
                                                Minimum:{' '}
                                                {formatRupiah(totalCartPrice)}
                                            </span>
                                        </div>
                                        <Input
                                            id="total_paid"
                                            type="number"
                                            min="0"
                                            value={totalPaid}
                                            onChange={(e) =>
                                                setTotalPaid(e.target.value)
                                            }
                                            className="h-8 bg-background text-xs"
                                            required={!customerWhatsapp}
                                        />
                                        {totalPaid && (
                                            <div className="mt-2 flex justify-between text-xs font-medium">
                                                <span>Kembalian:</span>
                                                <span
                                                    className={
                                                        changeAmount < 0
                                                            ? 'font-bold text-destructive'
                                                            : 'font-bold text-emerald-500'
                                                    }
                                                >
                                                    {changeAmount < 0
                                                        ? 'Uang kurang!'
                                                        : formatRupiah(
                                                              changeAmount,
                                                           )}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="border-t border-sidebar-border/60 pt-3">
                                    <div className="mb-4 flex justify-between text-sm font-bold">
                                        <span>Total Belanja:</span>
                                        <span className="text-base text-primary">
                                            {formatRupiah(totalCartPrice)}
                                        </span>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="flex w-full items-center justify-center gap-2 font-bold"
                                        disabled={
                                            processing ||
                                            cart.length === 0 ||
                                            (!customerWhatsapp &&
                                                changeAmount < 0)
                                        }
                                    >
                                        <Check className="size-4" /> Proses
                                        Bayar
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Receipt Dialog Modal */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent className="max-w-xs rounded-lg border border-neutral-300 bg-white p-6 font-mono text-black shadow-xl select-none">
                    <div className="border-b border-dashed border-neutral-400 pb-4 text-center">
                        <h2 className="text-lg font-extrabold tracking-wider uppercase">
                            {store?.store_name || 'UMKMku'}
                        </h2>
                        {store?.store_address && (
                            <p className="mt-0.5 text-[10px] text-neutral-600">
                                {store.store_address}
                            </p>
                        )}
                        {store?.store_phone && (
                            <p className="text-[10px] text-neutral-600">
                                Telp: {store.store_phone}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1 border-b border-dashed border-neutral-400 py-3 text-xs">
                        <div className="flex justify-between">
                            <span>No. Trans:</span>
                            <span className="font-bold">
                                #{flash?.order?.id}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Kasir:</span>
                            <span>Owner / Staff</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Pelanggan:</span>
                            <span>{flash?.order?.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Status:</span>
                            <span className="font-bold uppercase">
                                {flash?.order?.status}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span>Waktu:</span>
                            <span className="text-[10px]">
                                {flash?.order?.created_at
                                    ? new Date(
                                          flash.order.created_at,
                                      ).toLocaleString('id-ID')
                                    : ''}
                            </span>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-neutral-400 py-4 text-xs">
                        <span className="mb-1 block font-bold">
                            Rincian Belanja:
                        </span>
                        <div className="mb-2 text-[10px] text-neutral-500 italic">
                            (Barang & jumlah tercatat di sistem backend)
                        </div>
                        <div className="mt-2 flex justify-between border-t border-dashed border-neutral-300 pt-2 text-sm font-bold">
                            <span>TOTAL</span>
                            <span>
                                {formatRupiah(flash?.order?.total_price || 0)}
                            </span>
                        </div>
                        {flash?.order?.status === 'completed' && (
                            <>
                                <div className="mt-1 flex justify-between text-[11px]">
                                    <span>BAYAR TUNAI</span>
                                    <span>
                                        {formatRupiah(
                                            flash?.order?.total_paid || 0,
                                        )}
                                    </span>
                                </div>
                                <div className="mt-0.5 flex justify-between text-[11px] font-bold">
                                    <span>KEMBALIAN</span>
                                    <span>
                                        {formatRupiah(
                                            flash?.order?.change_amount || 0,
                                        )}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="pt-4 text-center">
                        <p className="text-[11px] font-bold">TERIMA KASIH</p>
                        <p className="mt-1 text-[9px] text-neutral-500">
                            {store?.receipt_footer || 'Struk belanja sah sebagai bukti transaksi digital'}
                        </p>
                    </div>

                    <DialogFooter className="mt-4 gap-2 border-t border-neutral-200 pt-4 sm:justify-center">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50 active:bg-neutral-100 transition-colors cursor-pointer"
                        >
                            <Printer className="size-3.5 text-neutral-700" /> Cetak
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsReceiptOpen(false)}
                            className="flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 active:bg-neutral-950 transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

POS.layout = {
    breadcrumbs: [
        {
            title: 'POS Kasir',
            href: pos(),
        },
    ],
};
