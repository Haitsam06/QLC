<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Ambil notifikasi milik user yang login (max 30, terbaru dulu).
     */
    public function index(): JsonResponse
    {
        $userId = (string) Auth::id();

        $notifications = Notification::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->limit(30)
            ->get()
            ->map(fn($n) => [
                'id'         => (string) $n->_id,
                'type'       => $n->type,
                'title'      => $n->title,
                'message'    => $n->message,
                'link'       => $n->link,
                'is_read'    => $n->is_read,
                'created_at' => $n->created_at?->diffForHumans() ?? '-',
            ]);

        $unread_count = Notification::forUser($userId)->unread()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unread_count,
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Tandai satu notifikasi sebagai sudah dibaca.
     */
    public function markAsRead(string $id): JsonResponse
    {
        $userId = (string) Auth::id();

        $notif = Notification::forUser($userId)->find($id);

        if (! $notif) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan.'], 404);
        }

        $notif->update(['is_read' => true]);

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    /**
     * PATCH /api/notifications/read-all
     * Tandai semua notifikasi user sebagai sudah dibaca.
     */
    public function markAllAsRead(): JsonResponse
    {
        $userId = (string) Auth::id();

        Notification::forUser($userId)
            ->unread()
            ->update(['is_read' => true]);

        return response()->json(['message' => 'Semua notifikasi sudah dibaca.']);
    }

    /**
     * DELETE /api/notifications/{id}
     * Hapus satu notifikasi.
     */
    public function destroy(string $id): JsonResponse
    {
        $userId = (string) Auth::id();

        $notif = Notification::forUser($userId)->find($id);

        if (! $notif) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan.'], 404);
        }

        $notif->delete();

        return response()->json(['message' => 'Notifikasi dihapus.']);
    }

    /**
     * DELETE /api/notifications
     * Hapus semua notifikasi user.
     */
    public function destroyAll(): JsonResponse
    {
        $userId = (string) Auth::id();

        Notification::forUser($userId)->delete();

        return response()->json(['message' => 'Semua notifikasi dihapus.']);
    }
}