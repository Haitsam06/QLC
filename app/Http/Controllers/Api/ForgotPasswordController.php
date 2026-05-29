<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use App\Models\User;
use App\Mail\SendOtpMail;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
        ]);

        // Rate limit: per-email (3x / 15 menit) dan per-IP (10x / 15 menit)
        $emailKey = 'forgot-email:' . hash('sha256', Str::lower($request->email));
        $ipKey    = 'forgot-ip:' . $request->ip();

        if (RateLimiter::tooManyAttempts($emailKey, 3) ||
            RateLimiter::tooManyAttempts($ipKey, 10)) {
            return response()->json([
                'success' => false,
                'message' => 'Terlalu banyak percobaan. Silakan coba 15 menit lagi.',
            ], 429);
        }

        RateLimiter::hit($emailKey, 900);
        RateLimiter::hit($ipKey, 900);

        // Respons identik apakah email ada atau tidak — cegah user enumeration
        $genericResponse = response()->json([
            'success' => true,
            'message' => 'Jika email terdaftar, kode OTP telah dikirim.',
        ], 200);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return $genericResponse;
        }

        $email = $request->email;
        $otp   = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Simpan OTP sebagai hash — jangan simpan plaintext
        DB::table('password_reset_tokens')->insert([
            'email'      => $email,
            'token'      => Hash::make($otp),
            'created_at' => Carbon::now()->toDateTimeString(),
        ]);

        Mail::to($email)->send(new SendOtpMail($otp));

        return $genericResponse;
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email|max:255',
            'otp'      => 'required|string',
            'password' => 'required|min:8|confirmed',
        ]);

        // Gunakan pesan error generik agar tidak bocorkan info email/OTP mana yang salah
        $invalidResponse = response()->json([
            'errors' => ['otp' => ['Kode OTP salah atau sudah kedaluwarsa.']]
        ], 400);

        // Rate limit per-email untuk mencegah brute force OTP dari banyak IP
        $emailKey = 'reset-verify:' . hash('sha256', Str::lower($request->email));
        if (RateLimiter::tooManyAttempts($emailKey, 5)) {
            return $invalidResponse;
        }
        RateLimiter::hit($emailKey, 900);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return $invalidResponse;
        }

        $storedToken = is_array($resetRecord) ? ($resetRecord['token'] ?? '') : ($resetRecord->token ?? '');
        if (!Hash::check($request->otp, $storedToken)) {
            return $invalidResponse;
        }

        $createdAtString = is_array($resetRecord) ? ($resetRecord['created_at'] ?? null) : ($resetRecord->created_at ?? null);

        if ($createdAtString) {
            $createdAt = Carbon::parse($createdAtString);

            if ($createdAt->addMinutes(15)->isPast()) {
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();
                return $invalidResponse;
            }
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        // Hapus OTP terpakai
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui! Silakan login.'
        ], 200);
    }
}