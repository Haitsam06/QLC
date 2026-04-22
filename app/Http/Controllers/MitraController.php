<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage; // Tambahkan ini untuk handle file
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class MitraController extends Controller
{
    private $partners;
    private $users;
    private const ROLE_MITRA = 'RL04';

    public function __construct()
    {
        $client          = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db              = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->partners  = $db->selectCollection('partners');
        $this->users     = $db->selectCollection('users');
    }

    /* ─────────────────────────────────────────────
       GET /api/partners?page=&per_page=&search=&status=
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        // (Isi function index TETAP SAMA seperti sebelumnya)
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

    public function show(string $id)
    {
        // (Isi function show TETAP SAMA seperti sebelumnya)
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
            'mou_file'         => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:5120', // Ubah validasi jadi file, max 5MB
            'status'           => 'required|in:Active,Inactive',
            'username'         => 'required|string|min:4|max:50|alpha_num',
            'password'         => 'required|string|min:8|max:100',
            'email'            => 'nullable|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if ($this->users->findOne(['username' => $request->username])) {
            return response()->json(['success' => false, 'message' => 'Username sudah digunakan.'], 409);
        }
        if ($request->email && $this->users->findOne(['email' => $request->email])) {
            return response()->json(['success' => false, 'message' => 'Email sudah digunakan.'], 409);
        }
        if ($this->partners->findOne(['phone' => $request->phone])) {
            return response()->json(['success' => false, 'message' => 'Nomor telepon sudah terdaftar.'], 409);
        }

        // ── Proses Upload File ──
        $mouFileUrl = null;
        if ($request->hasFile('mou_file')) {
            $path = $request->file('mou_file')->store('mous', 'public'); // Simpan di folder storage/app/public/mous
            $mouFileUrl = url('storage/' . $path);
        }

        $now = new UTCDateTime();

        $userDoc = [
            'role_id'    => self::ROLE_MITRA,
            'username'   => $request->username,
            'password'   => Hash::make($request->password),
            'email'      => $request->email ?? null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $userResult = $this->users->insertOne($userDoc);
        $userId     = (string) $userResult->getInsertedId();

        try {
            $partnerDoc = [
                'user_id'          => $userId,
                'institution_name' => $request->institution_name,
                'contact_person'   => $request->contact_person,
                'phone'            => $request->phone,
                'mou_file_url'     => $mouFileUrl, // Simpan URL hasil upload
                'status'           => $request->status,
                'created_at'       => $now,
                'updated_at'       => $now,
            ];

            $result            = $this->partners->insertOne($partnerDoc);
            $partnerDoc['_id'] = $result->getInsertedId();

        } catch (\Exception $e) {
            $this->users->deleteOne(['_id' => new ObjectId($userId)]);
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data mitra. Akun telah di-rollback.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mitra berhasil ditambahkan beserta akun.',
            'data'    => $this->format($partnerDoc),
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
            'mou_file'         => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:5120', // Ubah validasi jadi file
            'status'           => 'required|in:Active,Inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $exists = $this->partners->findOne([
            'phone' => $request->phone,
            '_id'   => ['$ne' => $oid],
        ]);
        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Nomor telepon sudah digunakan mitra lain.',
            ], 409);
        }

        $existingPartner = $this->partners->findOne(['_id' => $oid]);
        if (!$existingPartner) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        // ── Proses Upload File untuk Update ──
        $mouFileUrl = $existingPartner['mou_file_url'] ?? null;
        
        if ($request->hasFile('mou_file')) {
            // Opsional: Hapus file lama jika ada
            if ($mouFileUrl) {
                $oldPath = str_replace(url('storage/') . '/', '', $mouFileUrl);
                Storage::disk('public')->delete($oldPath);
            }
            
            $path = $request->file('mou_file')->store('mous', 'public');
            $mouFileUrl = url('storage/' . $path);
        }

        $result = $this->partners->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'institution_name' => $request->institution_name,
                'contact_person'   => $request->contact_person,
                'phone'            => $request->phone,
                'mou_file_url'     => $mouFileUrl, // Update dengan URL baru atau tetap yang lama
                'status'           => $request->status,
                'updated_at'       => new UTCDateTime(),
            ]]
        );

        $updated = $this->partners->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Data mitra berhasil diperbarui.',
            'data'    => $this->format($updated),
        ]);
    }

    public function destroy(string $id)
    {
        // (Isi function destroy TETAP SAMA, namun opsional kamu bisa tambahkan logika hapus file dari Storage jika mitra dihapus)
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $partner = $this->partners->findOne(['_id' => $oid]);

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        // Hapus file MOU fisik saat data mitra dihapus (Opsional tapi direkomendasikan)
        if (isset($partner['mou_file_url'])) {
             $oldPath = str_replace(url('storage/') . '/', '', $partner['mou_file_url']);
             Storage::disk('public')->delete($oldPath);
        }

        $this->partners->deleteOne(['_id' => $oid]);

        if (!empty($partner['user_id'])) {
            try { $this->users->deleteOne(['_id' => new ObjectId($partner['user_id'])]); } 
            catch (\Exception $e) { $this->users->deleteOne(['_id' => $partner['user_id']]); }
        }

        return response()->json(['success' => true, 'message' => 'Mitra dan akun pengguna berhasil dihapus.']);
    }

    private function format($doc): array
    {
        // (Isi function format TETAP SAMA)
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