<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Student extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'students';

    protected $fillable = [
        'parent_id',
        'parent_name',
        'program_id',
        'nama',
        'usia',
        'tempat_lahir',
        'tanggal_lahir',
        'enrollment_status',
        'bukti_pembayaran',
        'foto',
    ];
}
