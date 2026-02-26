<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('roles', function (Blueprint $collection) {

            $collection->index('role_name');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('roles');
    }
};
