<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Agenda extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'agenda';

    protected $fillable = [
        'user_id',
        'title',
        'event_date',
        'description',
        'location',
        'registration_link',
        'visibility',
        'image',
    ];

    public function scopeForVisibility($query, string $visibility)
    {
        if ($visibility === 'umum') {
            return $query->whereIn('visibility', ['umum', 'keduanya']);
        }
        if ($visibility === 'mitra') {
            return $query->whereIn('visibility', ['mitra', 'keduanya']);
        }
        return $query;
    }
}
