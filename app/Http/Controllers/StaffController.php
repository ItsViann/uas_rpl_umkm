<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Display the list of cashier staff.
     */
    public function index(): Response
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengelola staf.');
        }

        $staff = User::where('role', 'kasir')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at->toISOString(),
                ];
            });

        return Inertia::render('staf', [
            'staff' => $staff,
        ]);
    }

    /**
     * Store a newly created cashier account.
     */
    public function store(Request $request): RedirectResponse
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengelola staf.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'kasir',
        ]);

        return redirect()->back()->with('success', 'Akun staf kasir berhasil ditambahkan.');
    }

    /**
     * Update an existing cashier account.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengelola staf.');
        }

        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return redirect()->back()->with('success', 'Akun staf kasir berhasil diperbarui.');
    }

    /**
     * Remove a cashier account.
     */
    public function destroy(int $id): RedirectResponse
    {
        if (auth()->user()?->role !== 'owner') {
            abort(403, 'Akses ditolak. Hanya Owner yang dapat mengelola staf.');
        }

        $user = User::findOrFail($id);

        // Prevent deleting oneself just in case
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['staf' => 'Tidak dapat menghapus akun Anda sendiri.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'Akun staf kasir berhasil dihapus.');
    }
}
