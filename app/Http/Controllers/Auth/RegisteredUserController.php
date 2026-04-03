<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Parents; // Memanggil model Parents yang baru dibuat
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Menampilkan halaman registrasi.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Auth', [
            'initialTab' => 'register',
        ]);
    }

    /**
     * Memproses data registrasi yang dikirim dari form.
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. Validasi input dari user
        $request->validate([
            'parent_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'nullable|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'username.unique' => 'Username ini sudah digunakan.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.'
        ]);

        // 2. Buat Akun Login (Masuk ke collection: users)
        $user = User::create([
            'role_id' => 'RL03', // RL03 adalah ID untuk role "parents" di RolesSeeder
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // 3. Buat Profil Detail Wali Murid (Masuk ke collection: parents)
        Parents::create([
            'user_id' => $user->_id, // Mengambil Object ID dari user yang baru saja terbuat
            'parent_name' => $request->parent_name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        event(new Registered($user));

        // 4. Langsung login otomatis setelah berhasil daftar
        Auth::login($user);

        // 5. Arahkan ke dashboard khusus wali murid
        return redirect()->route('parents.dashboard');
    }
}