<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up()
    {
        // Koleksi Pilar/Fondasi
        Schema::connection('mongodb')->create('foundations', function (Blueprint $collection) {
            $collection->index('title');
        });

        // Koleksi Pimpinan/Pengurus
        Schema::connection('mongodb')->create('leaders', function (Blueprint $collection) {
            $collection->index('nama');
            $collection->index('jabatan');
        });

        // Koleksi Program Layanan
        Schema::connection('mongodb')->create('programs', function (Blueprint $collection) {
            $collection->index('name');
        });

        // Koleksi Galeri
        Schema::connection('mongodb')->create('gallery', function (Blueprint $collection) {
            $collection->index('type'); // Index untuk membedakan Photo/Video dengan cepat
            $collection->index('uploaded_at');
        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('foundations');
        Schema::connection('mongodb')->dropIfExists('leaders');
        Schema::connection('mongodb')->dropIfExists('programs');
        Schema::connection('mongodb')->dropIfExists('gallery');
    }
};