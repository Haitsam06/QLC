<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class ParentController extends Controller
{
    private $parents;
    private $users;

    private const ROLE_PARENT = 'RL03';

    public function __construct()
    {
        $client = new MongoClient(
            env('MONGODB_URI', 'mongodb://localhost:27017')
        );

        $db = $client->selectDatabase(
            env('MONGODB_DATABASE', 'educonnect')
        );

        $this->parents = $db->selectCollection('parents');
        $this->users = $db->selectCollection('users');
    }

    /* ─────────────────────────────────────────────
       GET /api/parents
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $search = $request->query('search', '');
        $perPage = (int) $request->query('per_page', 10);
        $page = (int) $request->query('page', 1);

        $skip = ($page - 1) * $perPage;

        $filter = [];

        if (!empty($search)) {

            $filter['$or'] = [
                [
                    'parent_name' => [
                        '$regex' => $search,
                        '$options' => 'i'
                    ]
                ],

                [
                    'phone' => [
                        '$regex' => $search,
                        '$options' => 'i'
                    ]
                ],

                [
                    'address' => [
                        '$regex' => $search,
                        '$options' => 'i'
                    ]
                ],
            ];
        }

        $total = $this->parents->countDocuments($filter);

        $cursor = $this->parents->find(
            $filter,
            [
                'skip' => $skip,
                'limit' => $perPage,
                'sort' => [
                    'parent_name' => 1
                ],
            ]
        );

        $data = [];

        foreach ($cursor as $doc) {
            $data[] = $this->format($doc);
        }

        return response()->json([
            'success' => true,

            'data' => $data,

            'meta' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────
       POST /api/parents
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [

                'parent_name' => 'required|string|max:100',
                'phone' => 'required|string|max:20',
                'address' => 'required|string|max:255',

                'username' => 'required|string|min:4|max:50|alpha_num',
                'password' => 'required|string|min:8|max:100',

                'email' => 'nullable|email|max:100',
            ]
        );

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        // duplicate username
        if (
            $this->users->findOne([
                'username' => $request->username
            ])
        ) {

            return response()->json([
                'success' => false,
                'message' => 'Username sudah digunakan.',
            ], 409);
        }

        // duplicate email
        if (
            $request->email &&
            $this->users->findOne([
                'email' => $request->email
            ])
        ) {

            return response()->json([
                'success' => false,
                'message' => 'Email sudah digunakan.',
            ], 409);
        }

        // duplicate phone
        if (
            $this->parents->findOne([
                'phone' => $request->phone
            ])
        ) {

            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah terdaftar.',
            ], 409);
        }

        // insert users
        $userDoc = [

            'role_id' => self::ROLE_PARENT,

            'username' => $request->username,

            'password' => Hash::make($request->password),

            'email' => $request->email ?? null,

            'photo' => null,

            'created_at' => new \MongoDB\BSON\UTCDateTime(),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $userResult = $this->users->insertOne($userDoc);

        $userId = (string) $userResult->getInsertedId();

        // insert parents
        try {

            $parentDoc = [

                'user_id' => $userId,

                'parent_name' => $request->parent_name,
                'phone' => $request->phone,
                'address' => $request->address,

                'created_at' => new \MongoDB\BSON\UTCDateTime(),
                'updated_at' => new \MongoDB\BSON\UTCDateTime(),
            ];

            $result = $this->parents->insertOne($parentDoc);

            $parentDoc['_id'] = $result->getInsertedId();

        } catch (\Exception $e) {

            // rollback user
            $this->users->deleteOne([
                '_id' => new ObjectId($userId)
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data wali murid.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Wali murid berhasil ditambahkan.',
            'data' => $this->format($parentDoc),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       GET /api/parents/{id}
    ───────────────────────────────────────────── */
    public function show(string $id)
    {
        try {

            $doc = $this->parents->findOne([
                '_id' => new ObjectId($id)
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'ID tidak valid.'
            ], 400);
        }

        if (!$doc) {

            return response()->json([
                'success' => false,
                'message' => 'Wali murid tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $this->format($doc),
        ]);
    }

    /* ─────────────────────────────────────────────
       PUT /api/parents/{id}
    ───────────────────────────────────────────── */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make(
            $request->all(),
            [

                'parent_name' => 'required|string|max:100',
                'phone' => 'required|string|max:20',
                'address' => 'required|string|max:255',
            ]
        );

        if ($validator->fails()) {

            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        try {

            $oid = new ObjectId($id);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'ID tidak valid.'
            ], 400);
        }

        // duplicate phone
        $exists = $this->parents->findOne([

            'phone' => $request->phone,

            '_id' => [
                '$ne' => $oid
            ],
        ]);

        if ($exists) {

            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah digunakan wali murid lain.',
            ], 409);
        }

        $result = $this->parents->updateOne(

            [
                '_id' => $oid
            ],

            [
                '$set' => [

                    'parent_name' => $request->parent_name,
                    'phone' => $request->phone,
                    'address' => $request->address,

                    'updated_at' => new \MongoDB\BSON\UTCDateTime(),
                ]
            ]
        );

        if ($result->getMatchedCount() === 0) {

            return response()->json([
                'success' => false,
                'message' => 'Wali murid tidak ditemukan.'
            ], 404);
        }

        $updated = $this->parents->findOne([
            '_id' => $oid
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data wali murid berhasil diperbarui.',
            'data' => $this->format($updated),
        ]);
    }

    /* ─────────────────────────────────────────────
       UPDATE PROFILE SENDIRI (PARENTS)
    ───────────────────────────────────────────── */
    public function updateOwnProfile(Request $request)
    {
        $user = Auth::user();

        if (!$user) {

            return back()->withErrors([
                'general' => 'Unauthorized'
            ]);
        }

        $validator = Validator::make(
            $request->all(),
            [

                // parent
                'parent_name' => 'required|string|max:100',
                'phone' => 'required|string|max:20',
                'address' => 'required|string|max:255',

                // user
                'username' => 'required|string|min:4|max:50|alpha_num',
                'email' => 'nullable|email|max:100',

                // photo
                'photo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            ]
        );

        // VALIDATION ERROR
        if ($validator->fails()) {

            return back()
                ->withErrors($validator)
                ->withInput();
        }

        // DUPLICATE USERNAME
        $existsUsername = $this->users->findOne([

            'username' => $request->username,

            '_id' => [
                '$ne' => new ObjectId($user->_id)
            ],
        ]);

        if ($existsUsername) {

            return back()->withErrors([
                'username' => 'Username sudah digunakan.'
            ]);
        }

        // DUPLICATE EMAIL
        if ($request->email) {

            $existsEmail = $this->users->findOne([

                'email' => $request->email,

                '_id' => [
                    '$ne' => new ObjectId($user->_id)
                ],
            ]);

            if ($existsEmail) {

                return back()->withErrors([
                    'email' => 'Email sudah digunakan.'
                ]);
            }
        }

        // CARI PARENT
        $parent = $this->parents->findOne([
            'user_id' => (string) $user->_id
        ]);

        if (!$parent) {

            return back()->withErrors([
                'general' => 'Data wali murid tidak ditemukan.'
            ]);
        }

        // PHOTO
        $photoUrl = $user->photo ?? null;

        if ($request->hasFile('photo')) {

            // DELETE OLD PHOTO
            if (
                $photoUrl &&
                str_contains($photoUrl, '/storage/')
            ) {

                $parsedPath = parse_url(
                    $photoUrl,
                    PHP_URL_PATH
                );

                if ($parsedPath) {

                    $oldPath = str_replace(
                        '/storage/',
                        '',
                        $parsedPath
                    );

                    Storage::disk('public')
                        ->delete($oldPath);
                }
            }

            // STORE NEW PHOTO
            $path = $request
                ->file('photo')
                ->store('profile', 'public');

            $photoUrl = URL::to(
                Storage::url($path)
            );
        }

        // UPDATE USERS
        $this->users->updateOne(

            [
                '_id' => new ObjectId($user->_id)
            ],

            [
                '$set' => [

                    'username' => $request->username,
                    'email' => $request->email,
                    'photo' => $photoUrl,

                    'updated_at' => new \MongoDB\BSON\UTCDateTime(),
                ]
            ]
        );

        // UPDATE PARENTS
        $this->parents->updateOne(

            [
                '_id' => $parent['_id']
            ],

            [
                '$set' => [

                    'parent_name' => $request->parent_name,
                    'phone' => $request->phone,
                    'address' => $request->address,

                    'updated_at' => new \MongoDB\BSON\UTCDateTime(),
                ]
            ]
        );

        return back()->with(
            'success',
            'Profil berhasil diperbarui.'
        );

    }

    /* ─────────────────────────────────────────────
       POST /api/parents/{id}/reset-password
    ───────────────────────────────────────────── */
    public function resetPassword(string $id)
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $parent = $this->parents->findOne(['_id' => $oid]);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        if (empty($parent['user_id'])) {
            return response()->json(['success' => false, 'message' => 'Akun wali murid tidak ditemukan.'], 404);
        }

        try { $userId = new ObjectId($parent['user_id']); }
        catch (\Exception $e) { $userId = $parent['user_id']; }

        $this->users->updateOne(
            ['_id' => $userId],
            ['$set' => [
                'password'   => Hash::make('mieayambakso'),
                'updated_at' => new UTCDateTime(),
            ]]
        );

        return response()->json(['success' => true, 'message' => 'Password wali murid berhasil direset ke default.']);
    }

    /* ─────────────────────────────────────────────
       DELETE /api/parents/{id}
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try {

            $oid = new ObjectId($id);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'message' => 'ID tidak valid.'
            ], 400);
        }

        $parent = $this->parents->findOne([
            '_id' => $oid
        ]);

        if (!$parent) {

            return response()->json([
                'success' => false,
                'message' => 'Wali murid tidak ditemukan.'
            ], 404);
        }

        // delete parent
        $this->parents->deleteOne([
            '_id' => $oid
        ]);

        // delete user
        if (!empty($parent['user_id'])) {

            try {

                $this->users->deleteOne([
                    '_id' => new ObjectId($parent['user_id'])
                ]);

            } catch (\Exception $e) {

                $this->users->deleteOne([
                    '_id' => $parent['user_id']
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Wali murid dan akun berhasil dihapus.',
        ]);
    }

    /* ─────────────────────────────────────────────
       FORMAT DOC
    ───────────────────────────────────────────── */
    private function format($doc): array
    {
        return [

            'id' => (string) $doc['_id'],

            'user_id' => $doc['user_id'] ?? null,

            'parent_name' => $doc['parent_name'],
            'phone' => $doc['phone'],
            'address' => $doc['address'],

            'created_at' => isset($doc['created_at'])

                ? $doc['created_at']
                    ->toDateTime()
                    ->format('Y-m-d H:i:s')

                : null,
        ];
    }
}