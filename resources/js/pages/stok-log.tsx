import { Head } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

interface StockLog {
    id: number;
    product_name: string;
    user_name: string;
    type: 'in' | 'out';
    quantity: number;
    note: string | null;
    created_at: string;
}

interface StockLogProps {
    logs: StockLog[];
}

export default function StockLogList({ logs }: StockLogProps) {
    const columns: ColumnDef<StockLog>[] = [
        {
            accessorKey: 'created_at',
            header: 'Waktu Perubahan',
            cell: ({ row }) => {
                const val = row.getValue('created_at') as string;

                return <span>{new Date(val).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>;
            },
        },
        {
            accessorKey: 'product_name',
            header: 'Nama Produk',
            cell: ({ row }) => <span className="font-semibold">{row.getValue('product_name')}</span>,
        },
        {
            accessorKey: 'type',
            header: 'Jenis Mutasi',
            cell: ({ row }) => {
                const type = row.getValue('type') as 'in' | 'out';

                return type === 'in' ? (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none text-white font-bold">
                        Stok Masuk
                    </Badge>
                ) : (
                    <Badge variant="destructive" className="font-bold">
                        Stok Keluar
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'quantity',
            header: 'Jumlah',
            cell: ({ row }) => {
                const type = row.original.type;
                const qty = row.getValue('quantity') as number;

                return (
                    <span className={`font-bold ${type === 'in' ? 'text-emerald-500' : 'text-destructive'}`}>
                        {type === 'in' ? `+${qty}` : `-${qty}`}
                    </span>
                );
            },
        },
        {
            accessorKey: 'user_name',
            header: 'Operator / Sistem',
            cell: ({ row }) => <span>{row.getValue('user_name')}</span>,
        },
        {
            accessorKey: 'note',
            header: 'Catatan',
            cell: ({ row }) => <span className="text-muted-foreground text-xs">{row.getValue('note') || '-'}</span>,
        },
    ];

    return (
        <>
            <Head title="Riwayat Perubahan Stok" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-sidebar-border/70 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Riwayat Stok</h1>
                        <p className="text-sm text-muted-foreground">
                            Audit perubahan stok masuk dan keluar secara menyeluruh
                        </p>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={logs}
                    searchKey="product_name"
                    searchPlaceholder="Cari nama produk..."
                />
            </div>
        </>
    );
}

StockLogList.layout = {
    breadcrumbs: [
        {
            title: 'Riwayat Stok',
            href: '/stok-log',
        },
    ],
};
