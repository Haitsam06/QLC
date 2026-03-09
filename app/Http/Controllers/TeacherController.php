<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class TeacherController extends Controller
{
    private $teachers;
    private $users;
    private const ROLE_TEACHER = 'RL02';

    public function __construct()
    {
        $client         = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db             = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->teachers = $db->selectCollection('teachers');
        $this->users    = $db->selectCollection('users');

        // keep $this->collection pointing to teachers for backward compat
        $this->collection = $this->teachers;
    }

    /* ─────────────────────────────────────────────
       GET /api/teachers
       Query params: search, spesialisasi, per_page, page
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $search       = $request->query('search', '');
        $spesialisasi = $request->query('spesialisasi', '');
        $perPage      = (int) $request->query('per_page', 10);
        $page         = (int) $request->query('page', 1);
        $skip         = ($page - 1) * $perPage;

        // Build filter
        $filter = [];

        if (!empty($search)) {
            $filter['$or'] = [
                ['nama_guru'    => ['$regex' => $search, '$options' => 'i']],
                ['phone'        => ['$regex' => $search, '$options' => 'i']],
                ['spesialisasi' => ['$regex' => $search, '$options' => 'i']],
            ];
        }

        if (!empty($spesialisasi)) {
            $filter['spesialisasi'] = $spesialisasi;
        }

        $total   = $this->collection->countDocuments($filter);
        $cursor  = $this->collection->find($filter, [
            'skip'  => $skip,
            'limit' => $perPage,
            'sort'  => ['nama_guru' => 1],
        ]);

        $teachers = [];
        foreach ($cursor as $doc) {
            $teachers[] = $this->formatTeacher($doc);
        }

        return response()->json([
            'success' => true,
            'data'    => $teachers,
            'meta'    => [
                'total'    => $total,
                'page'     => $page,
                'per_page' => $perPage,
                'last_page'=> (int) ceil($total / $perPage),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────
       POST /api/teachers
       Alur:
         1. Validasi input
         2. Cek duplikat username & phone
         3. Insert ke collection `users`  (role_id = RL02)
         4. Insert ke collection `teachers` (user_id = id user baru)
         5. Rollback user jika insert teacher gagal
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_guru'    => 'required|string|max:100',
            'phone'        => 'required|string|max:20',
            'spesialisasi' => 'required|string|max:100',
            'username'     => 'required|string|min:4|max:50|alpha_num',
            'password'     => 'required|string|min:8|max:100',
            'email'        => 'nullable|email|max:100',
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
        if ($this->teachers->findOne(['phone' => $request->phone])) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah terdaftar.',
            ], 409);
        }

        // ── 1. Insert ke users ──
        $userDoc = [
            'role_id'    => self::ROLE_TEACHER,
            'username'   => $request->username,
            'password'   => Hash::make($request->password),
            'email'      => $request->email ?? null,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $userResult = $this->users->insertOne($userDoc);
        $userId     = (string) $userResult->getInsertedId();

        // ── 2. Insert ke teachers ──
        try {
            $teacherDoc = [
                'user_id'      => $userId,
                'nama_guru'    => $request->nama_guru,
                'phone'        => $request->phone,
                'spesialisasi' => $request->spesialisasi,
                'created_at'   => new \MongoDB\BSON\UTCDateTime(),
                'updated_at'   => new \MongoDB\BSON\UTCDateTime(),
            ];

            $teacherResult = $this->teachers->insertOne($teacherDoc);
            $teacherDoc['_id'] = $teacherResult->getInsertedId();

        } catch (\Exception $e) {
            // ── Rollback: hapus user yang sudah dibuat ──
            $this->users->deleteOne(['_id' => new ObjectId($userId)]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data guru. User telah di-rollback.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Guru berhasil ditambahkan.',
            'data'    => $this->formatTeacher($teacherDoc),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       GET /api/teachers/{id}
    ───────────────────────────────────────────── */
    public function show(string $id)
    {
        try {
            $doc = $this->collection->findOne(['_id' => new ObjectId($id)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Guru tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->formatTeacher($doc)]);
    }

    /* ─────────────────────────────────────────────
       PUT /api/teachers/{id}
    ───────────────────────────────────────────── */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'user_id'      => 'nullable|string',
            'nama_guru'    => 'required|string|max:100',
            'phone'        => 'required|string|max:20',
            'spesialisasi' => 'required|string|max:100',
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

        // Check duplicate phone (exclude self)
        $exists = $this->collection->findOne([
            'phone' => $request->phone,
            '_id'   => ['$ne' => $oid],
        ]);
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah digunakan guru lain.',
            ], 409);
        }

        $result = $this->collection->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'user_id'      => $request->user_id ?? null,
                'nama_guru'    => $request->nama_guru,
                'phone'        => $request->phone,
                'spesialisasi' => $request->spesialisasi,
                'updated_at'   => new \MongoDB\BSON\UTCDateTime(),
            ]]
        );

        if ($result->getMatchedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Guru tidak ditemukan.'], 404);
        }

        $updated = $this->collection->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Data guru berhasil diperbarui.',
            'data'    => $this->formatTeacher($updated),
        ]);
    }

    /* ─────────────────────────────────────────────
       DELETE /api/teachers/{id}
       Menghapus teacher + user yang terhubung
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        // Ambil data teacher dulu untuk mendapatkan user_id
        $teacher = $this->teachers->findOne(['_id' => $oid]);

        if (!$teacher) {
            return response()->json(['success' => false, 'message' => 'Guru tidak ditemukan.'], 404);
        }

        // Hapus teacher
        $this->teachers->deleteOne(['_id' => $oid]);

        // Hapus user yang terhubung (jika ada)
        if (!empty($teacher['user_id'])) {
            try {
                $this->users->deleteOne(['_id' => new ObjectId($teacher['user_id'])]);
            } catch (\Exception $e) {
                // user_id mungkin bukan ObjectId valid, coba string match
                $this->users->deleteOne(['_id' => $teacher['user_id']]);
            }
        }

        return response()->json(['success' => true, 'message' => 'Guru dan akun pengguna berhasil dihapus.']);
    }

    /* ─────────────────────────────────────────────
       GET /api/teachers/spesialisasi
       Returns unique specialization list for filter dropdown
    ───────────────────────────────────────────── */
    public function spesialisasiList()
    {
        $list = $this->collection->distinct('spesialisasi', []);
        sort($list);

        return response()->json(['success' => true, 'data' => $list]);
    }

    /* ─────────────────────────────────────────────
       Helper: format MongoDB doc → array
    ───────────────────────────────────────────── */
    private function formatTeacher($doc): array
    {
        return [
            'id'           => (string) $doc['_id'],
            'user_id'      => $doc['user_id'] ?? null,
            'nama_guru'    => $doc['nama_guru'],
            'phone'        => $doc['phone'],
            'spesialisasi' => $doc['spesialisasi'],
            'created_at'   => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                : null,
        ];
    }
}