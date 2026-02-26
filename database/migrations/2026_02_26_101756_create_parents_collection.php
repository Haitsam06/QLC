<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('parents', function (Blueprint $collection) {

            $collection->index('user_id');
            $collection->index('phone');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('parents');
    }
};
