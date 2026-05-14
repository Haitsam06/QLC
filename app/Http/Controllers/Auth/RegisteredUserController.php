<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Parents;
use App\Mail\VerifyRegistrationMail;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Auth', [
            'initialTab' => 'register',
        ]);
    }

    /**
     * API: Mengirim OTP pendaftaran ke email.
     */
    public function sendOtp(Request $request)
    {
        // Validasi tahap 1 (semua input form kecuali OTP)
        $request->validate([
            'parent_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email', // Email sekarang wajib
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'username.unique' => 'Username ini sudah digunakan.',
            'email.unique' => 'Email ini sudah terdaftar.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.'
        ]);

        $email = $request->email;
        $otp = (string) rand(100000, 999999);

        // Hapus token lama jika ada (kita pinjam tabel password_reset_tokens agar praktis)
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Simpan OTP baru (Sebagai string untuk MongoDB)
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => $otp,
            'created_at' => Carbon::now()->toDateTimeString()
        ]);

        // Kirim email
        Mail::to($email)->send(new VerifyRegistrationMail($otp));

        return response()->json(['message' => 'Kode OTP berhasil dikirim ke email Anda.']);
    }

    /**
     * Memproses data registrasi dan memvalidasi OTP.
     */
    public function store(Request $request): RedirectResponse
    {
        // Validasi tahap 2 (Termasuk OTP)
        $request->validate([
            'parent_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'address' => 'required|string',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'otp' => 'required|string',
        ]);

        // Cek OTP di database
        $tokenRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->otp)
            ->first();

        if (!$tokenRecord) {
            return back()->withErrors(['otp' => 'Kode OTP salah atau tidak ditemukan.']);
        }

        // Cek kedaluwarsa (15 menit)
        $createdAtString = is_array($tokenRecord) ? ($tokenRecord['created_at'] ?? null) : ($tokenRecord->created_at ?? null);
        if ($createdAtString && Carbon::parse($createdAtString)->addMinutes(15)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return back()->withErrors(['otp' => 'Kode OTP sudah kedaluwarsa. Silakan muat ulang halaman.']);
        }

        // Jika OTP valid, buat Akun
        $user = User::create([
            'role_id' => 'RL03',
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        Parents::create([
            'user_id' => $user->_id,
            'parent_name' => $request->parent_name,
            'phone' => $request->phone,
            'address' => $request->address,
        ]);

        // Hapus OTP yang terpakai
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        event(new Registered($user));
        Auth::login($user);

        return redirect()->route('parents.dashboard');
    }
}