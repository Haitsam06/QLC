<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('users', function (Blueprint $collection) {

            $collection->index('role_id');
            $collection->index('username');
            $collection->index('email');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('users');
    }
};
