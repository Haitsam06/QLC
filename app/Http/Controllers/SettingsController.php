<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class SettingsController extends Controller
{
    /**
     * Memperbarui Username & Email
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'username' => 'required|string|max:50|unique:users,username,' . $user->_id . ',_id',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->_id . ',_id',

            'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'username.unique' => 'Username sudah digunakan orang lain.',
            'email.unique' => 'Email sudah terdaftar pada akun lain.',
        ]);

        $photoUrl = $user->photo ?? null;

        // upload photo baru
        if ($request->hasFile('photo')) {

            // hapus photo lama
            if ($photoUrl && str_contains($photoUrl, '/storage/')) {

                $parsedPath = parse_url($photoUrl, PHP_URL_PATH);

                if ($parsedPath) {
                    $oldPath = str_replace('/storage/', '', $parsedPath);

                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('photo')->store('profile', 'public');

            $photoUrl = URL::to(Storage::url($path));
        }

        $user->update([
            'username' => $request->username,
            'email' => $request->email,
            'photo' => $photoUrl,
        ]);

        return back()->with('success', 'Informasi akun berhasil diperbarui.');
    }

    /**
     * Memperbarui Kata Sandi
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'], // Mengecek sandi lama
            'password' => ['required', 'confirmed', Password::defaults()],
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