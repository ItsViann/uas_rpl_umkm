import { Head, usePage, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Printer, Check, Ban } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price_at_sale: number;
    price_buy_at_sale: number;
    subtotal: number;
}

interface Order {
    id: number;
    customer_name: string;
    customer_whatsapp: string | null;
    cashier_name: string;
    total_price: number;
    total_paid: number;
    change_amount: number;
    status: 'pending' | 'completed' | 'cancelled';
    created_at: string;
    items: OrderItem[];
}

interface PenjualanProps {
    orders: Order[];
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function PenjualanList({ orders }: PenjualanProps) {
    const { auth, store } = usePage().props as any;
    const role = auth.user?.role;

    const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
    const [printingOrder, setPrintingOrder] = React.useState<Order | null>(null);
    const [completingOrder, setCompletingOrder] = React.useState<Order | null>(null);
    const [cancellingOrder, setCancellingOrder] = React.useState<Order | null>(null);

    const [cashPaidInput, setCashPaidInput] = React.useState('');

    const handleCompleteSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!completingOrder) {
return;
}

        const paid = parseFloat(cashPaidInput);

        if (isNaN(paid) || paid < completingOrder.total_price) {
            toast.error('Jumlah uang pembayaran kurang atau tidak valid');

            return;
        }

        router.post(`/penjualan/${completingOrder.id}/complete`, { total_paid: paid }, {
            onSuccess: () => {
                setCompletingOrder(null);
                setCashPaidInput('');
                toast.success('Pesanan online berhasil diselesaikan');
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError as string) || 'Gagal menyelesaikan pesanan');
            },
        });
    };

    const handleCancelSubmit = () => {
        if (!cancellingOrder) {
return;
}

        router.post(`/penjualan/${cancellingOrder.id}/cancel`, {}, {
            onSuccess: () => {
                setCancellingOrder(null);
                toast.success('Transaksi berhasil dibatalkan dan stok dikembalikan');
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError as string) || 'Gagal membatalkan transaksi');
            },
        });
    };

    // Calculate profit for an order (only for Owner)
    const calculateOrderProfit = (order: Order) => {
        return order.items.reduce((sum, item) => {
            const cost = item.price_buy_at_sale * item.quantity;
            const revenue = item.price_at_sale * item.quantity;

            return sum + (revenue - cost);
        }, 0);
    };

    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => <span className="font-bold">#{row.getValue('id')}</span>,
        },
        {
            accessorKey: 'customer_name',
            header: 'Pelanggan',
            cell: ({ row }) => <span className="font-semibold">{row.getValue('customer_name')}</span>,
        },
        {
            accessorKey: 'customer_whatsapp',
            header: 'Tipe Transaksi',
            cell: ({ row }) => {
                const wa = row.getValue('customer_whatsapp') as string | null;

                return wa ? (
                    <Badge variant="outline" className="text-sky-500 border-sky-500/30 bg-sky-500/5 font-semibold text-[10px]">
                        Online (WhatsApp)
                    </Badge>
                ) : (
                    <Badge variant="outline" className="text-amber-500 border-amber-500/30 bg-amber-500/5 font-semibold text-[10px]">
                        POS Kasir (Offline)
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'total_price',
            header: 'Total Belanja',
            cell: ({ row }) => <span>{formatRupiah(row.getValue('total_price'))}</span>,
        },
        {
            accessorKey: 'cashier_name',
            header: 'Kasir',
            cell: ({ row }) => <span>{row.getValue('cashier_name')}</span>,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as 'pending' | 'completed' | 'cancelled';

                if (status === 'completed') {
                    return <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none font-bold text-white">Selesai</Badge>;
                }

                if (status === 'pending') {
                    return <Badge className="bg-amber-500 hover:bg-amber-600 border-none font-bold text-white animate-pulse">Pending</Badge>;
                }

                return <Badge variant="destructive" className="font-bold">Dibatalkan</Badge>;
            },
        },
        {
            accessorKey: 'created_at',
            header: 'Waktu Transaksi',
            cell: ({ row }) => {
                const val = row.getValue('created_at') as string;

                return <span>{new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const order = row.original;

                return (
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSelectedOrder(order)}
                            title="Detail Belanja"
                            className="size-8"
                        >
                            <Eye className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setPrintingOrder(order)}
                            title="Cetak Struk"
                            className="size-8"
                        >
                            <Printer className="size-4" />
                        </Button>
                        {order.status === 'pending' && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                    setCompletingOrder(order);
                                    setCashPaidInput('');
                                }}
                                title="Selesaikan Pesanan"
                                className="size-8 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10"
                            >
                                <Check className="size-4" />
                            </Button>
                        )}
                        {order.status !== 'cancelled' && (
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setCancellingOrder(order)}
                                title="Batalkan Transaksi"
                                className="size-8 text-destructive border-destructive/20 hover:bg-destructive/10"
                            >
                                <Ban className="size-4" />
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Riwayat Penjualan" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-sidebar-border/70 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Riwayat Penjualan</h1>
                        <p className="text-sm text-muted-foreground">
                            Lihat, batalkan, selesaikan, dan cetak ulang riwayat struk penjualan toko
                        </p>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={orders}
                    searchKey="customer_name"
                    searchPlaceholder="Cari nama pelanggan..."
                />

                {/* Detail Modal */}
                <Dialog
                    open={selectedOrder !== null}
                    onOpenChange={(open) => !open && setSelectedOrder(null)}
                >
                    <DialogContent className="max-w-md bg-card">
                        <DialogHeader>
                            <DialogTitle>Detail Penjualan #{selectedOrder?.id}</DialogTitle>
                            <DialogDescription>
                                Rincian lengkap item belanja untuk transaksi ini.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedOrder && (
                            <div className="space-y-4 py-2 text-sm">
                                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/30 p-3 text-xs border border-sidebar-border/50">
                                    <div>
                                        <span className="block text-muted-foreground">Pelanggan:</span>
                                        <span className="font-semibold">{selectedOrder.customer_name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground">Status:</span>
                                        <span className="font-semibold capitalize">{selectedOrder.status}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground">Waktu:</span>
                                        <span>{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</span>
                                    </div>
                                    <div>
                                        <span className="block text-muted-foreground">Kasir:</span>
                                        <span>{selectedOrder.cashier_name}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-semibold text-xs border-b border-sidebar-border pb-1">Daftar Barang</h4>
                                    <div className="space-y-1 text-xs">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between border-b border-sidebar-border/30 py-1.5">
                                                <div>
                                                    <span className="font-medium block">{item.product_name}</span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatRupiah(item.price_at_sale)} x {item.quantity}
                                                    </span>
                                                </div>
                                                <span className="font-bold self-center">{formatRupiah(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5 border-t border-sidebar-border pt-3 text-xs">
                                    <div className="flex justify-between">
                                        <span>Total Belanja:</span>
                                        <span className="font-bold">{formatRupiah(selectedOrder.total_price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Jumlah Uang Tunai:</span>
                                        <span>{formatRupiah(selectedOrder.total_paid)}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold">
                                        <span>Kembalian:</span>
                                        <span className="text-emerald-500">{formatRupiah(selectedOrder.change_amount)}</span>
                                    </div>
                                    {role === 'owner' && (
                                        <div className="flex justify-between rounded bg-emerald-500/10 border border-emerald-500/20 p-2 font-bold text-emerald-500 mt-2 text-xs">
                                            <span>Keuntungan Bersih (Profit):</span>
                                            <span>{formatRupiah(calculateOrderProfit(selectedOrder))}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setSelectedOrder(null)}>Tutup</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Struk Reprint Modal */}
                <Dialog
                    open={printingOrder !== null}
                    onOpenChange={(open) => !open && setPrintingOrder(null)}
                >
                    <DialogContent className="max-w-xs rounded-lg border border-neutral-300 bg-white p-6 font-mono text-black shadow-xl select-none">
                        {printingOrder && (
                            <>
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
                                        <span className="font-bold">#{printingOrder.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Kasir:</span>
                                        <span>{printingOrder.cashier_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Pelanggan:</span>
                                        <span>{printingOrder.customer_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="font-bold uppercase">{printingOrder.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Waktu:</span>
                                        <span className="text-[10px]">
                                            {new Date(printingOrder.created_at).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>

                                <div className="border-b border-dashed border-neutral-400 py-4 text-xs">
                                    <span className="mb-1.5 block font-bold">Rincian Belanja:</span>
                                    <div className="space-y-2">
                                        {printingOrder.items.map((item) => (
                                            <div key={item.id} className="flex justify-between leading-tight">
                                                <div className="pr-2 min-w-0 flex-1">
                                                    <span>{item.product_name}</span>
                                                    <span className="block text-[10px] text-neutral-500">
                                                        {formatRupiah(item.price_at_sale)} x {item.quantity}
                                                    </span>
                                                </div>
                                                <span className="font-bold">{formatRupiah(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 flex justify-between border-t border-dashed border-neutral-300 pt-2 text-sm font-bold">
                                        <span>TOTAL</span>
                                        <span>{formatRupiah(printingOrder.total_price)}</span>
                                    </div>
                                    {printingOrder.status === 'completed' && (
                                        <>
                                            <div className="mt-1 flex justify-between text-[11px]">
                                                <span>BAYAR TUNAI</span>
                                                <span>{formatRupiah(printingOrder.total_paid)}</span>
                                            </div>
                                            <div className="mt-0.5 flex justify-between text-[11px] font-bold">
                                                <span>KEMBALIAN</span>
                                                <span>{formatRupiah(printingOrder.change_amount)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="pt-4 text-center">
                                    <p className="text-[11px] font-bold">TERIMA KASIH</p>
                                    <p className="mt-1 text-[9px] text-neutral-500 leading-tight">
                                        {store?.receipt_footer || 'Struk belanja sah sebagai bukti transaksi digital'}
                                    </p>
                                </div>
                            </>
                        )}
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
                                onClick={() => setPrintingOrder(null)}
                                className="flex items-center justify-center rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 active:bg-neutral-950 transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Selesaikan Order Pending Modal */}
                <Dialog
                    open={completingOrder !== null}
                    onOpenChange={(open) => !open && setCompletingOrder(null)}
                >
                    <DialogContent className="max-w-sm bg-card">
                        <form onSubmit={handleCompleteSubmit}>
                            <DialogHeader>
                                <DialogTitle>Selesaikan Transaksi Online</DialogTitle>
                                <DialogDescription>
                                    Konfirmasi pembayaran cash di toko untuk pesanan online dari{' '}
                                    <span className="font-bold text-foreground">
                                        {completingOrder?.customer_name}
                                    </span>
                                    .
                                </DialogDescription>
                            </DialogHeader>
                            {completingOrder && (
                                <div className="grid gap-4 py-4">
                                    <div className="flex justify-between text-sm rounded bg-muted/40 p-2.5">
                                        <span>Total Belanja:</span>
                                        <span className="font-bold text-primary">
                                            {formatRupiah(completingOrder.total_price)}
                                        </span>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cash_paid">Jumlah Uang Pembayaran (Tunai)</Label>
                                        <Input
                                            id="cash_paid"
                                            type="number"
                                            min="0"
                                            value={cashPaidInput}
                                            onChange={(e) => setCashPaidInput(e.target.value)}
                                            required
                                            placeholder="Minimal pembayaran"
                                        />
                                        {cashPaidInput && (
                                            <div className="flex justify-between text-xs font-semibold mt-1">
                                                <span>Uang Kembalian:</span>
                                                <span className={
                                                    (parseFloat(cashPaidInput) - completingOrder.total_price) < 0
                                                        ? 'text-destructive font-bold'
                                                        : 'text-emerald-500 font-bold'
                                                }>
                                                    {(parseFloat(cashPaidInput) - completingOrder.total_price) < 0
                                                        ? 'Uang kurang!'
                                                        : formatRupiah(parseFloat(cashPaidInput) - completingOrder.total_price)
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCompletingOrder(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={
                                        !cashPaidInput ||
                                        (parseFloat(cashPaidInput) - (completingOrder?.total_price || 0)) < 0
                                    }
                                >
                                    Konfirmasi Bayar
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Cancel Transaction Modal */}
                <Dialog
                    open={cancellingOrder !== null}
                    onOpenChange={(open) => !open && setCancellingOrder(null)}
                >
                    <DialogContent className="max-w-md bg-card">
                        <DialogHeader>
                            <DialogTitle className="text-destructive">Batalkan Transaksi</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin membatalkan transaksi #{cancellingOrder?.id} untuk pelanggan{' '}
                                <span className="font-bold text-foreground">
                                    {cancellingOrder?.customer_name}
                                </span>
                                ?
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 text-xs text-muted-foreground space-y-1">
                            <p>Tindakan ini akan:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                <li>Mengubah status transaksi menjadi <span className="text-destructive font-semibold uppercase">Cancelled</span>.</li>
                                <li>Mengembalikan persediaan produk (*stock current*) sebanyak kuantitas yang dibeli ke data inventaris secara otomatis.</li>
                                <li>Mencatat pengembalian stok tersebut ke audit log mutasi barang.</li>
                            </ul>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCancellingOrder(null)}>Batal</Button>
                            <Button variant="destructive" onClick={handleCancelSubmit}>Batalkan Transaksi</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

PenjualanList.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Penjualan',
            href: '/penjualan',
        },
    ],
};
