<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Program extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'programs';

    protected $fillable = [
        'name',
        'description',
        'target_audience',
        'duration',
        'image_url'
    ];
}