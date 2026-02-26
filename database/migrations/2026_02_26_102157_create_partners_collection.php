<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('partners', function (Blueprint $collection) {

            $collection->index('institution_name');
            $collection->index('status');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('partners');
    }
};