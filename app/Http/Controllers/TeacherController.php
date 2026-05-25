<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class TeacherController extends Controller
{
    private $teachers;
    private $users;

    private const ROLE_TEACHER = 'RL02';

    public function __construct()
    {
        $client = new MongoClient(
            env('MONGODB_URI', 'mongodb://localhost:27017')
        );

        $db = $client->selectDatabase(
            env('MONGODB_DATABASE', 'educonnect')
        );

        $this->teachers =
            $db->selectCollection('teachers');

        $this->users =
            $db->selectCollection('users');

        // backward compatibility
        $this->collection =
            $this->teachers;
    }

    /* ─────────────────────────────────────────────
       GET /api/teachers
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $search =
            $request->query('search', '');

        $spesialisasi =
            $request->query('spesialisasi', '');

        $perPage =
            (int) $request->query('per_page', 10);

        $page =
            (int) $request->query('page', 1);

        $skip =
            ($page - 1) * $perPage;

        $filter = [];

        if (!empty($search)) {

            $filter['$or'] = [

                [
                    'nama_guru' => [
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
                    'spesialisasi' => [
                        '$regex' => $search,
                        '$options' => 'i'
                    ]
                ],
            ];
        }

        if (!empty($spesialisasi)) {

            $filter['spesialisasi'] =
                $spesialisasi;
        }

        $total =
            $this->collection
                ->countDocuments($filter);

        $cursor =
            $this->collection->find(

                $filter,

                [
                    'skip' => $skip,

                    'limit' => $perPage,

                    'sort' => [
                        'nama_guru' => 1
                    ],
                ]
            );

        $teachers = [];

        foreach ($cursor as $doc) {

            $teachers[] =
                $this->formatTeacher($doc);
        }

        return response()->json([

            'success' => true,

            'data' => $teachers,

            'meta' => [

                'total' => $total,

                'page' => $page,

                'per_page' => $perPage,

                'last_page' =>
                    (int) ceil(
                        $total / $perPage
                    ),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────
       POST /api/teachers
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [

                'nama_guru' =>
                    'nullable|string|max:100',

                'phone' =>
                    'nullable|string|max:20',

                'spesialisasi' =>
                    'nullable|string|max:100',

                'username' =>
                    'required|string|min:4|max:50|alpha_num',

                'password' =>
                    'required|string|min:8|max:100',

                'email' =>
                    'nullable|email|max:100',
            ]
        );

        if ($validator->fails()) {

            return response()->json([

                'success' => false,

                'errors' =>
                    $validator->errors(),
            ], 422);
        }

        // duplicate username
        if (
            $this->users->findOne([
                'username' =>
                    $request->username
            ])
        ) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Username sudah digunakan.',
            ], 409);
        }

        // duplicate email
        if (
            $request->email &&
            $this->users->findOne([
                'email' =>
                    $request->email
            ])
        ) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Email sudah digunakan.',
            ], 409);
        }

        // duplicate phone
        if (
            $request->phone &&
            $this->teachers->findOne([
                'phone' =>
                    $request->phone
            ])
        ) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Nomor telepon sudah terdaftar.',
            ], 409);
        }

        // insert users
        $userDoc = [

            'role_id' =>
                self::ROLE_TEACHER,

            'username' =>
                $request->username,

            'password' =>
                Hash::make(
                    $request->password
                ),

            'email' =>
                $request->email ?? null,

            'photo' => null,

            'created_at' =>
                new UTCDateTime(),

            'updated_at' =>
                new UTCDateTime(),
        ];

        $userResult =
            $this->users->insertOne(
                $userDoc
            );

        $userId =
            (string) 
            $userResult->getInsertedId();

        try {

            $teacherDoc = [

                'user_id' =>
                    $userId,

                'nama_guru' =>
                    $request->nama_guru,

                'phone' =>
                    $request->phone,

                'spesialisasi' =>
                    $request->spesialisasi,

                'created_at' =>
                    new UTCDateTime(),

                'updated_at' =>
                    new UTCDateTime(),
            ];

            $teacherResult =
                $this->teachers->insertOne(
                    $teacherDoc
                );

            $teacherDoc['_id'] =
                $teacherResult->getInsertedId();

        } catch (\Exception $e) {

            $this->users->deleteOne([
                '_id' =>
                    new ObjectId($userId)
            ]);

            return response()->json([

                'success' => false,

                'message' =>
                    'Gagal menyimpan data guru.',
            ], 500);
        }

        return response()->json([

            'success' => true,

            'message' =>
                'Guru berhasil ditambahkan.',

            'data' =>
                $this->formatTeacher(
                    $teacherDoc
                ),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       UPDATE PROFILE GURU SENDIRI
    ───────────────────────────────────────────── */
    public function updateOwnProfile(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [

                'username' =>
                    'required|string|min:4|max:50',

                'photo' =>
                    'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            ]
        );

        if ($validator->fails()) {

            return back()->withErrors(
                $validator
            );
        }

        $user = Auth::user();

        if (!$user) {

            return back()->withErrors([

                'auth' =>
                    'User tidak ditemukan.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | FIX OBJECT ID
        |--------------------------------------------------------------------------
        */

        try {

            $userId =
                new ObjectId(
                    (string) $user->_id
                );

        } catch (\Exception $e) {

            $userId =
                $user->_id;
        }

        /*
        |--------------------------------------------------------------------------
        | CHECK DUPLICATE USERNAME
        |--------------------------------------------------------------------------
        */

        $usernameExists =
            $this->users->findOne([

                'username' =>
                    $request->username,

                '_id' => [

                    '$ne' => $userId
                ]
            ]);

        if ($usernameExists) {

            return back()->withErrors([

                'username' =>
                    'Username sudah digunakan.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | PHOTO UPLOAD
        |--------------------------------------------------------------------------
        */

        $photoUrl =
            $user->photo ?? null;

        if (
            $request->hasFile('photo')
        ) {

            $file =
                $request->file('photo');

            $path = $file->store(
                'profile',
                'public'
            );

            /*
            |--------------------------------------------------------------------------
            | CACHE BUSTER
            |--------------------------------------------------------------------------
            */

            $photoUrl =
                asset(
                    'storage/' .
                    $path .
                    '?v=' .
                    time()
                );
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE USER
        |--------------------------------------------------------------------------
        */

        $this->users->updateOne(

            [
                '_id' => $userId
            ],

            [
                '$set' => [

                    'username' =>
                        $request->username,

                    'photo' =>
                        $photoUrl,

                    'updated_at' =>
                        new UTCDateTime(),
                ]
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | REFRESH AUTH SESSION
        |--------------------------------------------------------------------------
        */

        $freshUser =
            \App\Models\User::find(
                (string) $userId
            );

        Auth::setUser($freshUser);

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        return back()->with(
            'success',
            'Profil berhasil diperbarui.'
        );
    }

    /* ─────────────────────────────────────────────
       UPDATE PASSWORD SENDIRI
    ───────────────────────────────────────────── */
    public function updateOwnPassword(Request $request)
    {
        $request->validate([

            'current_password' =>
                'required',

            'password' =>
                'required|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (
            !Hash::check(
                $request->current_password,
                $user->password
            )
        ) {

            return back()->withErrors([

                'current_password' =>
                    'Password saat ini salah.'
            ]);
        }

        try {
            $userId = new ObjectId((string) $user->_id);
        } catch (\Exception $e) {
            $userId = $user->_id;
        }

        $this->users->updateOne(

            [
                '_id' => $userId
            ],

            [
                '$set' => [

                    'password' =>
                        Hash::make(
                            $request->password
                        ),

                    'updated_at' =>
                        new UTCDateTime(),
                ]
            ]
        );

        return back()->with(
            'success',
            'Password berhasil diperbarui.'
        );
    }

    /* ─────────────────────────────────────────────
       GET /api/teachers/{id}
    ───────────────────────────────────────────── */
    public function show(string $id)
    {
        try {

            $doc =
                $this->collection->findOne([

                    '_id' =>
                        new ObjectId($id)
                ]);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' =>
                    'ID tidak valid.',
            ], 400);
        }

        if (!$doc) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Guru tidak ditemukan.',
            ], 404);
        }

        return response()->json([

            'success' => true,

            'data' =>
                $this->formatTeacher($doc)
        ]);
    }

    /* ─────────────────────────────────────────────
       UPDATE TEACHER ADMIN
    ───────────────────────────────────────────── */
    public function update(
        Request $request,
        string $id
    ) {

        $validator = Validator::make(
            $request->all(),
            [

                'user_id' =>
                    'nullable|string',

                'nama_guru' =>
                    'nullable|string|max:100',

                'phone' =>
                    'nullable|string|max:20',

                'spesialisasi' =>
                    'nullable|string|max:100',
            ]
        );

        if ($validator->fails()) {

            return response()->json([

                'success' => false,

                'errors' =>
                    $validator->errors(),
            ], 422);
        }

        try {

            $oid =
                new ObjectId($id);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' =>
                    'ID tidak valid.',
            ], 400);
        }

        // duplicate phone
        if (
            $request->phone
        ) {

            $exists =
                $this->collection->findOne([

                    'phone' =>
                        $request->phone,

                    '_id' => [
                        '$ne' => $oid
                    ],
                ]);

            if ($exists) {

                return response()->json([

                    'success' => false,

                    'message' =>
                        'Nomor telepon sudah digunakan.',
                ], 409);
            }
        }

        $result =
            $this->collection->updateOne(

                [
                    '_id' => $oid
                ],

                [
                    '$set' => [

                        'user_id' =>
                            $request->user_id ?? null,

                        'nama_guru' =>
                            $request->nama_guru,

                        'phone' =>
                            $request->phone,

                        'spesialisasi' =>
                            $request->spesialisasi,

                        'updated_at' =>
                            new UTCDateTime(),
                    ]
                ]
            );

        if (
            $result->getMatchedCount() === 0
        ) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Guru tidak ditemukan.',
            ], 404);
        }

        $updated =
            $this->collection->findOne([
                '_id' => $oid
            ]);

        return response()->json([

            'success' => true,

            'message' =>
                'Data guru berhasil diperbarui.',

            'data' =>
                $this->formatTeacher(
                    $updated
                ),
        ]);
    }

    /* ─────────────────────────────────────────────
       DELETE TEACHER
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try {

            $oid =
                new ObjectId($id);

        } catch (\Exception $e) {

            return response()->json([

                'success' => false,

                'message' =>
                    'ID tidak valid.',
            ], 400);
        }

        $teacher =
            $this->teachers->findOne([
                '_id' => $oid
            ]);

        if (!$teacher) {

            return response()->json([

                'success' => false,

                'message' =>
                    'Guru tidak ditemukan.',
            ], 404);
        }

        $this->teachers->deleteOne([
            '_id' => $oid
        ]);

        if (
            !empty($teacher['user_id'])
        ) {

            try {

                $this->users->deleteOne([

                    '_id' =>
                        new ObjectId(
                            $teacher['user_id']
                        )
                ]);

            } catch (\Exception $e) {

                $this->users->deleteOne([

                    '_id' =>
                        $teacher['user_id']
                ]);
            }
        }

        return response()->json([

            'success' => true,

            'message' =>
                'Guru berhasil dihapus.',
        ]);
    }

    /* ─────────────────────────────────────────────
       RESET PASSWORD GURU (ADMIN)
    ───────────────────────────────────────────── */
    public function resetPassword(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'ID tidak valid.',
            ], 400);
        }

        $teacher = $this->teachers->findOne(['_id' => $oid]);

        if (!$teacher) {
            return response()->json([
                'success' => false,
                'message' => 'Guru tidak ditemukan.',
            ], 404);
        }

        if (empty($teacher['user_id'])) {
            return response()->json([
                'success' => false,
                'message' => 'Guru tidak memiliki akun login.',
            ], 400);
        }

        try {
            $userId = new ObjectId($teacher['user_id']);
        } catch (\Exception $e) {
            $userId = $teacher['user_id'];
        }

        $this->users->updateOne(
            ['_id' => $userId],
            [
                '$set' => [
                    'password' => Hash::make('mieayambakso'),
                    'updated_at' => new UTCDateTime(),
                ]
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Password guru berhasil direset ke default.',
        ]);
    }

    /* ─────────────────────────────────────────────
       LIST SPESIALISASI
    ───────────────────────────────────────────── */
    public function spesialisasiList()
    {
        $list =
            $this->collection->distinct(
                'spesialisasi',
                []
            );

        sort($list);

        return response()->json([

            'success' => true,

            'data' => $list,
        ]);
    }

    /* ─────────────────────────────────────────────
       FORMATTER
    ───────────────────────────────────────────── */
    private function formatTeacher(
        $doc
    ): array {

        return [

            'id' =>
                (string) $doc['_id'],

            'user_id' =>
                $doc['user_id'] ?? null,

            'nama_guru' =>
                $doc['nama_guru'] ?? null,

            'phone' =>
                $doc['phone'] ?? null,

            'spesialisasi' =>
                $doc['spesialisasi'] ?? null,

            'created_at' =>
                isset($doc['created_at'])

                ? $doc['created_at']
                    ->toDateTime()
                    ->format(
                        'Y-m-d H:i:s'
                    )

                : null,
        ];
    }
}