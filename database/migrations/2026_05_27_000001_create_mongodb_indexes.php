<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        // students: filter utama hampir semua query
        Schema::connection('mongodb')->table('students', function (Blueprint $collection) {
            $collection->index('enrollment_status');
            $collection->index('parent_id');
        });

        // progress_reports: filter + sort laporan, dan filter by guru
        Schema::connection('mongodb')->table('progress_reports', function (Blueprint $collection) {
            $collection->index(['student_id' => 1, 'date' => -1]);
            $collection->index('teacher_id');
        });

        // notifications: filter notifikasi belum dibaca milik user
        Schema::connection('mongodb')->table('notifications', function (Blueprint $collection) {
            $collection->index(['user_id' => 1, 'is_read' => 1]);
        });

        // partners: lookup mitra dari user
        Schema::connection('mongodb')->table('partners', function (Blueprint $collection) {
            $collection->index('user_id');
        });

        // teachers: lookup guru dari user
        Schema::connection('mongodb')->table('teachers', function (Blueprint $collection) {
            $collection->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->table('students', function (Blueprint $collection) {
            $collection->dropIndex(['enrollment_status' => 1]);
            $collection->dropIndex(['parent_id' => 1]);
        });

        Schema::connection('mongodb')->table('progress_reports', function (Blueprint $collection) {
            $collection->dropIndex(['student_id' => 1, 'date' => -1]);
            $collection->dropIndex(['teacher_id' => 1]);
        });

        Schema::connection('mongodb')->table('notifications', function (Blueprint $collection) {
            $collection->dropIndex(['user_id' => 1, 'is_read' => 1]);
        });

        Schema::connection('mongodb')->table('partners', function (Blueprint $collection) {
            $collection->dropIndex(['user_id' => 1]);
        });

        Schema::connection('mongodb')->table('teachers', function (Blueprint $collection) {
            $collection->dropIndex(['user_id' => 1]);
        });
    }
};
