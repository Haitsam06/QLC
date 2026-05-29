<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class MitraReport extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'mitra_reports';

    protected $fillable = [
        'partner_id',
        'title',
        'date',
        'description',
        'file_url',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'uploaded_by',
    ];
}
