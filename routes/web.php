<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        // 'canLogin' => Route::has('login'),
        // 'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('admin/dashboard', function () {
    return Inertia::render('admin/Dashboard');
});
Route::redirect('admin/guru', 'admin/dashboard?tab=guru');
// })->middleware(['auth', 'verified'])->name('dashboard');


// ==========================================
// ROUTE HALAMAN LANDING (Sesuai Struktur Folder)
// ==========================================

Route::get('/landing/agenda', function (Request $request) {
    return Inertia::render('Landing/Agenda', [
        // Tangkap parameter 'date' dari URL, kirim sebagai props 'currentDateStr' ke React
        'currentDateStr' => $request->query('date'),

        // Nanti Anda bisa menambahkan query database di sini untuk 'events'
        // 'events' => Agenda::whereMonth('tanggal', ...)->get(), 
    ]);
})->name('landing.agenda');

// URL: /pengurus -> Memanggil file: Pages/Landing/Pengurus.tsx
Route::get('/pengurus', function () {
    return Inertia::render('Landing/Pengurus');
})->name('landing.pengurus');

// URL: /galeri -> Memanggil file: Pages/Landing/Galeri.tsx
Route::get('/galeri', function () {
    return Inertia::render('Landing/Galeri');
})->name('landing.galeri');

// URL: /program-detail -> Memanggil file: Pages/Landing/ProgramDetail.tsx
Route::get('/program-detail', function () {
    return Inertia::render('Landing/ProgramDetail');
})->name('program.detail');


// ==========================================
// ROUTE AUTH & PROFILE
// ==========================================
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('parents/dashboard', function () {
    return Inertia::render('parents/Dashboard');
});

Route::get('mitra/dashboard', function () {
    return Inertia::render('mitra/Dashboard');
});
Route::get('mitra/program', function () {
    return Inertia::render('mitra/Program');
});
Route::get('mitra/jadwal', function () {
    return Inertia::render('mitra/Jadwal');
});
Route::get('mitra/laporan', function () {
    return Inertia::render('mitra/Laporan');
});

Route::get('teacher/dashboard', function () {
    return Inertia::render('teacher/Dashboard');
});

Route::get('teacher/jadwal', function () {
    return Inertia::render('teacher/Jadwal');
});

Route::get('teacher/laporan', function () {
    return Inertia::render('teacher/Laporan');
});

require __DIR__ . '/auth.php';
