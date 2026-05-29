<?php

use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Parents\ParentDashboardController;
use App\Http\Controllers\Parents\EnrollmentController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\Foundation;
use App\Models\Gallery;
use App\Models\Leader;
use App\Models\Profile;
use App\Models\Program;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;

// ==========================================
// ROUTE UTAMA
// ==========================================
Route::get('/', function () {
    $profile     = Profile::first();
    $programs    = Program::orderBy('name')->get();
    $galleries   = Gallery::orderBy('uploaded_at', 'desc')->get();
    $foundations = Foundation::all();
    $leaders     = Leader::all();

    $fmt = fn($doc) => array_merge($doc->toArray(), ['id' => (string) $doc->_id]);

    return Inertia::render('Welcome', [
        'profile'     => $profile     ? $fmt($profile)                        : null,
        'programs'    => $programs->map($fmt)->values()->toArray(),
        'galleries'   => $galleries->map($fmt)->values()->toArray(),
        'foundations' => $foundations->map($fmt)->values()->toArray(),
        'leaders'     => $leaders->map($fmt)->values()->toArray(),
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
    $leaders = Leader::all();
    $fmt     = fn($doc) => array_merge($doc->toArray(), ['id' => (string) $doc->_id]);

    return Inertia::render('Landing/Pengurus', [
        'leaders' => $leaders->map($fmt)->values()->toArray(),
    ]);
})->name('landing.pengurus');

Route::get('/galeri', function () {
    $galleries = Gallery::orderBy('uploaded_at', 'desc')->get();
    $fmt       = fn($doc) => array_merge($doc->toArray(), ['id' => (string) $doc->_id]);

    return Inertia::render('Landing/Galeri', [
        'galleries' => $galleries->map($fmt)->values()->toArray(),
    ]);
})->name('landing.galeri');

Route::get('/kerja-sama', function () {
    return Inertia::render('Landing/KerjaSama');
})->name('landing.kerjasama');

Route::get('/program-detail/{id}', function ($id) {
    $program = \App\Models\Program::find($id);

    if (!$program) {
        abort(404, 'Program tidak ditemukan');
    }

    $advantages = $program->advantages ?? [];
    if (is_string($advantages)) {
        $advantages = json_decode($advantages, true) ?? [];
    }

    return Inertia::render('Landing/ProgramDetail', [
        'program' => [
            'id'              => (string) $program->_id,
            'name'            => $program->name,
            'description'     => $program->description,
            'target_audience' => $program->target_audience,
            'image_url'       => $program->image_url,
            'hero_image_url'  => $program->hero_image_url ?? null,
            'about_image_url' => $program->about_image_url ?? null,
            'advantages'      => array_values((array) $advantages),
            'gallery'         => array_values((array) ($program->gallery ?? [])),
        ],
    ]);
})->name('program.detail');
// ==========================================
// ROUTE PROFILE & PENGATURAN (AUTHENTICATED)
// ==========================================
Route::middleware('auth')->group(function () {
    Route::post(
        '/parents/profile',
        [ParentController::class, 'updateOwnProfile']
    )->name('parents.profile.update');

    Route::post(
        '/parents/password',
        [ParentController::class, 'updateOwnPassword']
    )->name('parents.password.update');

    Route::post(
        '/teacher/profile',
        [TeacherController::class, 'updateOwnProfile']
    )->name('teacher.profile.update');

    Route::post(
        '/teacher/password',
        [TeacherController::class, 'updateOwnPassword']
    )->name('teacher.password.update');

    Route::post(
        '/mitra/profile',
        [MitraController::class, 'updateOwnProfile']
    )->name('mitra.profile.update');

    Route::post(
        '/mitra/password',
        [MitraController::class, 'updateOwnPassword']
    )->name('mitra.password.update');

    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/profile', [SettingsController::class, 'updateProfile'])->name('settings.profile');
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

// ==========================================
// ROUTE CUSTOM AUTH (GUEST)
// ==========================================
Route::middleware(['guest', 'throttle:20,1'])->group(function () {
    // API Route untuk mengirim OTP Pendaftaran (dibatasi 20 request per menit per IP)
    Route::post('/register/send-otp', [RegisteredUserController::class, 'sendOtp'])->name('register.send-otp');
});

// Memuat route bawaan auth Laravel Breeze (Login, Register Store, dll)
require __DIR__ . '/auth.php';