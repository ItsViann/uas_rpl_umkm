import { Head, Link, usePage } from '@inertiajs/react';
import { ShoppingCart, Search, Plus, Minus, Trash2, ArrowRight, Check, Sparkles, MapPin, Store } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    price_sell: number;
    stock_current: number;
    category: {
        id: number;
        name: string;
    };
    image_url: string | null;
}

interface WelcomeProps {
    products: Product[];
    categories: Category[];
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

export default function Welcome({ products = [], categories = [] }: WelcomeProps) {
    const { auth, store } = usePage().props as any;
    const [searchQuery, setSearchQuery] = React.useState('');
    const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [customerName, setCustomerName] = React.useState('');
    const [customerNote, setCustomerNote] = React.useState('');
    const [isCartOpen, setIsCartOpen] = React.useState(false);

    // Filters products based on query and category
    const filteredProducts = products.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory =
            selectedCategory === 'all' || p.category.id.toString() === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        const existing = cart.find((item) => item.product.id === product.id);

        if (existing) {
            if (existing.quantity >= product.stock_current) {
                toast.error('Stok produk tidak mencukupi untuk ditambahkan lagi');

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

        toast.success(`${product.name} dimasukkan ke keranjang`);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(
            cart
                .map((item) => {
                    if (item.product.id === productId) {
                        const nextQty = item.quantity + delta;

                        if (nextQty > item.product.stock_current) {
                            toast.error('Jumlah melebihi stok yang tersedia');

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
        const item = cart.find((i) => i.product.id === productId);

        setCart(cart.filter((item) => item.product.id !== productId));

        if (item) {
            toast.info(`${item.product.name} dikeluarkan dari keranjang`);
        }
    };

    const totalCartPrice = cart.reduce((sum, item) => sum + item.product.price_sell * item.quantity, 0);
    const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const handleWhatsAppCheckout = (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            return;
        }

        const storeName = store?.store_name || 'UMKMku';
        const waNumber = store?.whatsapp_number || '628123456789';

        // Compile WhatsApp text template
        let messageText = `*PESANAN BARU - ${storeName}*\n`;
        messageText += `===============================\n`;
        messageText += `*Nama Pembeli:* ${customerName || 'Pelanggan Online'}\n`;

        if (customerNote) {
            messageText += `*Catatan:* ${customerNote}\n`;
        }

        messageText += `===============================\n`;
        messageText += `*Daftar Belanja:*\n`;

        cart.forEach((item, index) => {
            messageText += `${index + 1}. ${item.product.name} (x${item.quantity}) - ${formatRupiah(
                item.product.price_sell * item.quantity,
            )}\n`;
        });

        messageText += `===============================\n`;
        messageText += `*TOTAL TAGIHAN:* *${formatRupiah(totalCartPrice)}*\n\n`;
        messageText += `Mohon konfirmasi pesanan ini untuk proses pembayaran & penyiapan barang. Terima kasih!`;

        const encodedMessage = encodeURIComponent(messageText);
        const waUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;

        window.open(waUrl, '_blank');
        
        // Reset cart and fields
        setCart([]);
        setCustomerName('');
        setCustomerNote('');
        setIsCartOpen(false);
        toast.success('Selesai! Anda akan diarahkan ke WhatsApp.');
    };

    const storeName = store?.store_name || 'UMKMku';

    return (
        <>
            <Head title={`Katalog Online ${storeName}`} />
            
            <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-orange-500 selection:text-white">
                {/* Decorative background grid */}
                <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(249,115,22,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.06),transparent_50%)] pointer-events-none z-0" />
                
                {/* Navbar */}
                <header className="sticky top-0 z-45 border-b border-white/5 bg-neutral-950/80 backdrop-blur-md">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 shadow-lg shadow-orange-500/5">
                                <img
                                    src="https://img.icons8.com/fluency/96/shopping-cart.png"
                                    alt="Logo"
                                    className="size-6 object-contain"
                                />
                            </div>
                            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                                {storeName}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            {auth.user ? (
                                <Link
                                    href="/pos"
                                    className="text-xs font-medium text-neutral-400 hover:text-orange-400 transition-colors mr-1 flex items-center gap-1"
                                >
                                    <Store className="size-3.5" /> Masuk Kasir
                                </Link>
                            ) : (
                                <Link
                                    href="/login"
                                    className="text-xs font-medium text-neutral-400 hover:text-orange-400 transition-colors mr-1"
                                >
                                    Login Staf
                                </Link>
                            )}

                            {/* Shopping cart trigger */}
                            <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                                <SheetTrigger asChild>
                                    <button className="relative flex items-center gap-2 rounded-xl bg-orange-500 text-white font-bold text-xs h-10 px-4 hover:bg-orange-600 active:scale-95 transition-all shadow-md shadow-orange-500/10 cursor-pointer">
                                        <ShoppingCart className="size-4" />
                                        {totalCartItems > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-orange-600 shadow-md">
                                                {totalCartItems}
                                            </span>
                                        )}
                                        <span className="hidden sm:inline">Keranjang</span>
                                    </button>
                                </SheetTrigger>
                                <SheetContent className="flex h-full w-full flex-col justify-between p-6 bg-neutral-900 text-neutral-100 sm:max-w-md border-l border-white/5">
                                    <SheetHeader className="border-b border-white/5 pb-4">
                                        <SheetTitle className="flex items-center gap-2 text-lg font-bold text-neutral-100">
                                            <ShoppingCart className="size-5 text-orange-400" />
                                            Keranjang Belanja Anda
                                        </SheetTitle>
                                    </SheetHeader>

                                    {/* Cart list */}
                                    <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                                        {cart.map((item) => (
                                            <div
                                                key={item.product.id}
                                                className="flex items-center justify-between border-b border-white/5 pb-4"
                                            >
                                                <div className="min-w-0 flex-1 pr-3">
                                                    <h4 className="truncate text-sm font-semibold text-neutral-100">
                                                        {item.product.name}
                                                    </h4>
                                                    <span className="text-xs text-neutral-400 font-medium mt-0.5 block">
                                                        {formatRupiah(item.product.price_sell)} x {item.quantity}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center rounded-lg border border-white/5 bg-neutral-950 overflow-hidden">
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, -1)}
                                                            className="size-8 hover:bg-white/5 text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
                                                        >
                                                            <Minus className="size-3" />
                                                        </button>
                                                        <span className="px-2.5 text-xs font-bold text-neutral-200">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.product.id, 1)}
                                                            className="size-8 hover:bg-white/5 text-neutral-400 flex items-center justify-center transition-colors cursor-pointer"
                                                        >
                                                            <Plus className="size-3" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeFromCart(item.product.id)}
                                                        className="size-8 text-neutral-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg flex items-center justify-center transition-all cursor-pointer"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {cart.length === 0 && (
                                            <div className="flex h-full flex-col items-center justify-center py-24 text-neutral-500">
                                                <div className="size-16 rounded-full bg-neutral-950 flex items-center justify-center border border-white/5 mb-4 shadow-inner">
                                                    <ShoppingCart className="size-7 stroke-[1.5] text-neutral-600" />
                                                </div>
                                                <span className="text-sm font-medium">Keranjang belanja Anda kosong</span>
                                                <p className="text-xs text-neutral-600 mt-1 text-center max-w-[200px]">Pilih beberapa produk lezat dari katalog kami untuk memulai.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Customer Form */}
                                    {cart.length > 0 && (
                                        <form onSubmit={handleWhatsAppCheckout} className="border-t border-white/5 pt-4 space-y-4">
                                            <div className="space-y-1.5">
                                                <Label htmlFor="cust_name" className="text-xs font-bold text-neutral-300">
                                                    Nama Pemesan
                                                </Label>
                                                <Input
                                                    id="cust_name"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    required
                                                    placeholder="Masukkan nama lengkap"
                                                    className="h-10 text-xs bg-neutral-950 border-white/5 text-neutral-100 focus:border-orange-500/50"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label htmlFor="cust_note" className="text-xs font-bold text-neutral-300">
                                                    Catatan Pesanan (Alamat / Meja / Request)
                                                </Label>
                                                <Input
                                                    id="cust_note"
                                                    value={customerNote}
                                                    onChange={(e) => setCustomerNote(e.target.value)}
                                                    placeholder="Contoh: Meja 4 / Pedas sedang / Antar ke rumah"
                                                    className="h-10 text-xs bg-neutral-950 border-white/5 text-neutral-100 focus:border-orange-500/50"
                                                />
                                            </div>

                                            <div className="border-t border-white/5 pt-4">
                                                <div className="mb-4 flex justify-between items-baseline font-bold">
                                                    <span className="text-sm text-neutral-400">Total Tagihan:</span>
                                                    <span className="text-xl text-orange-400">
                                                        {formatRupiah(totalCartPrice)}
                                                    </span>
                                                </div>
                                                <button type="submit" className="w-full flex items-center justify-center gap-2 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 transition-all rounded-xl h-12 shadow-lg shadow-emerald-600/10 cursor-pointer">
                                                    Checkout ke WhatsApp <ArrowRight className="size-4" />
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </SheetContent>
                            </Sheet>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="relative overflow-hidden py-16 md:py-24 border-b border-white/5">
                    {/* Glowing blur shapes */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
                    
                    <div className="mx-auto max-w-4xl px-4 text-center md:px-6 relative z-10">
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3.5 py-1.5 text-xs text-orange-400 font-semibold mb-6 animate-pulse">
                            <Sparkles className="size-3.5 text-orange-400" /> Katalog Belanja Online & Instan
                        </div>
                        
                        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-b from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                            Selamat Datang di <br/>
                            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">{storeName}</span>
                        </h1>
                        
                        <p className="mx-auto mt-6 max-w-xl text-sm sm:text-base text-neutral-400 leading-relaxed">
                            Pesan makanan, snack, dan minuman favorit Anda langsung dari katalog digital kami. Pesanan Anda tersusun otomatis dan terkirim instan ke WhatsApp kami!
                        </p>

                        <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-neutral-400">
                            {store?.store_address && (
                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 border border-white/5 px-3 py-2">
                                    <MapPin className="size-3.5 text-orange-400" /> {store.store_address}
                                </div>
                            )}
                            {store?.store_phone && (
                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 border border-white/5 px-3 py-2">
                                    📞 Telp: {store.store_phone}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Catalog Area */}
                <main className="mx-auto w-full max-w-7xl px-4 py-12 md:px-6 relative z-10">
                    {/* Search and Category Filters */}
                    <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        {/* Categories List */}
                        <div className="flex flex-wrap items-center gap-2 order-2 sm:order-1">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`h-9 px-4 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                                    selectedCategory === 'all'
                                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
                                        : 'bg-neutral-900 border-white/5 hover:bg-neutral-800 text-neutral-300'
                                }`}
                            >
                                Semua Menu
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id.toString())}
                                    className={`h-9 px-4 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                                        selectedCategory === cat.id.toString()
                                            ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/10'
                                            : 'bg-neutral-900 border-white/5 hover:bg-neutral-800 text-neutral-300'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            )) }
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full sm:w-72 order-1 sm:order-2">
                            <Search className="absolute top-2.5 left-3.5 size-4 text-neutral-500" />
                            <Input
                                type="search"
                                placeholder="Cari menu lezat..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-neutral-900 border-white/5 pl-10 h-10 text-xs text-neutral-100 rounded-xl focus:border-orange-500/50"
                            />
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {filteredProducts.map((p) => {
                            const inCart = cart.find((item) => item.product.id === p.id);
                            const currentStock = p.stock_current - (inCart?.quantity || 0);

                            return (
                                <Card
                                    key={p.id}
                                    className="flex h-[300px] flex-col gap-0 overflow-hidden bg-neutral-900 border border-white/5 rounded-2xl hover:border-white/10 hover:shadow-xl hover:shadow-orange-500/[0.01] hover:scale-[1.02] transition-all duration-300 group"
                                >
                                    {/* Image block */}
                                    <div className="flex h-36 w-full items-center justify-center overflow-hidden border-b border-white/5 bg-neutral-950 relative">
                                        {p.image_url ? (
                                            <img
                                                src={p.image_url}
                                                alt={p.name}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 opacity-30">
                                                <Store className="size-6 text-neutral-400" />
                                                <span className="text-[9px] text-neutral-400 font-semibold tracking-wider uppercase">No Image</span>
                                            </div>
                                        )}
                                        {/* Category label badge */}
                                        <span className="absolute top-2.5 left-2.5 rounded-md bg-neutral-950/80 backdrop-blur-md border border-white/5 px-2 py-0.5 text-[9px] font-bold text-orange-400 uppercase tracking-wider">
                                            {p.category.name}
                                        </span>
                                    </div>

                                    {/* Product Meta */}
                                    <div className="flex flex-1 flex-col justify-between p-4 bg-neutral-900">
                                        <div>
                                            <h3 className="line-clamp-2 text-xs font-semibold text-neutral-100 group-hover:text-orange-400 transition-colors leading-snug">
                                                {p.name}
                                            </h3>
                                        </div>

                                        <div className="mt-auto space-y-3 pt-2">
                                            <div className="flex items-center justify-between items-baseline">
                                                <span className="text-sm font-bold text-neutral-100">
                                                    {formatRupiah(p.price_sell)}
                                                </span>
                                                <span className="text-[10px] text-neutral-500 font-semibold">
                                                    Stok: {currentStock}
                                                </span>
                                            </div>

                                            {currentStock > 0 ? (
                                                <button
                                                    onClick={() => addToCart(p)}
                                                    className="w-full flex items-center justify-center gap-1.5 h-9 text-xs font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 active:scale-95 transition-all cursor-pointer shadow-md shadow-orange-500/5"
                                                >
                                                    {inCart ? (
                                                        <>
                                                            <Check className="size-3.5" /> Ditambah ({inCart.quantity})
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="size-3.5" /> Tambah Pesanan
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full h-9 text-xs font-bold rounded-xl text-neutral-500 bg-neutral-950 border border-white/5 cursor-not-allowed opacity-60"
                                                >
                                                    Stok Habis
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-24 text-center text-sm text-neutral-500 border border-dashed border-white/5 rounded-2xl bg-neutral-900/30">
                                Tidak ada produk menu ditemukan dalam pencarian.
                            </div>
                        )}
                    </div>
                </main>
                
                {/* Footer */}
                <footer className="border-t border-white/5 bg-neutral-950/60 py-10 mt-16 text-center text-xs text-neutral-600 relative z-10">
                    <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
                    <p className="mt-1 text-[10px] text-neutral-700">Powered by UMKMku Checkout System</p>
                </footer>
            </div>
        </>
    );
}
