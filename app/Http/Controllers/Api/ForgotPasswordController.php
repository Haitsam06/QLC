<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Mail\SendOtpMail;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email'
        ], [
            'email.exists' => 'Email tidak ditemukan di sistem kami.'
        ]);

        $email = $request->email;
        $otp = (string) rand(100000, 999999);

        // Hapus OTP lama
        DB::table('password_reset_tokens')->where('email', $email)->delete();

        // Simpan OTP baru dengan waktu (format string standar Y-m-d H:i:s)
        DB::table('password_reset_tokens')->insert([
            'email' => $email,
            'token' => $otp,
            'created_at' => Carbon::now()->toDateTimeString() // <-- UBAH BAGIAN INI
        ]);

        // Kirim email
        Mail::to($email)->send(new SendOtpMail($otp));

        return response()->json([
            'success' => true,
            'message' => 'Kode OTP berhasil dikirim ke email Anda.'
        ], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'otp' => 'required|string',
            'password' => 'required|min:8|confirmed',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->otp)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'errors' => ['otp' => ['Kode OTP salah atau tidak ditemukan.']]
            ], 400);
        }

        // Ambil waktu dibuat (pastikan berbentuk string)
        $createdAtString = is_array($resetRecord) ? ($resetRecord['created_at'] ?? null) : ($resetRecord->created_at ?? null);

        if ($createdAtString) {
            // Parse string kembali ke Carbon
            $createdAt = Carbon::parse($createdAtString);

            // Cek kedaluwarsa (15 menit)
            if ($createdAt->addMinutes(15)->isPast()) {
                DB::table('password_reset_tokens')->where('email', $request->email)->delete();
                return response()->json([
                    'errors' => ['otp' => ['Kode OTP sudah kedaluwarsa. Silakan minta ulang.']]
                ], 400);
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