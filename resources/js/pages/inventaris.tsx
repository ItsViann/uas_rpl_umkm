import { Head, useForm, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, AlertTriangle, FileImage } from 'lucide-react';
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
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { inventaris } from '@/routes';

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    price_buy: number;
    price_sell: number;
    stock_current: number;
    stock_min: number;
    image_url: string | null;
    category: {
        id: number;
        name: string;
    };
}

interface InventarisProps {
    products: Product[];
    categories: Category[];
}

const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function Inventaris({ products, categories }: InventarisProps) {
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(
        null,
    );
    const [deletingProduct, setDeletingProduct] =
        React.useState<Product | null>(null);

    // Form handling for Add Product
    const addForm = useForm({
        name: '',
        category_id: '',
        price_buy: '',
        price_sell: '',
        stock_current: '',
        stock_min: '',
        description: '',
        image: null as File | null,
    });

    // Form handling for Edit Product
    const editForm = useForm({
        name: '',
        category_id: '',
        price_buy: '',
        price_sell: '',
        stock_current: '',
        stock_min: '',
        description: '',
        image: null as File | null,
        _method: 'PUT', // Since Laravel PHP cannot parse PUT multipart/form-data, we spoof it via POST with _method
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/products', {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
                toast.success('Produk berhasil ditambahkan');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(
                    (firstError as string) || 'Gagal menambahkan produk',
                );
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingProduct) {
            return;
        }

        // Since we are uploading a file (potentially), we submit via POST to /products/{id} with _method=PUT
        editForm.post(`/products/${editingProduct.id}`, {
            onSuccess: () => {
                setEditingProduct(null);
                editForm.reset();
                toast.success('Produk berhasil diperbarui');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(
                    (firstError as string) || 'Gagal memperbarui produk',
                );
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingProduct) {
            return;
        }

        router.delete(`/products/${deletingProduct.id}`, {
            onSuccess: () => {
                setDeletingProduct(null);
                toast.success('Produk berhasil dihapus');
            },
            onError: () => {
                toast.error('Gagal menghapus produk');
            },
        });
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        editForm.setData({
            name: product.name,
            category_id: product.category.id.toString(),
            price_buy: product.price_buy.toString(),
            price_sell: product.price_sell.toString(),
            stock_current: product.stock_current.toString(),
            stock_min: product.stock_min.toString(),
            description: product.description || '',
            image: null,
            _method: 'PUT',
        });
    };

    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: 'image_url',
            header: 'Gambar',
            cell: ({ row }) => {
                const url = row.getValue('image_url') as string | null;

                return (
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-md border border-sidebar-border bg-muted">
                        {url ? (
                            <img
                                src={url}
                                alt={row.getValue('name')}
                                className="size-full object-cover"
                            />
                        ) : (
                            <FileImage className="size-5 text-muted-foreground" />
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'name',
            header: 'Nama Produk',
            cell: ({ row }) => (
                <span className="font-medium">{row.getValue('name')}</span>
            ),
        },
        {
            id: 'category',
            header: 'Kategori',
            cell: ({ row }) => <span>{row.original.category.name}</span>,
        },
        {
            accessorKey: 'price_buy',
            header: 'Harga Beli',
            cell: ({ row }) => (
                <span>{formatRupiah(row.getValue('price_buy'))}</span>
            ),
        },
        {
            accessorKey: 'price_sell',
            header: 'Harga Jual',
            cell: ({ row }) => (
                <span>{formatRupiah(row.getValue('price_sell'))}</span>
            ),
        },
        {
            id: 'profit_margin',
            header: 'Margin',
            cell: ({ row }) => {
                const product = row.original;
                const margin = product.price_sell > 0
                    ? ((product.price_sell - product.price_buy) / product.price_sell) * 100
                    : 0;

                return (
                    <span className="font-semibold text-emerald-500">
                        {margin.toFixed(0)}%
                    </span>
                );
            },
        },
        {
            accessorKey: 'stock_current',
            header: 'Stok',
            cell: ({ row }) => {
                const stock = row.getValue('stock_current') as number;
                const minStock = row.original.stock_min;
                const isLow = stock <= minStock;

                return (
                    <div className="flex items-center gap-2">
                        <span
                            className={
                                isLow ? 'font-bold text-destructive' : ''
                            }
                        >
                            {stock}
                        </span>
                        {isLow && (
                            <Badge
                                variant="destructive"
                                className="flex items-center gap-1 px-1 py-0 text-[10px]"
                            >
                                <AlertTriangle className="size-3" /> Stok Tipis
                            </Badge>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const product = row.original;

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(product)}
                            className="size-8"
                        >
                            <Edit2 className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingProduct(product)}
                            className="size-8 text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Inventaris Produk" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-sidebar-border/70 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Inventaris
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola persediaan barang dagang Toko RitelKM
                        </p>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="size-4" /> Tambah Produk
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-card">
                            <form onSubmit={handleAddSubmit}>
                                <DialogHeader>
                                    <DialogTitle>
                                        Tambah Produk Baru
                                    </DialogTitle>
                                    <DialogDescription>
                                        Masukkan rincian produk baru di bawah
                                        ini. Tekan simpan jika sudah selesai.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Nama Produk
                                        </Label>
                                        <Input
                                            id="name"
                                            value={addForm.data.name}
                                            onChange={(e) =>
                                                addForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category_id">
                                            Kategori
                                        </Label>
                                        <Select
                                            value={addForm.data.category_id}
                                            onValueChange={(val) =>
                                                addForm.setData(
                                                    'category_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="category_id"
                                                className="bg-background"
                                            >
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                            <SelectContent className="border border-sidebar-border bg-card">
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat.id}
                                                        value={cat.id.toString()}
                                                    >
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="price_buy">
                                                Harga Beli
                                            </Label>
                                            <Input
                                                id="price_buy"
                                                type="number"
                                                min="0"
                                                value={addForm.data.price_buy}
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'price_buy',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="price_sell">
                                                Harga Jual
                                            </Label>
                                            <Input
                                                id="price_sell"
                                                type="number"
                                                min="0"
                                                value={addForm.data.price_sell}
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'price_sell',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="stock_current">
                                                Stok Saat Ini
                                            </Label>
                                            <Input
                                                id="stock_current"
                                                type="number"
                                                min="0"
                                                value={
                                                    addForm.data.stock_current
                                                }
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'stock_current',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="stock_min">
                                                Stok Minimum
                                            </Label>
                                            <Input
                                                id="stock_min"
                                                type="number"
                                                min="0"
                                                value={addForm.data.stock_min}
                                                onChange={(e) =>
                                                    addForm.setData(
                                                        'stock_min',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">
                                            Deskripsi (Opsional)
                                        </Label>
                                        <Input
                                            id="description"
                                            value={addForm.data.description}
                                            onChange={(e) =>
                                                addForm.setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="image">
                                            Gambar Produk
                                        </Label>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                addForm.setData(
                                                    'image',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsAddOpen(false)}
                                    >
                                        Batal
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={addForm.processing}
                                    >
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <DataTable
                    columns={columns}
                    data={products}
                    searchKey="name"
                    searchPlaceholder="Cari produk..."
                />

                {/* Edit Product Dialog */}
                <Dialog
                    open={editingProduct !== null}
                    onOpenChange={(open) => !open && setEditingProduct(null)}
                >
                    <DialogContent className="max-w-md bg-card">
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Produk</DialogTitle>
                                <DialogDescription>
                                    Ubah rincian produk. Tekan simpan untuk
                                    memperbarui database.
                                </DialogDescription>
                            </DialogHeader>
                            {editingProduct && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">
                                            Nama Produk
                                        </Label>
                                        <Input
                                            id="edit-name"
                                            value={editForm.data.name}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'name',
                                                    e.target.value,
                                                )
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-category_id">
                                            Kategori
                                        </Label>
                                        <Select
                                            value={editForm.data.category_id}
                                            onValueChange={(val) =>
                                                editForm.setData(
                                                    'category_id',
                                                    val,
                                                )
                                            }
                                        >
                                            <SelectTrigger
                                                id="edit-category_id"
                                                className="bg-background"
                                            >
                                                <SelectValue placeholder="Pilih Kategori" />
                                            </SelectTrigger>
                                            <SelectContent className="border border-sidebar-border bg-card">
                                                {categories.map((cat) => (
                                                    <SelectItem
                                                        key={cat.id}
                                                        value={cat.id.toString()}
                                                    >
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-price_buy">
                                                Harga Beli
                                            </Label>
                                            <Input
                                                id="edit-price_buy"
                                                type="number"
                                                min="0"
                                                value={editForm.data.price_buy}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'price_buy',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-price_sell">
                                                Harga Jual
                                            </Label>
                                            <Input
                                                id="edit-price_sell"
                                                type="number"
                                                min="0"
                                                value={editForm.data.price_sell}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'price_sell',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-stock_current">
                                                Stok Saat Ini
                                            </Label>
                                            <Input
                                                id="edit-stock_current"
                                                type="number"
                                                min="0"
                                                value={
                                                    editForm.data.stock_current
                                                }
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'stock_current',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="edit-stock_min">
                                                Stok Minimum
                                            </Label>
                                            <Input
                                                id="edit-stock_min"
                                                type="number"
                                                min="0"
                                                value={editForm.data.stock_min}
                                                onChange={(e) =>
                                                    editForm.setData(
                                                        'stock_min',
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-description">
                                            Deskripsi (Opsional)
                                        </Label>
                                        <Input
                                            id="edit-description"
                                            value={editForm.data.description}
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'description',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-image">
                                            Gambar Baru (Opsional)
                                        </Label>
                                        <Input
                                            id="edit-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) =>
                                                editForm.setData(
                                                    'image',
                                                    e.target.files?.[0] || null,
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingProduct(null)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                >
                                    Perbarui
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Product Dialog */}
                <Dialog
                    open={deletingProduct !== null}
                    onOpenChange={(open) => !open && setDeletingProduct(null)}
                >
                    <DialogContent className="max-w-md bg-card">
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus produk{' '}
                                <span className="font-bold text-foreground">
                                    {deletingProduct?.name}
                                </span>
                                ? Tindakan ini tidak dapat dibatalkan.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setDeletingProduct(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                            >
                                Hapus
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Inventaris.layout = {
    breadcrumbs: [
        {
            title: 'Inventaris',
            href: inventaris(),
        },
    ],
};
