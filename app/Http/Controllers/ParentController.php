<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class ParentController extends Controller
{
    private $parents;
    private $users;
    private const ROLE_PARENT = 'RL03';

    public function __construct()
    {
        $client        = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db            = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->parents = $db->selectCollection('parents');
        $this->users   = $db->selectCollection('users');
    }

    /* ─────────────────────────────────────────────
       GET /api/parents
       Query params: search, page, per_page
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $search  = $request->query('search', '');
        $perPage = (int) $request->query('per_page', 10);
        $page    = (int) $request->query('page', 1);
        $skip    = ($page - 1) * $perPage;

        $filter = [];
        if (!empty($search)) {
            $filter['$or'] = [
                ['parent_name' => ['$regex' => $search, '$options' => 'i']],
                ['phone'       => ['$regex' => $search, '$options' => 'i']],
                ['address'     => ['$regex' => $search, '$options' => 'i']],
            ];
        }

        $total  = $this->parents->countDocuments($filter);
        $cursor = $this->parents->find($filter, [
            'skip'  => $skip,
            'limit' => $perPage,
            'sort'  => ['parent_name' => 1],
        ]);

        $data = [];
        foreach ($cursor as $doc) {
            $data[] = $this->format($doc);
        }

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────
       POST /api/parents
       Alur:
         1. Validasi input
         2. Cek duplikat username, email, phone
         3. Insert ke `users`  (role_id = RL03)
         4. Insert ke `parents` (user_id = id user baru)
         5. Rollback user jika insert parents gagal
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'parent_name' => 'required|string|max:100',
            'phone'       => 'required|string|max:20',
            'address'     => 'required|string|max:255',
            'username'    => 'required|string|min:4|max:50|alpha_num',
            'password'    => 'required|string|min:8|max:100',
            'email'       => 'nullable|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        // ── Cek duplikat username ──
        if ($this->users->findOne(['username' => $request->username])) {
            return response()->json([
                'success' => false,
                'message' => 'Username sudah digunakan.',
            ], 409);
        }

        // ── Cek duplikat email (jika diisi) ──
        if ($request->email && $this->users->findOne(['email' => $request->email])) {
            return response()->json([
                'success' => false,
                'message' => 'Email sudah digunakan.',
            ], 409);
        }

        // ── Cek duplikat phone ──
        if ($this->parents->findOne(['phone' => $request->phone])) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah terdaftar.',
            ], 409);
        }

        // ── 1. Insert ke users ──
        $userDoc = [
            'role_id'    => self::ROLE_PARENT,
            'username'   => $request->username,
            'password'   => Hash::make($request->password),
            'email'      => $request->email ?? null,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $userResult = $this->users->insertOne($userDoc);
        $userId     = (string) $userResult->getInsertedId();

        // ── 2. Insert ke parents ──
        try {
            $parentDoc = [
                'user_id'     => $userId,
                'parent_name' => $request->parent_name,
                'phone'       => $request->phone,
                'address'     => $request->address,
                'created_at'  => new \MongoDB\BSON\UTCDateTime(),
                'updated_at'  => new \MongoDB\BSON\UTCDateTime(),
            ];

            $result             = $this->parents->insertOne($parentDoc);
            $parentDoc['_id']   = $result->getInsertedId();

        } catch (\Exception $e) {
            // ── Rollback: hapus user yang sudah dibuat ──
            $this->users->deleteOne(['_id' => new ObjectId($userId)]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data wali murid. Akun telah di-rollback.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Wali murid berhasil ditambahkan.',
            'data'    => $this->format($parentDoc),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       GET /api/parents/{id}
    ───────────────────────────────────────────── */
    public function show(string $id)
    {
        try {
            $doc = $this->parents->findOne(['_id' => new ObjectId($id)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->format($doc)]);
    }

    /* ─────────────────────────────────────────────
       PUT /api/parents/{id}
       Hanya update data parents (bukan akun user)
    ───────────────────────────────────────────── */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'parent_name' => 'required|string|max:100',
            'phone'       => 'required|string|max:20',
            'address'     => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors'  => $validator->errors(),
            ], 422);
        }

        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        // Cek duplikat phone (kecuali diri sendiri)
        $exists = $this->parents->findOne([
            'phone' => $request->phone,
            '_id'   => ['$ne' => $oid],
        ]);
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah digunakan wali murid lain.',
            ], 409);
        }

        $result = $this->parents->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'parent_name' => $request->parent_name,
                'phone'       => $request->phone,
                'address'     => $request->address,
                'updated_at'  => new \MongoDB\BSON\UTCDateTime(),
            ]]
        );

        if ($result->getMatchedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        $updated = $this->parents->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Data wali murid berhasil diperbarui.',
            'data'    => $this->format($updated),
        ]);
    }

    /* ─────────────────────────────────────────────
       DELETE /api/parents/{id}
       Hapus parents + user yang terhubung
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $parent = $this->parents->findOne(['_id' => $oid]);

        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        // Hapus parents
        $this->parents->deleteOne(['_id' => $oid]);

        // Hapus user yang terhubung
        if (!empty($parent['user_id'])) {
            try {
                $this->users->deleteOne(['_id' => new ObjectId($parent['user_id'])]);
            } catch (\Exception $e) {
                $this->users->deleteOne(['_id' => $parent['user_id']]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Wali murid dan akun pengguna berhasil dihapus.',
        ]);
    }

    /* ─────────────────────────────────────────────
       Helper: format MongoDB doc → array
    ───────────────────────────────────────────── */
    private function format($doc): array
    {
        return [
            'id'          => (string) $doc['_id'],
            'user_id'     => $doc['user_id'] ?? null,
            'parent_name' => $doc['parent_name'],
            'phone'       => $doc['phone'],
            'address'     => $doc['address'],
            'created_at'  => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                : null,
        ];
    }
}