<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use MongoDB\Client as MongoClient;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        if ($user) {

            $user = \App\Models\User::find(
                $user->_id
            );
        }

        // Ambil parent_name dari collection parents jika user login
        $displayName = null;
        $roleName = null;
        if ($user) {
            $client = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
            $db = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));

            // Coba cari di collection parents dulu
            $parent = $db->selectCollection('parents')->findOne([
                'user_id' => (string) $user->_id,
            ]);

            if ($parent) {
                $displayName = $parent['parent_name'] ?? null;
            }

            // Fallback ke username jika tidak ada di parents
            if (!$displayName) {
                $displayName = $user->username;
            }

            // Muat relasi role agar getDashboardRoute di frontend bisa berjalan
            $user->load('role');
            $roleName = $user->getRoleName();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    '_id' => (string) $user->_id,
                    'name' => $displayName,
                    'username' => $user->username,
                    'email' => $user->email,
                    'photo' => $user->photo
                        ? $user->photo . '?v=' . time()
                        : null,
                    'role_id' => (string) $user->role_id,
                    'role' => $roleName,
                ] : null,
            ],
        ];
    }
}