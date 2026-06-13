<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    /**
     * Show the store settings edit form.
     */
    public function edit(): Response
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengelola pengaturan toko.');
        }

        $store = StoreSetting::first() ?? new StoreSetting();

        return Inertia::render('settings/store', [
            'storeSetting' => $store,
        ]);
    }

    /**
     * Update the store settings.
     */
    public function update(Request $request): RedirectResponse
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengelola pengaturan toko.');
        }

        $request->validate([
            'store_name' => 'required|string|max:150',
            'store_address' => 'nullable|string',
            'store_phone' => 'nullable|string|max:30',
            'whatsapp_number' => 'nullable|string|max:30',
            'receipt_footer' => 'nullable|string',
        ]);

        $store = StoreSetting::first();
        if (! $store) {
            $store = new StoreSetting();
        }

        $store->fill([
            'store_name' => $request->store_name,
            'store_address' => $request->store_address,
            'store_phone' => $request->store_phone,
            'whatsapp_number' => $request->whatsapp_number,
            'receipt_footer' => $request->receipt_footer,
        ]);
        $store->save();

        return redirect()->back()->with('success', 'Pengaturan toko berhasil diperbarui.');
    }
}
