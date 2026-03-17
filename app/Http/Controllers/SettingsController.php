<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;

class SettingsController extends Controller
{
    /**
     * Memperbarui Username & Email
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            // Pengecualian unique untuk user yang sedang login agar tidak error saat save
            'username' => 'required|string|max:50|unique:users,username,'.$user->_id.',_id',
            'email'    => 'nullable|string|email|max:255|unique:users,email,'.$user->_id.',_id',
        ], [
            'username.unique' => 'Username sudah digunakan orang lain.',
            'email.unique'    => 'Email sudah terdaftar pada akun lain.'
        ]);

        $user->update([
            'username' => $request->username,
            'email'    => $request->email,
        ]);

        // Mengirimkan pesan flash 'success' kembali ke React
        return back()->with('success', 'Informasi akun berhasil diperbarui.');
    }

    /**
     * Memperbarui Kata Sandi
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'], // Mengecek sandi lama
            'password'         => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.current_password' => 'Kata sandi saat ini salah.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.'
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('success', 'Kata sandi berhasil diperbarui.');
    }
}