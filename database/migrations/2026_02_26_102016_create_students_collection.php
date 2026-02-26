<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('students', function (Blueprint $collection) {

            $collection->index('parent_id');
            $collection->index('program_id');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('students');
    }
};