<?php

use Illuminate\Support\Facades\Schema;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up()
    {
        Schema::connection('mongodb')->create('agenda', function (Blueprint $collection) {

            $collection->index('teacher_id');
            $collection->index('event_date');

        });
    }

    public function down()
    {
        Schema::connection('mongodb')->dropIfExists('agenda');
    }
};