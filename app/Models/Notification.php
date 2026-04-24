<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Skema dokumen notifications:
 * {
 *   _id        : ObjectId  — auto
 *   user_id    : string    — penerima (mengacu _id di users)
 *   type       : string    — 'pendaftaran'|'progress'|'agenda'|'info'|'system'
 *   title      : string    — judul singkat notifikasi
 *   message    : string    — isi pesan
 *   link       : string?   — route/tab tujuan saat diklik, mis. '?tab=siswa'
 *   is_read    : bool      — default false
 *   created_at : datetime  — auto (timestamps)
 *   updated_at : datetime  — auto (timestamps)
 * }
 */
class Notification extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'notifications';

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'link',
        'is_read',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'created_at' => 'datetime',
    ];

    // ── Relasi ke User ───────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', '_id');
    }

    // ── Scope: belum dibaca ──────────────────────────────────
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    // ── Scope: milik user tertentu ───────────────────────────
    public function scopeForUser($query, string $userId)
    {
        return $query->where('user_id', $userId);
    }

    // ── Helper statis: buat notifikasi ke 1 user ─────────────
    public static function send(
        string $userId,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): self {
        return self::create([
            'user_id' => $userId,
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'link'    => $link,
            'is_read' => false,
        ]);
    }

    // ── Helper statis: broadcast ke semua admin ──────────────
    public static function sendToRole(
        string $roleName,
        string $type,
        string $title,
        string $message,
        ?string $link = null
    ): void {
        // Step 1: Cari role_id berdasarkan role_name
        $role = \App\Models\Role::where('role_name', $roleName)->first();

        if (! $role) return;

        // Step 2: Cari semua user dengan role_id itu
        $users = \App\Models\User::where('role_id', (string) $role->_id)->get();

        foreach ($users as $user) {
            self::send((string) $user->_id, $type, $title, $message, $link);
        }
    }
}