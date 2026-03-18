<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController; // <-- Tambahan untuk Settings
use App\Http\Controllers\Parents\EnrollmentController;
use App\Http\Controllers\Parents\AnakController;
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
    // Profile bawaan framework
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Pengaturan Akun & Password (Rute Baru)
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
        Route::get('/dashboard', fn() => Inertia::render('admin/Dashboard'))->name('admin.dashboard');
    });

Route::middleware(['auth', 'role:teacher'])
    ->prefix('teacher')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('teacher/Dashboard'))->name('teacher.dashboard');
        Route::get('/jadwal',    fn() => Inertia::render('teacher/Jadwal'));
        Route::get('/laporan',   fn() => Inertia::render('teacher/Laporan'));
    });

Route::middleware(['auth', 'role:parents'])
    ->prefix('parents')
    ->name('parents.')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('parents/Dashboard'))->name('dashboard');

        Route::get('/laporan', fn() => Inertia::render('parents/LaporanParents'))->name('laporan');

        // Halaman anak
        Route::get('/anak', [AnakController::class, 'index'])->name('anak');

        // Pendaftaran
        Route::get('/daftar',  [EnrollmentController::class, 'create'])->name('daftar');
        Route::post('/daftar', [EnrollmentController::class, 'store'])->name('daftar.store');
    });

Route::middleware(['auth', 'role:mitra'])
    ->prefix('mitra')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('mitra/Dashboard'));
        Route::get('/program',   fn() => Inertia::render('mitra/Program'));
        Route::get('/jadwal',    fn() => Inertia::render('mitra/Jadwal'));
        Route::get('/laporan',   fn() => Inertia::render('mitra/Laporan'));
    });

require __DIR__ . '/auth.php';