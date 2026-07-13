<?php

namespace App\Models;

use MongoDB\Laravel\Auth\User as Authenticatable;

class User extends Authenticatable
{
    protected $connection = 'mongodb';

    protected $collection = 'users';

    protected $fillable = [

        'role_id',

        'username',

        'email',

        'password',

        'photo',
    ];

    protected $hidden = [

        'password',

        'remember_token',
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
        return $this->getRoleName() === 'teacher';
    }

    public function isParents(): bool
    {
        return $this->getRoleName() === 'parents';
    }

    public function isMitra(): bool
    {
        return $this->getRoleName() === 'mitra';
    }

    /**
     * Get the user's profile photo URL dynamically.
     *
     * @param string|null $value
     * @return string|null
     */
    public function getPhotoAttribute(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }
        return \Illuminate\Support\Facades\Storage::url($value);
    }
}