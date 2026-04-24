<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Parents\ParentDashboardController;
use App\Http\Controllers\Parents\EnrollmentController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// ==========================================
// ROUTE UTAMA
// ==========================================
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// ==========================================
// ROUTE HALAMAN LANDING
// ==========================================
Route::get('/landing/agenda', function (Request $request) {
    return Inertia::render('Landing/Agenda', [
        'currentDateStr' => $request->query('date'),
    ]);
})->name('landing.agenda');

Route::get('/pengurus',       fn() => Inertia::render('Landing/Pengurus'))->name('landing.pengurus');
Route::get('/galeri',         fn() => Inertia::render('Landing/Galeri'))->name('landing.galeri');
Route::get('/program-detail', fn() => Inertia::render('Landing/ProgramDetail'))->name('program.detail');

// ==========================================
// ROUTE AUTH, PROFILE & PENGATURAN
// ==========================================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::put('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
    Route::put('/settings/password', [SettingsController::class, 'updatePassword'])->name('settings.password');
});

// ==========================================
// ROUTE BERDASARKAN ROLE
// ==========================================
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', [AdminDashboardController::class, 'dashboard'])->name('admin.dashboard');
    });

// ── Teacher: satu route dashboard, semua tab di-handle React ──
Route::middleware(['auth', 'role:teacher'])
    ->prefix('teacher')
    ->name('teacher.')
    ->group(function () {
        Route::get('/dashboard', [TeacherDashboardController::class, 'index'])->name('dashboard');
        // Route jadwal & laporan dihapus — sudah jadi sub-page di dashboard
    });

// ── Parents: satu route dashboard, semua tab di-handle React ──
Route::middleware(['auth', 'role:parents'])
    ->prefix('parents')
    ->name('parents.')
    ->group(function () {
        // Satu-satunya page route — konten tab dihandle oleh React SPA
        Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');

        // Pendaftaran (halaman terpisah karena butuh file upload)
        Route::get('/daftar',  [EnrollmentController::class, 'create'])->name('daftar');
        Route::post('/daftar', [EnrollmentController::class, 'store'])->name('daftar.store');
    });

// ── Mitra: satu route dashboard, semua tab di-handle React ──
Route::middleware(['auth', 'role:mitra'])
    ->prefix('mitra')
    ->name('mitra.')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('mitra/Dashboard'))->name('dashboard');
        // Route program, jadwal & laporan dihapus — sudah jadi sub-page di dashboard
    });

require __DIR__ . '/auth.php';