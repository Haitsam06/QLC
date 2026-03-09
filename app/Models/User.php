<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Auth\Authenticatable as AuthenticatableTrait;

class User extends Model implements Authenticatable
{
    use AuthenticatableTrait;

    protected $connection = 'mongodb';
    protected $collection = 'users';
    protected $fillable = [
        '_id',
        'role_id',
        'username',
        'email',
        'password'
    ];

    protected $hidden = [
        'password'
    ];
}