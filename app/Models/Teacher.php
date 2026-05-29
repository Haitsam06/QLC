<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Teacher extends Model
{
    protected $connection = 'mongodb';

    protected $collection = 'teachers';

    protected $fillable = [
        'user_id',
        'nama_guru',
        'phone',
        'email',
        'bidang',
    ];
}