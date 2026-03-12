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
        'password',
    ];

    protected $hidden = [
        'password',
    ];

    // ── Relasi ke collection roles ───────────────────────────
    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', '_id');
    }

    // ── Helper: ambil role_name lewat relasi ─────────────────
    public function getRoleName(): ?string
    {
        return $this->role?->role_name;
    }

    // ── Role checkers ────────────────────────────────────────
    public function isAdmin(): bool
    {
        return $this->getRoleName() === 'admin';
    }

    public function isTeacher(): bool
    {
        return in_array($this->getRoleName(), ['teacher', 'guru'], true);
    }

    public function isParents(): bool
    {
        return in_array($this->getRoleName(), ['parents', 'parent'], true);
    }

    public function isMitra(): bool
    {
        return $this->getRoleName() === 'mitra';
    }
}
