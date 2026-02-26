<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('progress_reports', function (Blueprint $collection) {

            $collection->index('student_id');
            $collection->index('teacher_id');
            $collection->index('date');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('progress_reports');
    }
};