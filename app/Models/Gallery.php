<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Gallery extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'gallery';

    const CREATED_AT = 'uploaded_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'title',
        'media_url',
        'type',
    ];
}