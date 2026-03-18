<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\InfoController;
use App\Http\Controllers\AgendaController;
use App\Http\Controllers\MitraController;
use App\Http\Controllers\Teachers\ProgressReportController;

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

// ── Info ──────────────────────────────────────────────────────────────────
Route::prefix('info')->group(function () {
    // Profile (single record)
    Route::get ('profile', [InfoController::class, 'profileShow']);
    Route::post('profile', [InfoController::class, 'profileUpsert']);

    // Programs
    Route::get   ('programs',      [InfoController::class, 'programIndex']);
    Route::post  ('programs',      [InfoController::class, 'programStore']);
    Route::post  ('programs/{id}', [InfoController::class, 'programUpdate']);
    Route::delete('programs/{id}', [InfoController::class, 'programDestroy']);

    // Gallery
    Route::get   ('gallery',      [InfoController::class, 'galleryIndex']);
    Route::post  ('gallery',      [InfoController::class, 'galleryStore']);
    Route::post  ('gallery/{id}', [InfoController::class, 'galleryUpdate']);
    Route::delete('gallery/{id}', [InfoController::class, 'galleryDestroy']);
});

// ── Agenda ────────────────────────────────────────────────────────────────
Route::get('agenda/upcoming', [AgendaController::class, 'upcoming']);
Route::apiResource('agenda', AgendaController::class)
    ->parameters(['agenda' => 'id']);

// ── Mitra ─────────────────────────────────────────────────────────────────
Route::apiResource('partners', MitraController::class)
    ->parameters(['partners' => 'id']);

// ── Progress Reports (Teacher) ────────────────────────────────────────────
// Middleware 'auth' (session-based, Laravel Breeze).
Route::middleware('auth')->prefix('teacher')->group(function () {
    Route::get ('students',                     [ProgressReportController::class, 'students']);
    Route::get ('students/{studentId}/reports', [ProgressReportController::class, 'studentReports']);
    Route::post('reports',                      [ProgressReportController::class, 'store']);
    Route::get ('reports/{id}',                 [ProgressReportController::class, 'show']);
});