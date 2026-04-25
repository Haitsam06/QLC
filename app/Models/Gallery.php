<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Gallery extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'galleries';

    protected $fillable = [
        'title',
        'media_url',
        'type'
    ];
}