<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $connection = 'mongodb';

    protected $collection = 'users';

    protected $fillable = [

        '_id',

        'role_id',

        'username',

        'email',

        'password',

        'photo',
    ];

    protected $hidden = [

        'password',
    ];

    /*
    |────────────────────────────────────────────
    | RELATION ROLE
    |────────────────────────────────────────────
    */
    public function role()
    {
        return $this->belongsTo(

            Role::class,

            'role_id',

            '_id'
        );
    }

    /*
    |────────────────────────────────────────────
    | GET ROLE NAME
    |────────────────────────────────────────────
    */
    public function getRoleName(): ?string
    {
        return $this->role?->role_name;
    }

    /*
    |────────────────────────────────────────────
    | ROLE CHECKERS
    |────────────────────────────────────────────
    */
    public function isAdmin(): bool
    {
        return $this->getRoleName() === 'admin';
    }

    public function isTeacher(): bool
    {
        return in_array(

            $this->getRoleName(),

            ['teacher', 'guru'],

            true
        );
    }

    public function isParents(): bool
    {
        return in_array(

            $this->getRoleName(),

            ['parents', 'parent'],

            true
        );
    }

    public function isMitra(): bool
    {
        return $this->getRoleName() === 'mitra';
    }
}