<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class SppPayment extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'spp_payments';

    protected $fillable = [
        'student_id',
        'student_name',
        'parent_id',
        'tahun',
        'bulan',
        'nominal',
        'status',
        'tanggal_bayar',
        'keterangan',
        'bukti_bayar',
    ];
}
