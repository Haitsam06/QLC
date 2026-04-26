<?php
namespace App\Models;
use MongoDB\Laravel\Eloquent\Model;

class Profile extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'profiles';
    protected $fillable = [
        'name',
        'hero_title',
        'logo',
        'tagline',
        'history',
        'vision',
        'mission',
        'address',
        'whatsapp',
        'email',
        'social_media',
        'established_year',
        'main_focus'
    ];
    protected $casts = [
        'social_media' => 'array',
    ];
}