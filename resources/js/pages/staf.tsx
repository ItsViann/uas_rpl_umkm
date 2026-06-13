import { Head, useForm, router } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import * as React from 'react';
import { toast } from 'sonner';
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

interface Staff {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface StaffProps {
    staff: Staff[];
}

export default function StaffList({ staff }: StaffProps) {
    const [isAddOpen, setIsAddOpen] = React.useState(false);
    const [editingStaff, setEditingStaff] = React.useState<Staff | null>(null);
    const [deletingStaff, setDeletingStaff] = React.useState<Staff | null>(null);

    const addForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    const editForm = useForm({
        name: '',
        email: '',
        password: '',
    });

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post('/staf', {
            onSuccess: () => {
                setIsAddOpen(false);
                addForm.reset();
                toast.success('Staf kasir baru berhasil didaftarkan');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError as string) || 'Gagal menambahkan staf');
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingStaff) {
return;
}

        editForm.put(`/staf/${editingStaff.id}`, {
            onSuccess: () => {
                setEditingStaff(null);
                editForm.reset();
                toast.success('Akun staf kasir berhasil diperbarui');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError as string) || 'Gagal memperbarui akun staf');
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingStaff) {
return;
}

        router.delete(`/staf/${deletingStaff.id}`, {
            onSuccess: () => {
                setDeletingStaff(null);
                toast.success('Akun staf kasir berhasil dihapus');
            },
            onError: (errors: any) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError as string) || 'Gagal menghapus staf');
            },
        });
    };

    const openEditDialog = (item: Staff) => {
        setEditingStaff(item);
        editForm.setData({
            name: item.name,
            email: item.email,
            password: '',
        });
    };

    const columns: ColumnDef<Staff>[] = [
        {
            accessorKey: 'name',
            header: 'Nama Karyawan',
            cell: ({ row }) => <span className="font-semibold">{row.getValue('name')}</span>,
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => <span>{row.getValue('email')}</span>,
        },
        {
            accessorKey: 'created_at',
            header: 'Tanggal Didaftarkan',
            cell: ({ row }) => {
                const val = row.getValue('created_at') as string;

                return <span>{new Date(val).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</span>;
            },
        },
        {
            id: 'actions',
            header: 'Aksi',
            cell: ({ row }) => {
                const item = row.original;

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                            className="size-8"
                        >
                            <Edit2 className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeletingStaff(item)}
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
            <Head title="Kelola Staf Kasir" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between border-b border-sidebar-border/70 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Kelola Staf</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola data kredensial login staf kasir toko Anda
                        </p>
                    </div>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="flex items-center gap-2">
                                <Plus className="size-4" /> Tambah Staf Kasir
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md bg-card">
                            <form onSubmit={handleAddSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Daftarkan Staf Baru</DialogTitle>
                                    <DialogDescription>
                                        Masukkan nama, email, dan password login staf kasir baru di bawah ini.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <Input
                                            id="name"
                                            value={addForm.data.name}
                                            onChange={(e) => addForm.setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Alamat Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={addForm.data.email}
                                            onChange={(e) => addForm.setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password (Min. 8 Karakter)</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={addForm.data.password}
                                            onChange={(e) => addForm.setData('password', e.target.value)}
                                            required
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
                                    <Button type="submit" disabled={addForm.processing}>
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <DataTable
                    columns={columns}
                    data={staff}
                    searchKey="name"
                    searchPlaceholder="Cari nama karyawan..."
                />

                {/* Edit Modal */}
                <Dialog
                    open={editingStaff !== null}
                    onOpenChange={(open) => !open && setEditingStaff(null)}
                >
                    <DialogContent className="max-w-md bg-card">
                        <form onSubmit={handleEditSubmit}>
                            <DialogHeader>
                                <DialogTitle>Edit Kredensial Staf</DialogTitle>
                                <DialogDescription>
                                    Ubah informasi staf kasir atau isi kolom password jika ingin mereset password staf.
                                </DialogDescription>
                            </DialogHeader>
                            {editingStaff && (
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-name">Nama Lengkap</Label>
                                        <Input
                                            id="edit-name"
                                            value={editForm.data.name}
                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-email">Alamat Email</Label>
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={editForm.data.email}
                                            onChange={(e) => editForm.setData('email', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="edit-password">Password Baru (Kosongkan jika tidak diubah)</Label>
                                        <Input
                                            id="edit-password"
                                            type="password"
                                            value={editForm.data.password}
                                            onChange={(e) => editForm.setData('password', e.target.value)}
                                            placeholder="Minimal 8 karakter"
                                        />
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingStaff(null)}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    Perbarui
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Modal */}
                <Dialog
                    open={deletingStaff !== null}
                    onOpenChange={(open) => !open && setDeletingStaff(null)}
                >
                    <DialogContent className="max-w-md bg-card">
                        <DialogHeader>
                            <DialogTitle>Konfirmasi Hapus Akun Staf</DialogTitle>
                            <DialogDescription>
                                Apakah Anda yakin ingin menghapus akun staf{' '}
                                <span className="font-bold text-foreground">
                                    {deletingStaff?.name}
                                </span>
                                ? Staf tersebut tidak akan bisa login lagi ke sistem kasir.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeletingStaff(null)}>
                                Batal
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit}>
                                Hapus Akun
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

StaffList.layout = {
    breadcrumbs: [
        {
            title: 'Kelola Staf',
            href: '/staf',
        },
    ],
};
