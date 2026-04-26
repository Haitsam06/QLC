<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Parents\ParentDashboardController;
use App\Http\Controllers\Parents\EnrollmentController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Profile;
use App\Models\Program;
use App\Models\Gallery;
use App\Models\Foundation;
use App\Models\Leader;

// ==========================================
// ROUTE UTAMA
// ==========================================
Route::get('/', function () {
    $db = DB::connection('mongodb')->getMongoClient()->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));

    // Ambil semua data dari MongoDB
    $profile = $db->selectCollection('profiles')->findOne([]) ?: null;
    $programs = iterator_to_array($db->selectCollection('programs')->find([]));
    $galleries = iterator_to_array($db->selectCollection('gallery')->find([]));
    $foundations = iterator_to_array($db->selectCollection('foundations')->find([]));
    $leaders = iterator_to_array($db->selectCollection('leaders')->find([]));

    // Helper untuk convert ObjectId ke string (agar tidak error di React)
    $convertId = function ($doc) {
        if (isset($doc['_id'])) {
            $doc['id'] = (string) $doc['_id'];
            unset($doc['_id']);
        }
        return $doc;
    };

    return Inertia::render('Welcome', [
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'profile' => $profile ? $convertId((array) $profile) : null,
        'programs' => array_map(fn($d) => $convertId((array) $d), $programs),
        'galleries' => array_map(fn($d) => $convertId((array) $d), $galleries),
        'foundations' => array_map(fn($d) => $convertId((array) $d), $foundations),
        'leaders' => array_map(fn($d) => $convertId((array) $d), $leaders),
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

Route::get('/pengurus', function () {
    $db = DB::connection('mongodb')->getMongoClient()->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
    $leaders = iterator_to_array($db->selectCollection('leaders')->find([]));

    $convertId = function ($doc) {
        if (isset($doc['_id'])) {
            $doc['id'] = (string) $doc['_id'];
            unset($doc['_id']);
        }
        return $doc;
    };

    return Inertia::render('Landing/Pengurus', [
        'leaders' => array_map(fn($d) => $convertId((array) $d), $leaders),
    ]);
})->name('landing.pengurus');
Route::get('/galeri', function () {
    $db = DB::connection('mongodb')->getMongoClient()->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));

    // Ambil data galeri dan urutkan dari yang terbaru
    $galleries = iterator_to_array($db->selectCollection('gallery')->find([], ['sort' => ['uploaded_at' => -1]]));

    $convertId = function ($doc) {
        if (isset($doc['_id'])) {
            $doc['id'] = (string) $doc['_id'];
            unset($doc['_id']);
        }
        return $doc;
    };

    return Inertia::render('Landing/Galeri', [
        'galleries' => array_map(fn($d) => $convertId((array) $d), $galleries),
    ]);
})->name('landing.galeri');
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
// ROUTE NOTIFIKASI (semua role yang sudah login)
// CATATAN: 'read-all' harus didefinisikan SEBELUM '/{id}'
// ==========================================
Route::middleware('auth')->prefix('api')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.readAll');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::delete('/notifications', [NotificationController::class, 'destroyAll'])->name('notifications.destroyAll');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
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
    });

// ── Parents: satu route dashboard, semua tab di-handle React ──
Route::middleware(['auth', 'role:parents'])
    ->prefix('parents')
    ->name('parents.')
    ->group(function () {
        Route::get('/dashboard', [ParentDashboardController::class, 'index'])->name('dashboard');

        // Pendaftaran (halaman terpisah karena butuh file upload)
        Route::get('/daftar', [EnrollmentController::class, 'create'])->name('daftar');
        Route::post('/daftar', [EnrollmentController::class, 'store'])->name('daftar.store');
    });

// ── Mitra: satu route dashboard, semua tab di-handle React ──
Route::middleware(['auth', 'role:mitra'])
    ->prefix('mitra')
    ->name('mitra.')
    ->group(function () {
        Route::get('/dashboard', fn() => Inertia::render('mitra/Dashboard'))->name('dashboard');
    });

require __DIR__ . '/auth.php';