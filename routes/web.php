<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');


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

require __DIR__ . '/auth.php';