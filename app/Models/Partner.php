<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Partner extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'partners';

    protected $fillable = [
        'user_id',
        'institution_name',
        'contact_person',
        'phone',
        'mou_file_url',
        'status',
    ];
}
