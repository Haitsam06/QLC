<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\InfoController;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\ProgressReportController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\MitraDashboardController;
use App\Http\Controllers\Admin\MitraReportController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\SppController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Struktur middleware:
|   PUBLIC         — endpoint yang boleh diakses siapapun (landing page, lupa sandi)
|   AUTH + ADMIN   — CRUD data master, hanya admin
|   AUTH           — endpoint yang butuh login (teacher, parent, mitra)
|
*/

// ══════════════════════════════════════════════════════════════════════
// PUBLIC — Tidak butuh login
// ══════════════════════════════════════════════════════════════════════

// Lupa password: dibatasi 5 request per 10 menit per IP (C-3)
Route::middleware('throttle:5,10')->group(function () {
    Route::post('forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
    Route::post('forgot-password/reset',    [ForgotPasswordController::class, 'resetPassword']);
});

// Info — GET only untuk halaman landing (profil, fondasi, pemimpin, program, galeri)
Route::prefix('info')->group(function () {
    Route::get('profile',          [InfoController::class, 'profileShow']);
    Route::get('foundations',      [InfoController::class, 'foundationIndex']);
    Route::get('leaders',          [InfoController::class, 'leaderIndex']);
    Route::get('programs',         [InfoController::class, 'programIndex']);
    Route::get('gallery',          [InfoController::class, 'galleryIndex']);
});

// Agenda — GET boleh diakses siapapun (landing page & dashboard semua role)
Route::get('agenda/upcoming', [AgendaController::class, 'upcoming']);
Route::get('agenda',          [AgendaController::class, 'index']);


// ══════════════════════════════════════════════════════════════════════
// ADMIN ONLY — Butuh login + role admin (C-1 & C-2)
// ══════════════════════════════════════════════════════════════════════
Route::middleware(['auth', 'role:admin'])->group(function () {

    // ── Teachers ──────────────────────────────────────────────────
    Route::prefix('teachers')->group(function () {
        Route::get('spesialisasi',          [TeacherController::class, 'spesialisasiList']);
        Route::post('{id}/reset-password',  [TeacherController::class, 'resetPassword']);
        Route::apiResource('/', TeacherController::class)->parameters(['' => 'id']);
    });

    // ── Parents ───────────────────────────────────────────────────
    Route::post('parents/{id}/reset-password', [ParentController::class, 'resetPassword']);
    Route::apiResource('parents', ParentController::class)
        ->parameters(['parents' => 'id']);

    // ── Students ──────────────────────────────────────────────────
    Route::get('students/options', [StudentController::class, 'options']);
    Route::post('students/{id}/foto', [StudentController::class, 'uploadFoto']);
    Route::apiResource('students', StudentController::class)
        ->parameters(['students' => 'id']);

    // ── Info — write operations ────────────────────────────────────
    Route::prefix('info')->group(function () {
        Route::post('profile',               [InfoController::class, 'profileUpsert']);

        Route::post('foundations',           [InfoController::class, 'foundationStore']);
        Route::put('foundations/{id}',       [InfoController::class, 'foundationUpdate']);
        Route::delete('foundations/{id}',    [InfoController::class, 'foundationDestroy']);

        Route::post('leaders',               [InfoController::class, 'leaderStore']);
        Route::put('leaders/{id}',           [InfoController::class, 'leaderUpdate']);
        Route::delete('leaders/{id}',        [InfoController::class, 'leaderDestroy']);

        Route::post('programs',                          [InfoController::class, 'programStore']);
        Route::put('programs/{id}',                      [InfoController::class, 'programUpdate']);
        Route::delete('programs/{id}',                   [InfoController::class, 'programDestroy']);
        Route::delete('programs/{id}/gallery/{index}',   [InfoController::class, 'programGalleryDestroy']);

        Route::post('gallery',               [InfoController::class, 'galleryStore']);
        Route::put('gallery/{id}',           [InfoController::class, 'galleryUpdate']);
        Route::delete('gallery/{id}',        [InfoController::class, 'galleryDestroy']);
    });

    // ── Agenda write (admin dapat edit semua, lihat ownership check di controller) ──

    // ── Partners (Mitra) ──────────────────────────────────────────
    Route::post('partners/{id}/reset-password', [MitraController::class, 'resetPassword']);
    Route::apiResource('partners', MitraController::class)
        ->parameters(['partners' => 'id']);

    // ── Admin Dashboard ───────────────────────────────────────────
    Route::prefix('admin/dashboard')->group(function () {
        Route::get('stats',            [AdminDashboardController::class, 'stats']);
        Route::get('chart',            [AdminDashboardController::class, 'chart']);
        Route::get('upcoming-agenda',  [AdminDashboardController::class, 'upcomingAgenda']);
        Route::get('pending-students', [AdminDashboardController::class, 'pendingStudents']);
        Route::get('top-reports',      [AdminDashboardController::class, 'topReports']);
    });

    // ── Admin Database Backup & Restore ───────────────────────────
    Route::get('database/backup',  [\App\Http\Controllers\Admin\DatabaseController::class, 'backupDatabase']);
    Route::post('database/restore', [\App\Http\Controllers\Admin\DatabaseController::class, 'restoreDatabase']);

    // ── Admin Mitra Reports ────────────────────────────────────────
    Route::prefix('admin/mitra')->group(function () {
        Route::get('list',                      [MitraReportController::class, 'partners']);
        Route::get('{partnerId}/reports',       [MitraReportController::class, 'reports']);
        Route::post('{partnerId}/reports',      [MitraReportController::class, 'store']);
        Route::delete('reports/{reportId}',     [MitraReportController::class, 'destroy']);
    });

    // ── SPP (Pembayaran) ──────────────────────────────────────────
    Route::get('spp/student-options',  [SppController::class, 'studentOptions']);
    Route::get('spp/summary',          [SppController::class, 'summary']);
    Route::apiResource('spp', SppController::class)
        ->parameters(['spp' => 'id']);

    // ── Admin Progress Reports ─────────────────────────────────────
    Route::prefix('admin/progress')->group(function () {
        Route::get('options',                           [ProgressReportController::class, 'adminOptions']);
        Route::get('students',                          [ProgressReportController::class, 'adminStudents']);
        Route::get('students/{studentId}/reports',      [ProgressReportController::class, 'adminStudentReports']);
        Route::get('reports',                           [ProgressReportController::class, 'adminReports']);
        Route::get('export',                            [ProgressReportController::class, 'adminExport']);
        Route::post('reports',                          [ProgressReportController::class, 'adminStore']);
        Route::put('reports/{id}',                      [ProgressReportController::class, 'adminUpdate']);
        Route::delete('reports/{id}',                   [ProgressReportController::class, 'adminDestroy']);
    });
});


// ══════════════════════════════════════════════════════════════════════
// ADMIN + TEACHER — Agenda write (ownership check ada di controller)
// ══════════════════════════════════════════════════════════════════════
Route::middleware(['auth', 'role:admin,teacher'])->group(function () {
    Route::post('agenda',        [AgendaController::class, 'store']);
    Route::put('agenda/{id}',    [AgendaController::class, 'update']);
    Route::delete('agenda/{id}', [AgendaController::class, 'destroy']);
});

// ══════════════════════════════════════════════════════════════════════
// TEACHER ONLY — Butuh login + role teacher
// ══════════════════════════════════════════════════════════════════════
Route::middleware(['auth', 'role:teacher'])->prefix('teacher')->group(function () {
    Route::get('students',                          [ProgressReportController::class, 'teacherStudents']);
    Route::get('students/{studentId}/reports',      [ProgressReportController::class, 'teacherStudentReports']);
    Route::post('reports',                          [ProgressReportController::class, 'teacherStore']);
    Route::get('reports/export',                    [ProgressReportController::class, 'teacherExport']);
    Route::get('reports/{id}',                      [ProgressReportController::class, 'teacherShow']);
    Route::put('reports/{id}',                      [ProgressReportController::class, 'teacherUpdate']);
    Route::delete('reports/{id}',                   [ProgressReportController::class, 'teacherDestroy']);
});

// ══════════════════════════════════════════════════════════════════════
// PARENT ONLY — Butuh login + role parents
// ══════════════════════════════════════════════════════════════════════
Route::middleware(['auth', 'role:parents'])->prefix('parent')->group(function () {
    Route::get('children',                          [ProgressReportController::class, 'parentChildren']);
    Route::get('children/{studentId}/reports',      [ProgressReportController::class, 'parentChildReports']);
    Route::post('children/{studentId}/foto',        [StudentController::class,        'parentUploadFoto']);
    Route::get('spp',                               [SppController::class,            'parentIndex']);
    Route::post('spp/{id}/pay',                     [SppController::class,            'parentPay']);
});

// ══════════════════════════════════════════════════════════════════════
// MITRA ONLY — Butuh login + role mitra
// ══════════════════════════════════════════════════════════════════════
Route::middleware(['auth', 'role:mitra'])->prefix('mitra')->group(function () {
    Route::get('dashboard', [MitraDashboardController::class, 'index']);
    Route::get('reports',   [MitraReportController::class,   'mitraReports']);
    Route::get('profile',   [MitraController::class,         'ownProfile']);
});
