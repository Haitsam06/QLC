<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class StudentController extends Controller
{
    private $students;
    private $parents;
    private $programs;

    public function __construct()
    {
        $client         = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db             = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->students = $db->selectCollection('students');
        $this->parents  = $db->selectCollection('parents');
        $this->programs = $db->selectCollection('programs');
    }

    /* ─────────────────────────────────────────────
       GET /api/students
       Query: search, status, program_id, page, per_page
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $search    = $request->query('search', '');
        $status    = $request->query('status', '');
        $programId = $request->query('program_id', '');
        $perPage   = (int) $request->query('per_page', 10);
        $page      = (int) $request->query('page', 1);
        $skip      = ($page - 1) * $perPage;

        $filter = [];

        if (!empty($search)) {
            $filter['$or'] = [
                ['nama'          => ['$regex' => $search, '$options' => 'i']],
                ['tempat_lahir'  => ['$regex' => $search, '$options' => 'i']],
            ];
        }
        if (!empty($status))    $filter['enrollment_status'] = $status;
        if (!empty($programId)) $filter['program_id']        = $programId;

        $total  = $this->students->countDocuments($filter);
        $cursor = $this->students->find($filter, [
            'skip'  => $skip,
            'limit' => $perPage,
            'sort'  => ['nama' => 1],
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
       POST /api/students
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'parent_id'         => 'required|string',
            'program_id'        => 'required|string',
            'nama'              => 'required|string|max:100',
            'usia'              => 'required|integer|min:1|max:30',
            'tempat_lahir'      => 'required|string|max:100',
            'tanggal_lahir'     => 'required|date_format:Y-m-d',
            'enrollment_status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Pastikan parent_id valid
        try {
            $parent = $this->parents->findOne(['_id' => new ObjectId($request->parent_id)]);
        } catch (\Exception $e) {
            $parent = null;
        }
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        // Pastikan program_id valid
        try {
            $program = $this->programs->findOne(['_id' => new ObjectId($request->program_id)]);
        } catch (\Exception $e) {
            $program = null;
        }
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        $doc = [
            'parent_id'         => $request->parent_id,
            'program_id'        => $request->program_id,
            'nama'              => $request->nama,
            'usia'              => (int) $request->usia,
            'tempat_lahir'      => $request->tempat_lahir,
            'tanggal_lahir'     => $request->tanggal_lahir,
            'enrollment_status' => $request->enrollment_status,
            'created_at'        => new \MongoDB\BSON\UTCDateTime(),
            'updated_at'        => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result      = $this->students->insertOne($doc);
        $doc['_id']  = $result->getInsertedId();

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan.',
            'data'    => $this->format($doc),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       GET /api/students/{id}
    ───────────────────────────────────────────── */
    public function show(string $id)
    {
        try {
            $doc = $this->students->findOne(['_id' => new ObjectId($id)]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->format($doc)]);
    }

    /* ─────────────────────────────────────────────
       PUT /api/students/{id}
    ───────────────────────────────────────────── */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'parent_id'         => 'required|string',
            'program_id'        => 'required|string',
            'nama'              => 'required|string|max:100',
            'usia'              => 'required|integer|min:1|max:30',
            'tempat_lahir'      => 'required|string|max:100',
            'tanggal_lahir'     => 'required|date_format:Y-m-d',
            'enrollment_status' => 'required|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        // Validasi parent_id
        try {
            $parent = $this->parents->findOne(['_id' => new ObjectId($request->parent_id)]);
        } catch (\Exception $e) {
            $parent = null;
        }
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        // Validasi program_id
        try {
            $program = $this->programs->findOne(['_id' => new ObjectId($request->program_id)]);
        } catch (\Exception $e) {
            $program = null;
        }
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        $result = $this->students->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'parent_id'         => $request->parent_id,
                'program_id'        => $request->program_id,
                'nama'              => $request->nama,
                'usia'              => (int) $request->usia,
                'tempat_lahir'      => $request->tempat_lahir,
                'tanggal_lahir'     => $request->tanggal_lahir,
                'enrollment_status' => $request->enrollment_status,
                'updated_at'        => new \MongoDB\BSON\UTCDateTime(),
            ]]
        );

        if ($result->getMatchedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        $updated = $this->students->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil diperbarui.',
            'data'    => $this->format($updated),
        ]);
    }

    /* ─────────────────────────────────────────────
       DELETE /api/students/{id}
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $result = $this->students->deleteOne(['_id' => $oid]);

        if ($result->getDeletedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Data siswa berhasil dihapus.']);
    }

    /* ─────────────────────────────────────────────
       GET /api/students/options
       Mengembalikan daftar parents & programs untuk dropdown form
    ───────────────────────────────────────────── */
    public function options()
    {
        // Parents
        $parentCursor = $this->parents->find([], ['sort' => ['parent_name' => 1]]);
        $parents = [];
        foreach ($parentCursor as $p) {
            $parents[] = [
                'id'    => (string) $p['_id'],
                'label' => $p['parent_name'] . ' — ' . ($p['phone'] ?? ''),
            ];
        }

        // Programs — field nama sesuai dengan InfoController: 'name'
        $programCursor = $this->programs->find([], ['sort' => ['name' => 1]]);
        $programs = [];
        foreach ($programCursor as $p) {
            $programs[] = [
                'id'    => (string) $p['_id'],
                'label' => $p['name'] ?? (string) $p['_id'],
            ];
        }

        return response()->json([
            'success'  => true,
            'parents'  => $parents,
            'programs' => $programs,
        ]);
    }

    /* ─────────────────────────────────────────────
       Helper: format doc → array
       Menyertakan nama parent & program dari lookup
    ───────────────────────────────────────────── */
    private function format($doc): array
    {
        // Lookup parent name
        $parentName = null;
        if (!empty($doc['parent_id'])) {
            try {
                $p = $this->parents->findOne(['_id' => new ObjectId($doc['parent_id'])]);
                $parentName = $p ? $p['parent_name'] : null;
            } catch (\Exception $e) {}
        }

        // Lookup program name
        $programName = null;
        if (!empty($doc['program_id'])) {
            try {
                $p = $this->programs->findOne(['_id' => new ObjectId($doc['program_id'])]);
                $programName = $p ? ($p['name'] ?? null) : null;
            } catch (\Exception $e) {}
        }

        return [
            'id'                => (string) $doc['_id'],
            'parent_id'         => $doc['parent_id'] ?? null,
            'parent_name'       => $parentName,
            'program_id'        => $doc['program_id'] ?? null,
            'program_name'      => $programName,
            'nama'              => $doc['nama'],
            'usia'              => $doc['usia'] ?? null,
            'tempat_lahir'      => $doc['tempat_lahir'],
            'tanggal_lahir'     => $doc['tanggal_lahir'],
            'enrollment_status' => $doc['enrollment_status'],
            'created_at'        => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                : null,
        ];
    }
}