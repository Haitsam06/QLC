<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class ProgressReport extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'progress_reports';

    protected $fillable = [
        'student_id',
        'teacher_id',
        'date',
        'attendance',
        'report_type',
        'kualitas',
        'hafalan_target',
        'hafalan_achievement',
        'teacher_notes',
        'created_by',
    ];
}
