<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;

class Leader extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'leaders';
    protected $fillable = ['nama', 'jabatan', 'deskripsi', 'poin', 'image_url'];
}