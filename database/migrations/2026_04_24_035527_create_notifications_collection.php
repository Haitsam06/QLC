<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        Schema::connection('mongodb')->create('notifications', function (Blueprint $collection) {
            // Index utama untuk query cepat
            $collection->index('user_id');       // penerima notifikasi
            $collection->index('is_read');       // filter belum dibaca
            $collection->index('created_at');    // sorting terbaru
            $collection->index('type');          // filter per tipe
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('notifications');
    }
};