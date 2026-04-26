<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;

class Foundation extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'foundations';
    protected $fillable = ['title', 'description'];
}