<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        $client         = new MongoClient(config('database.connections.mongodb.dsn'));
        $db             = $client->selectDatabase(config('database.connections.mongodb.database'));
        $this->students = $db->selectCollection('students');
        $this->parents  = $db->selectCollection('parents');
        $this->programs = $db->selectCollection('programs');
    }

    public function index(Request $request)
    {
        $search    = $request->query('search', '');
        $status    = $request->query('status', '');
        $programId = $request->query('program_id', '');
        $perPage   = max(1, min(100, (int) $request->query('per_page', 10)));
        $page      = (int) $request->query('page', 1);
        $skip      = ($page - 1) * $perPage;

        $filter = [];
        if (!empty($search)) {
            $safeSearch = preg_quote($search, '/');
            $filter['$or'] = [
                ['nama'         => ['$regex' => $safeSearch, '$options' => 'i']],
                ['tempat_lahir' => ['$regex' => $safeSearch, '$options' => 'i']],
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

        // Collect docs first, then batch-load programs to avoid N+1
        $docs       = [];
        $programIds = [];
        foreach ($cursor as $doc) {
            $docs[] = $doc;
            if (!empty($doc['program_id'])) {
                $programIds[] = $doc['program_id'];
            }
        }

        $programMap = [];
        if (!empty($programIds)) {
            $oids = array_values(array_filter(array_map(function ($pid) {
                try { return new ObjectId($pid); } catch (\Exception $e) { return null; }
            }, array_unique($programIds))));
            foreach ($this->programs->find(['_id' => ['$in' => $oids]]) as $p) {
                $programMap[(string) $p['_id']] = $p['name'] ?? null;
            }
        }

        $data = [];
        foreach ($docs as $doc) {
            $data[] = $this->format($doc, $programMap);
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'parent_id'         => 'required|string',
            'program_id'        => 'required|string',
            'nama'              => 'required|string|max:100',
            'usia'              => 'required|integer|min:1|max:30',
            'tempat_lahir'      => 'required|string|max:100',
            'tanggal_lahir'     => 'required|date_format:Y-m-d',
            'enrollment_status' => 'required|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Cari parent via user_id (bukan _id) karena students.parent_id = users._id
        $parent = $this->parents->findOne(['user_id' => (string) $request->parent_id]);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        try {
            $program = $this->programs->findOne(['_id' => new ObjectId($request->program_id)]);
        } catch (\Exception $e) { $program = null; }
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        $doc = [
            'parent_id'         => $request->parent_id,
            'parent_name'       => $parent['parent_name'] ?? null,
            'program_id'        => $request->program_id,
            'nama'              => $request->nama,
            'usia'              => (int) $request->usia,
            'tempat_lahir'      => $request->tempat_lahir,
            'tanggal_lahir'     => $request->tanggal_lahir,
            'enrollment_status' => $request->enrollment_status,
            'created_at'        => new \MongoDB\BSON\UTCDateTime(),
            'updated_at'        => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result     = $this->students->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();

        // Notifikasi ke semua guru jika siswa langsung berstatus aktif
        if ($request->enrollment_status === 'active') {
            $programName = $program['name'] ?? 'program';
            Notification::sendToRole(
                'teacher',
                'pendaftaran',
                'Santri Baru Aktif',
                "Santri baru \"{$request->nama}\" telah terdaftar aktif di {$programName}.",
                null
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan.',
            'data'    => $this->format($doc),
        ], 201);
    }

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

    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'parent_id'         => 'required|string',
            'program_id'        => 'required|string',
            'nama'              => 'required|string|max:100',
            'usia'              => 'required|integer|min:1|max:30',
            'tempat_lahir'      => 'required|string|max:100',
            'tanggal_lahir'     => 'required|date_format:Y-m-d',
            'enrollment_status' => 'required|in:active,inactive,pending',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        // Ambil status lama sebelum update untuk deteksi perubahan ke aktif
        $oldStudent = $this->students->findOne(['_id' => $oid]);
        $oldStatus  = $oldStudent ? ($oldStudent['enrollment_status'] ?? null) : null;

        // Cari parent via user_id
        $parent = $this->parents->findOne(['user_id' => (string) $request->parent_id]);
        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        try {
            $program = $this->programs->findOne(['_id' => new ObjectId($request->program_id)]);
        } catch (\Exception $e) { $program = null; }
        if (!$program) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        $result = $this->students->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'parent_id'         => $request->parent_id,
                'parent_name'       => $parent['parent_name'] ?? null,
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

        // Notifikasi ke semua guru jika status baru saja berubah menjadi aktif
        if ($request->enrollment_status === 'active' && $oldStatus !== 'active') {
            $programName = $program['name'] ?? 'program';
            Notification::sendToRole(
                'teacher',
                'pendaftaran',
                'Santri Baru Aktif',
                "Santri \"{$request->nama}\" telah disetujui dan aktif di {$programName}.",
                null
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Data siswa berhasil diperbarui.',
            'data'    => $this->format($updated),
        ]);
    }

    public function destroy(string $id)
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $student = $this->students->findOne(['_id' => $oid]);

        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Siswa tidak ditemukan.'], 404);
        }

        // Hapus file bukti pembayaran jika ada
        if (!empty($student['bukti_pembayaran'])) {
            Storage::disk('public')->delete($student['bukti_pembayaran']);
        }

        $this->students->deleteOne(['_id' => $oid]);

        return response()->json(['success' => true, 'message' => 'Data siswa berhasil dihapus.']);
    }

    public function options()
    {
        $parentCursor = $this->parents->find([], ['sort' => ['parent_name' => 1]]);
        $parents = [];
        foreach ($parentCursor as $p) {
            $parents[] = [
                // Gunakan user_id agar cocok dengan students.parent_id
                'id'    => (string) $p['user_id'],
                'label' => $p['parent_name'] . ' — ' . ($p['phone'] ?? ''),
            ];
        }

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

    private function format($doc, array $programMap = []): array
    {
        $parentName = $doc['parent_name'] ?? null;
        if (!$parentName && !empty($doc['parent_id'])) {
            $p = $this->parents->findOne(['user_id' => (string) $doc['parent_id']]);
            $parentName = $p ? ($p['parent_name'] ?? null) : null;
        }

        $programName = null;
        if (!empty($doc['program_id'])) {
            $pid = (string) $doc['program_id'];
            if (array_key_exists($pid, $programMap)) {
                $programName = $programMap[$pid];
            } else {
                try {
                    $p = $this->programs->findOne(['_id' => new ObjectId($pid)]);
                    $programName = $p ? ($p['name'] ?? null) : null;
                } catch (\Exception $e) {}
            }
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
            'bukti_pembayaran'  => $doc['bukti_pembayaran'] ?? null,
            'created_at'        => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                : null,
        ];
    }
}