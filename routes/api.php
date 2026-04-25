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

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ── Teachers ──────────────────────────────────────────────────────────────
Route::prefix('teachers')->group(function () {
    Route::get('spesialisasi', [TeacherController::class, 'spesialisasiList']);
    Route::apiResource('/', TeacherController::class)->parameters(['' => 'id']);
});

// ── Parents ───────────────────────────────────────────────────────────────
Route::apiResource('parents', ParentController::class)
    ->parameters(['parents' => 'id']);

// ── Students ──────────────────────────────────────────────────────────────
Route::get('students/options', [StudentController::class, 'options']);
Route::apiResource('students', StudentController::class)
    ->parameters(['students' => 'id']);

Route::prefix('info')->group(function () {
    // Profil
    Route::get ('profile', [InfoController::class, 'profileShow']);
    Route::post('profile', [InfoController::class, 'profileUpsert']);

    // Fondasi
    Route::get   ('foundations',      [InfoController::class, 'foundationIndex']);
    Route::post  ('foundations',      [InfoController::class, 'foundationStore']);
    Route::put   ('foundations/{id}', [InfoController::class, 'foundationUpdate']);
    Route::delete('foundations/{id}', [InfoController::class, 'foundationDestroy']);

    // Pimpinan Lembaga
    Route::get   ('leaders',      [InfoController::class, 'leaderIndex']);
    Route::post  ('leaders',      [InfoController::class, 'leaderStore']);
    Route::put   ('leaders/{id}', [InfoController::class, 'leaderUpdate']); // Ubah ke PUT
    Route::delete('leaders/{id}', [InfoController::class, 'leaderDestroy']);

    // Program Layanan
    Route::get   ('programs',      [InfoController::class, 'programIndex']);
    Route::post  ('programs',      [InfoController::class, 'programStore']);
    Route::put   ('programs/{id}', [InfoController::class, 'programUpdate']); // Ubah ke PUT
    Route::delete('programs/{id}', [InfoController::class, 'programDestroy']);

    // Galeri
    Route::get   ('gallery',      [InfoController::class, 'galleryIndex']);
    Route::post  ('gallery',      [InfoController::class, 'galleryStore']);
    Route::put   ('gallery/{id}', [InfoController::class, 'galleryUpdate']); // Ubah ke PUT
    Route::delete('gallery/{id}', [InfoController::class, 'galleryDestroy']);
});

// ── Agenda ────────────────────────────────────────────────────────────────
Route::get('agenda/upcoming', [AgendaController::class, 'upcoming']);
Route::apiResource('agenda', AgendaController::class)
    ->parameters(['agenda' => 'id']);

// ── Mitra ─────────────────────────────────────────────────────────────────
Route::apiResource('partners', MitraController::class)
    ->parameters(['partners' => 'id']);

// ── Progress Reports ──────────────────────────────────────────────────────
Route::middleware('auth')->group(function () {

    // Teacher routes
    Route::prefix('teacher')->group(function () {
        Route::get   ('students',                     [ProgressReportController::class, 'teacherStudents']);
        Route::get   ('students/{studentId}/reports', [ProgressReportController::class, 'teacherStudentReports']);
        Route::post  ('reports',                      [ProgressReportController::class, 'teacherStore']);
        Route::get   ('reports/{id}',                 [ProgressReportController::class, 'teacherShow']);
        Route::put   ('reports/{id}',                 [ProgressReportController::class, 'teacherUpdate']);
        Route::delete('reports/{id}',                 [ProgressReportController::class, 'teacherDestroy']);
    });

    // Parent routes
    Route::prefix('parent')->group(function () {
        Route::get('children',                          [ProgressReportController::class, 'parentChildren']);
        Route::get('children/{studentId}/reports',      [ProgressReportController::class, 'parentChildReports']);
    });

    // Admin dashboard routes
    Route::prefix('admin/dashboard')->group(function () {
        Route::get('stats',            [AdminDashboardController::class, 'stats']);
        Route::get('chart',            [AdminDashboardController::class, 'chart']);
        Route::get('upcoming-agenda',  [AdminDashboardController::class, 'upcomingAgenda']);
        Route::get('pending-students', [AdminDashboardController::class, 'pendingStudents']);
        Route::get('top-reports',      [AdminDashboardController::class, 'topReports']);
    });

    // Mitra routes
    Route::prefix('mitra')->group(function () {
        Route::get('dashboard', [MitraDashboardController::class, 'index']);
        Route::get('reports',   [MitraReportController::class, 'mitraReports']);
    });

    // Admin mitra report routes
    Route::prefix('admin/mitra')->group(function () {
        Route::get ('{partnerId}/reports',  [MitraReportController::class, 'reports']);
        Route::post('{partnerId}/reports',  [MitraReportController::class, 'store']);
        Route::delete('reports/{reportId}', [MitraReportController::class, 'destroy']);
        Route::get ('list',                 [MitraReportController::class, 'partners']);
    });

    // Admin progress routes
    Route::prefix('admin/progress')->group(function () {
        Route::get   ('options',                      [ProgressReportController::class, 'adminOptions']);
        Route::get   ('students',                     [ProgressReportController::class, 'adminStudents']);
        Route::get   ('students/{studentId}/reports', [ProgressReportController::class, 'adminStudentReports']);
        Route::get   ('reports',                      [ProgressReportController::class, 'adminReports']);
        Route::post  ('reports',                      [ProgressReportController::class, 'adminStore']);
        Route::put   ('reports/{id}',                 [ProgressReportController::class, 'adminUpdate']);
        Route::delete('reports/{id}',                 [ProgressReportController::class, 'adminDestroy']);
    });

    
});