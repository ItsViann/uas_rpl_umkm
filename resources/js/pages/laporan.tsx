import { Head, router } from '@inertiajs/react';
import { Download, Calendar, DollarSign, ShoppingBag, BarChart3, TrendingUp } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface Metrics {
    revenue: number;
    cost: number;
    profit: number;
    transactions: number;
}

interface CategorySale {
    category_name: string;
    total_sales: number;
    total_qty: number;
}

interface LaporanProps {
    startDate: string;
    endDate: string;
    metrics: Metrics;
    categorySales: CategorySale[];
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function LaporanList({ startDate, endDate, metrics, categorySales }: LaporanProps) {
    const [startDateInput, setStartDateInput] = React.useState(startDate);
    const [endDateInput, setEndDateInput] = React.useState(endDate);

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/laporan',
            { start_date: startDateInput, end_date: endDateInput },
            { preserveState: true },
        );
    };

    const handleExport = () => {
        window.location.href = `/laporan/export?start_date=${startDateInput}&end_date=${endDateInput}`;
    };

    return (
        <>
            <Head title="Laporan Keuangan" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Header section */}
                <div className="flex flex-col gap-4 border-b border-sidebar-border/70 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight font-sans">Laporan Keuangan</h1>
                        <p className="text-sm text-muted-foreground">
                            Analisis laba bersih, HPP, omzet, dan ekspor CSV pembukuan toko
                        </p>
                    </div>

                    <form onSubmit={handleFilterSubmit} className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-md border border-sidebar-border bg-card p-1">
                            <Input
                                type="date"
                                className="h-8 border-none bg-transparent text-xs w-36 focus-visible:ring-0"
                                value={startDateInput}
                                onChange={(e) => setStartDateInput(e.target.value)}
                                required
                            />
                            <span className="text-xs text-muted-foreground">s/d</span>
                            <Input
                                type="date"
                                className="h-8 border-none bg-transparent text-xs w-36 focus-visible:ring-0"
                                value={endDateInput}
                                onChange={(e) => setEndDateInput(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" size="sm" variant="outline" className="h-10 text-xs">
                            <Calendar className="mr-1 size-3.5" /> Filter
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleExport}
                            className="h-10 text-xs bg-emerald-500 text-white hover:bg-emerald-600 border-none font-bold"
                        >
                            <Download className="mr-1 size-3.5" /> Ekspor CSV
                        </Button>
                    </form>
                </div>

                {/* Metrics Summary cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border border-sidebar-border/50 bg-card overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-1 w-full bg-blue-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Pendapatan Kotor
                            </CardTitle>
                            <DollarSign className="size-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold tracking-tight">{formatRupiah(metrics.revenue)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Total omzet penjualan selesai</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-sidebar-border/50 bg-card overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-1 w-full bg-amber-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Modal HPP
                            </CardTitle>
                            <ShoppingBag className="size-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold tracking-tight text-amber-500">{formatRupiah(metrics.cost)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Harga Pokok Penjualan barang terlakoni</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-sidebar-border/50 bg-card overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-1 w-full bg-emerald-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Laba Bersih
                            </CardTitle>
                            <TrendingUp className="size-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold tracking-tight text-emerald-500">{formatRupiah(metrics.profit)}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Pendapatan bersih (omzet dikurangi HPP)</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-sidebar-border/50 bg-card overflow-hidden relative">
                        <div className="absolute top-0 left-0 h-1 w-full bg-purple-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Jumlah Transaksi
                            </CardTitle>
                            <BarChart3 className="size-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold tracking-tight">{metrics.transactions}</div>
                            <p className="text-[10px] text-muted-foreground mt-1">Jumlah struk belanja selesai</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Category breakdown list */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <Card className="lg:col-span-8 border border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border/50">
                            <CardTitle className="text-sm font-bold">Rincian Penjualan per Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                {categorySales.map((item, index) => (
                                    <div key={item.category_name} className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold">{item.category_name}</span>
                                            <span className="text-muted-foreground">
                                                {item.total_qty} Qty —{' '}
                                                <span className="font-bold text-foreground">
                                                    {formatRupiah(item.total_sales)}
                                                </span>
                                            </span>
                                        </div>
                                        {/* Simulating progress bar dynamically */}
                                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${
                                                    index === 0
                                                        ? 'bg-blue-500'
                                                        : index === 1
                                                        ? 'bg-emerald-500'
                                                        : index === 2
                                                        ? 'bg-purple-500'
                                                        : 'bg-amber-500'
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        100,
                                                        metrics.revenue > 0
                                                            ? (item.total_sales / metrics.revenue) * 100
                                                            : 0,
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {categorySales.length === 0 && (
                                    <div className="py-12 text-center text-xs text-muted-foreground">
                                        Tidak ada data penjualan per kategori dalam periode ini.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="lg:col-span-4 border border-sidebar-border bg-card">
                        <CardHeader className="border-b border-sidebar-border/50">
                            <CardTitle className="text-sm font-bold">Struktur Laporan Keuangan</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 text-xs space-y-3">
                            <div className="rounded-lg bg-muted/30 border border-sidebar-border p-3 space-y-2.5">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Omzet Penjualan (+)</span>
                                    <span className="font-semibold text-blue-500">{formatRupiah(metrics.revenue)}</span>
                                </div>
                                <div className="flex justify-between border-b border-sidebar-border/50 pb-2">
                                    <span className="text-muted-foreground">Harga Pokok (HPP) (-)</span>
                                    <span className="font-semibold text-amber-500">{formatRupiah(metrics.cost)}</span>
                                </div>
                                <div className="flex justify-between pt-1 font-bold text-sm">
                                    <span>Laba Bersih (=)</span>
                                    <span className="text-emerald-500">{formatRupiah(metrics.profit)}</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                * Data keuangan dihitung otomatis berdasarkan data penjualan yang telah diselesaikan (*completed*) dalam rentang tanggal filter terpilih.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

LaporanList.layout = {
    breadcrumbs: [
        {
            title: 'Laporan',
            href: '/laporan',
        },
    ],
};
