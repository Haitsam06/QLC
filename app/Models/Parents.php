<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Parents extends Model
{
    // Menentukan koneksi database
    protected $connection = 'mongodb';
    
    // Menentukan nama collection
    protected $collection = 'parents';

    // Kolom yang diizinkan untuk diisi secara massal
    protected $fillable = [
        'user_id',
        'parent_name',
        'phone',
        'address',
    ];

    // (Opsional) Relasi balik ke collection users
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', '_id');
    }
}