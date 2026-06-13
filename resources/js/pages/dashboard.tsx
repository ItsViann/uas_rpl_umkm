import { Head, Link } from '@inertiajs/react';
import {
    TrendingUp,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    ArrowRight,
    Award,
    Package,
} from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { dashboard } from '@/routes';

interface DashboardProps {
    summary: {
        total_sales_today: number;
        transaction_count_today: number;
        net_profit_this_month: number;
        low_stock_alerts_count: number;
    };
    top_products: Array<{
        product_id: number;
        name: string;
        total_sold: number;
    }>;
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function Dashboard({ summary, top_products }: DashboardProps) {
    return (
        <>
            <Head title="Owner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="border-b border-sidebar-border/70 pb-4">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Dashboard Owner
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Monitor performa keuangan dan stok barang Toko RitelKM
                    </p>
                </div>

                {/* KPI Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Revenue today */}
                    <Card className="gap-0 border border-sidebar-border/70 bg-card p-0 py-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Omzet Hari Ini
                            </CardTitle>
                            <div className="rounded-full bg-primary/10 p-2 text-primary">
                                <TrendingUp className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-xl font-bold">
                                {formatRupiah(summary.total_sales_today)}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Total nilai penjualan bruto hari ini
                            </p>
                        </CardContent>
                    </Card>

                    {/* Transactions today */}
                    <Card className="gap-0 border border-sidebar-border/70 bg-card p-0 py-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Transaksi Hari Ini
                            </CardTitle>
                            <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                                <ShoppingCart className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-xl font-bold">
                                {summary.transaction_count_today} Transaksi
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Jumlah nota kasir yang diselesaikan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Profit this month */}
                    <Card className="gap-0 border border-sidebar-border/70 bg-card p-0 py-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Laba Bersih Bulan Ini
                            </CardTitle>
                            <div className="rounded-full bg-emerald-500/10 p-2 text-emerald-500">
                                <DollarSign className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="text-xl font-bold text-emerald-500">
                                {formatRupiah(summary.net_profit_this_month)}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Estimasi keuntungan bersih bulan berjalan
                            </p>
                        </CardContent>
                    </Card>

                    {/* Low stock warning */}
                    <Card className="gap-0 border border-sidebar-border/70 bg-card p-0 py-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pt-4 pb-2">
                            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                                Stok Menipis
                            </CardTitle>
                            <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                                <AlertTriangle className="size-4" />
                            </div>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="text-xl font-bold">
                                    {summary.low_stock_alerts_count} Barang
                                </div>
                                {summary.low_stock_alerts_count > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="px-1.5 py-0 text-[9px]"
                                    >
                                        Butuh Restok
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                                Produk dengan sisa stok di bawah batas minimal
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Details Section */}
                <div className="grid gap-6 md:grid-cols-12">
                    {/* Top Selling Products */}
                    <Card className="flex flex-col gap-0 border border-sidebar-border/70 bg-card p-0 py-0 md:col-span-8">
                        <CardHeader className="flex flex-row items-center gap-2 border-b border-sidebar-border/70 px-4 py-3">
                            <Award className="size-5 text-primary" />
                            <CardTitle className="text-base font-bold">
                                Produk Terlaris
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 p-4">
                            <div className="rounded-md border border-sidebar-border/60">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">
                                                No
                                            </TableHead>
                                            <TableHead>Nama Produk</TableHead>
                                            <TableHead className="text-right">
                                                Jumlah Terjual
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {top_products.map((p, idx) => (
                                            <TableRow key={p.product_id}>
                                                <TableCell className="font-semibold">
                                                    {idx + 1}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {p.name}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-primary">
                                                    {p.total_sold} unit
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {top_products.length === 0 && (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={3}
                                                    className="h-24 text-center text-muted-foreground"
                                                >
                                                    Belum ada data transaksi
                                                    penjualan.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions Panel */}
                    <Card className="flex flex-col justify-between gap-0 border border-sidebar-border/70 bg-card p-0 py-0 md:col-span-4">
                        <div>
                            <CardHeader className="flex flex-row items-center gap-2 border-b border-sidebar-border/70 px-4 py-3">
                                <Package className="size-5 text-primary" />
                                <CardTitle className="text-base font-bold">
                                    Aksi & Pintasan Cepat
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                <p className="text-xs text-muted-foreground">
                                    Pintasan praktis untuk mengakses modul kasir
                                    dan inventaris produk secara cepat.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="group h-9 w-full justify-between text-xs"
                                        asChild
                                    >
                                        <Link href="/pos">
                                            <span>Buka Aplikasi POS Kasir</span>
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="group h-9 w-full justify-between text-xs"
                                        asChild
                                    >
                                        <Link href="/inventaris">
                                            <span>
                                                Kelola Inventaris & Stok
                                            </span>
                                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
