<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// ── Public: Welcome ──────────────────────────────────────────
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});

// ── Landing pages (public) ───────────────────────────────────
Route::get('/landing/agenda', function (Request $request) {
    return Inertia::render('Landing/Agenda', [
        'currentDateStr' => $request->query('date'),
    ]);
})->name('landing.agenda');

Route::get('/pengurus',       fn() => Inertia::render('Landing/Pengurus'))->name('landing.pengurus');
Route::get('/galeri',         fn() => Inertia::render('Landing/Galeri'))->name('landing.galeri');
Route::get('/program-detail', fn() => Inertia::render('Landing/ProgramDetail'))->name('program.detail');

// ── Profile (auth) ───────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ── Admin routes ─────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('admin/Dashboard'))->name('admin.dashboard');
        Route::redirect('/guru', '/admin/dashboard?tab=guru');
        // Tambah route admin lainnya di sini
    });

// ── Guru routes ──────────────────────────────────────────────
Route::middleware(['auth', 'role:guru'])
    ->prefix('guru')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('guru/Dashboard'))->name('guru.dashboard');
        // Tambah route guru lainnya di sini
    });

// ── Parent routes ─────────────────────────────────────────────
Route::middleware(['auth', 'role:parents'])
    ->prefix('parents')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('parents/Dashboard'))->name('parents.dashboard');
        // Tambah route parent lainnya di sini
    });

// ── Mitra routes (public sementara, tambah middleware jika perlu) ──
Route::prefix('mitra')->group(function () {
    Route::get('/dashboard', fn() => Inertia::render('mitra/Dashboard'));
    Route::get('/program',   fn() => Inertia::render('mitra/Program'));
    Route::get('/jadwal',    fn() => Inertia::render('mitra/Jadwal'));
    Route::get('/laporan',   fn() => Inertia::render('mitra/Laporan'));
});

require __DIR__ . '/auth.php';