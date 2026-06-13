import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { store } = usePage().props as any;
    const storeName = store?.store_name || 'UMKMku';

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-transparent">
                <img
                    src="https://img.icons8.com/fluency/96/shopping-cart.png"
                    alt={`Logo ${storeName}`}
                    className="size-7 object-contain"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {storeName}
                </span>
            </div>
        </>
    );
}
