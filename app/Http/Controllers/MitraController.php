<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class MitraController extends Controller
{
    private $partners;

    public function __construct()
    {
        $client          = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db              = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->partners  = $db->selectCollection('partners');
    }

    /* ─────────────────────────────────────────────
       GET /api/partners?page=&per_page=&search=&status=
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $page     = max(1, (int) $request->query('page', 1));
        $perPage  = max(1, min(50, (int) $request->query('per_page', 10)));
        $search   = trim($request->query('search', ''));
        $status   = trim($request->query('status', ''));

        $filter = [];

        if ($search !== '') {
            $regex = new \MongoDB\BSON\Regex($search, 'i');
            $filter['$or'] = [
                ['institution_name' => $regex],
                ['contact_person'   => $regex],
                ['phone'            => $regex],
            ];
        }

        if (in_array($status, ['Active', 'Inactive'], true)) {
            $filter['status'] = $status;
        }

        $total    = $this->partners->countDocuments($filter);
        $skip     = ($page - 1) * $perPage;
        $cursor   = $this->partners->find($filter, [
            'sort'  => ['institution_name' => 1],
            'skip'  => $skip,
            'limit' => $perPage,
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
                'last_page' => max(1, (int) ceil($total / $perPage)),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────
       GET /api/partners/{id}
    ───────────────────────────────────────────── */
    public function show(string $id)
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $doc = $this->partners->findOne(['_id' => $oid]);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->format($doc)]);
    }

    /* ─────────────────────────────────────────────
       POST /api/partners
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'institution_name' => 'required|string|max:200',
            'contact_person'   => 'required|string|max:150',
            'phone'            => 'required|string|max:20',
            'mou_file_url'     => 'nullable|url|max:500',
            'status'           => 'required|in:Active,Inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $now    = new UTCDateTime();
        $result = $this->partners->insertOne([
            'user_id'          => $request->user_id ?? null,
            'institution_name' => $request->institution_name,
            'contact_person'   => $request->contact_person,
            'phone'            => $request->phone,
            'mou_file_url'     => $request->mou_file_url ?? null,
            'status'           => $request->status,
            'created_at'       => $now,
            'updated_at'       => $now,
        ]);

        $inserted = $this->partners->findOne(['_id' => $result->getInsertedId()]);

        return response()->json([
            'success' => true,
            'message' => 'Mitra berhasil ditambahkan.',
            'data'    => $this->format($inserted),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       PUT /api/partners/{id}
    ───────────────────────────────────────────── */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'institution_name' => 'required|string|max:200',
            'contact_person'   => 'required|string|max:150',
            'phone'            => 'required|string|max:20',
            'mou_file_url'     => 'nullable|url|max:500',
            'status'           => 'required|in:Active,Inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $result = $this->partners->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'institution_name' => $request->institution_name,
                'contact_person'   => $request->contact_person,
                'phone'            => $request->phone,
                'mou_file_url'     => $request->mou_file_url ?? null,
                'status'           => $request->status,
                'updated_at'       => new UTCDateTime(),
            ]]
        );

        if ($result->getMatchedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        $updated = $this->partners->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Data mitra berhasil diperbarui.',
            'data'    => $this->format($updated),
        ]);
    }

    /* ─────────────────────────────────────────────
       DELETE /api/partners/{id}
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $result = $this->partners->deleteOne(['_id' => $oid]);

        if ($result->getDeletedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Mitra berhasil dihapus.']);
    }

    /* ─────────────────────────────────────────────
       Helper
    ───────────────────────────────────────────── */
    private function format($doc): array
    {
        return [
            'id'               => (string) $doc['_id'],
            'user_id'          => $doc['user_id'] ?? null,
            'institution_name' => $doc['institution_name'],
            'contact_person'   => $doc['contact_person'],
            'phone'            => $doc['phone'],
            'mou_file_url'     => $doc['mou_file_url'] ?? null,
            'status'           => $doc['status'],
            'created_at'       => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                : null,
        ];
    }
}