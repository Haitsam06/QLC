<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('gallery', function (Blueprint $collection) {

            $collection->index('type');
            $collection->index('uploaded_at');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('gallery');
    }
};