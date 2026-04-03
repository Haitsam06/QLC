<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Auth', [
            'canResetPassword' => Route::has('password.request'),
            'status'           => session('status'),
            'initialTab'       => 'login',
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Load relasi role agar bisa baca role_name
        $user     = Auth::user()->load('role');
        $roleName = $user->getRoleName();

        // Selalu arahkan ke dashboard sesuai role aktif user.
        // Jangan gunakan intended() agar tidak kebawa URL lama dari role lain.
        return redirect()->to($this->redirectByRole($roleName));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/login');
    }

    /**
     * URL redirect berdasarkan role_name dari collection roles.
     */
    private function redirectByRole(?string $roleName): string
    {
        return match ($roleName) {
            'admin'  => '/admin/dashboard',
            'teacher' => '/teacher/dashboard',
            'parents' => '/parents/dashboard',
            'mitra' => '/mitra/dashboard',
            default  => '/',
        };
    }
}
