<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\InfoController;

// ── Teachers ──
Route::prefix('teachers')->group(function () {
    Route::get('spesialisasi', [TeacherController::class, 'spesialisasiList']);
    Route::apiResource('/', TeacherController::class)->parameters(['' => 'id']);
});

// ── Parents ──
Route::apiResource('parents', ParentController::class)->parameters(['parents' => 'id']);

// ── Students ──
Route::get('students/options', [StudentController::class, 'options']);
Route::apiResource('students', StudentController::class)->parameters(['students' => 'id']);

// ── Info ──
Route::prefix('info')->group(function () {
    // Profile (single record)
    Route::get ('profile', [InfoController::class, 'profileShow']);
    Route::post ('profile', [InfoController::class, 'profileUpsert']);

    // Programs
    Route::get   ('programs',     [InfoController::class, 'programIndex']);
    Route::post  ('programs',     [InfoController::class, 'programStore']);
    Route::post  ('programs/{id}',[InfoController::class, 'programUpdate']);   // method-spoofing
    Route::delete('programs/{id}',[InfoController::class, 'programDestroy']);

    // Gallery
    Route::get   ('gallery',     [InfoController::class, 'galleryIndex']);
    Route::post  ('gallery',     [InfoController::class, 'galleryStore']);
    Route::post  ('gallery/{id}',[InfoController::class, 'galleryUpdate']);    // method-spoofing
    Route::delete('gallery/{id}',[InfoController::class, 'galleryDestroy']);
});