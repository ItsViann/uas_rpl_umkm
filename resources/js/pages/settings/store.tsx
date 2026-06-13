import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StoreSetting {
    id?: number;
    store_name: string;
    store_address: string;
    store_phone: string;
    whatsapp_number: string;
    receipt_footer: string;
}

interface StoreProps {
    storeSetting: StoreSetting;
}

export default function Store({ storeSetting }: StoreProps) {
    const form = useForm({
        store_name: storeSetting.store_name || '',
        store_address: storeSetting.store_address || '',
        store_phone: storeSetting.store_phone || '',
        whatsapp_number: storeSetting.whatsapp_number || '',
        receipt_footer: storeSetting.receipt_footer || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        form.patch('/settings/store', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Pengaturan toko berhasil diperbarui');
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error((firstError as string) || 'Gagal menyimpan pengaturan');
            },
        });
    };

    return (
        <>
            <Head title="Store settings" />

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Store Settings"
                    description="Update your store name, contact info, and receipt settings"
                />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="store_name">Store Name</Label>
                        <Input
                            id="store_name"
                            className="mt-1 block w-full"
                            value={form.data.store_name}
                            onChange={(e) => form.setData('store_name', e.target.value)}
                            required
                        />
                        <InputError message={form.errors.store_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="store_address">Store Address</Label>
                        <Input
                            id="store_address"
                            className="mt-1 block w-full"
                            value={form.data.store_address}
                            onChange={(e) => form.setData('store_address', e.target.value)}
                        />
                        <InputError message={form.errors.store_address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="store_phone">Store Phone</Label>
                        <Input
                            id="store_phone"
                            className="mt-1 block w-full"
                            value={form.data.store_phone}
                            onChange={(e) => form.setData('store_phone', e.target.value)}
                        />
                        <InputError message={form.errors.store_phone} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="whatsapp_number">WhatsApp Number (e.g. 628123456789)</Label>
                        <Input
                            id="whatsapp_number"
                            className="mt-1 block w-full"
                            value={form.data.whatsapp_number}
                            onChange={(e) => form.setData('whatsapp_number', e.target.value)}
                            placeholder="628123456789"
                        />
                        <p className="text-[10px] text-muted-foreground">
                            Gunakan kode negara (62 untuk Indonesia) tanpa spasi atau tanda +.
                        </p>
                        <InputError message={form.errors.whatsapp_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="receipt_footer">Receipt Footer Note</Label>
                        <Input
                            id="receipt_footer"
                            className="mt-1 block w-full"
                            value={form.data.receipt_footer}
                            onChange={(e) => form.setData('receipt_footer', e.target.value)}
                        />
                        <InputError message={form.errors.receipt_footer} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button disabled={form.processing}>Save Settings</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Store.layout = {
    breadcrumbs: [
        {
            title: 'Store settings',
            href: '/settings/store',
        },
    ],
};
