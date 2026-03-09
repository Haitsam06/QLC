<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class InfoController extends Controller
{
    private $profiles;
    private $programs;
    private $gallery;

    public function __construct()
    {
        $client         = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db             = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->profiles = $db->selectCollection('profiles');
        $this->programs = $db->selectCollection('programs');
        $this->gallery  = $db->selectCollection('gallery');
    }

    /* ═══════════════════════════════════════════════════════
       PROFILES — single record
    ═══════════════════════════════════════════════════════ */

    /**
     * GET /api/info/profile
     * Ambil satu-satunya profil sekolah
     */
    public function profileShow()
    {
        $doc = $this->profiles->findOne([]);

        if (!$doc) {
            return response()->json(['success' => true, 'data' => null]);
        }

        return response()->json(['success' => true, 'data' => $this->fmtProfile($doc)]);
    }

    /**
     * POST /api/info/profile
     * Upsert: update jika sudah ada, insert jika belum
     * Mendukung multipart/form-data untuk upload logo
     */
    public function profileUpsert(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'         => 'required|string|max:150',
            'tagline'      => 'nullable|string|max:255',
            'history'      => 'nullable|string',
            'vision'       => 'nullable|string',
            'mission'      => 'nullable|string',
            'address'      => 'nullable|string|max:500',
            'whatsapp'     => 'nullable|string|max:30',
            'email'        => 'nullable|email|max:150',
            'social_media' => 'nullable|string', // JSON string: {"instagram":"...","facebook":"..."}
            'logo'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $existing = $this->profiles->findOne([]);

        // Handle logo upload
        $logoUrl = $existing['logo'] ?? null;
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            // Hapus logo lama jika ada
            if ($logoUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($logoUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path    = $request->file('logo')->store('info/logos', 'public');
            $logoUrl = Storage::url($path);
        }

        // Parse social_media JSON string
        $socialMedia = null;
        if ($request->filled('social_media')) {
            $decoded = json_decode($request->social_media, true);
            $socialMedia = is_array($decoded) ? $decoded : null;
        }

        $payload = [
            'name'         => $request->name,
            'logo'         => $logoUrl,
            'tagline'      => $request->tagline,
            'history'      => $request->history,
            'vision'       => $request->vision,
            'mission'      => $request->mission,
            'address'      => $request->address,
            'whatsapp'     => $request->whatsapp,
            'email'        => $request->email,
            'social_media' => $socialMedia,
            'updated_at'   => new \MongoDB\BSON\UTCDateTime(),
        ];

        if (!$existing) {
            $payload['created_at'] = new \MongoDB\BSON\UTCDateTime();
            $result = $this->profiles->insertOne($payload);
            $payload['_id'] = $result->getInsertedId();
        } else {
            $this->profiles->updateOne(
                ['_id' => $existing['_id']],
                ['$set' => $payload]
            );
            $payload['_id'] = $existing['_id'];
        }

        $updated = $this->profiles->findOne(['_id' => $payload['_id']]);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil disimpan.',
            'data'    => $this->fmtProfile($updated),
        ]);
    }

    /* ═══════════════════════════════════════════════════════
       PROGRAMS — full CRUD
    ═══════════════════════════════════════════════════════ */

    /**
     * GET /api/info/programs
     */
    public function programIndex(Request $request)
    {
        $search  = $request->query('search', '');
        $perPage = (int) $request->query('per_page', 10);
        $page    = (int) $request->query('page', 1);
        $skip    = ($page - 1) * $perPage;

        $filter = [];
        if (!empty($search)) {
            $filter['$or'] = [
                ['name'            => ['$regex' => $search, '$options' => 'i']],
                ['target_audience' => ['$regex' => $search, '$options' => 'i']],
            ];
        }

        $total  = $this->programs->countDocuments($filter);
        $cursor = $this->programs->find($filter, [
            'skip'  => $skip,
            'limit' => $perPage,
            'sort'  => ['name' => 1],
        ]);

        $data = [];
        foreach ($cursor as $doc) {
            $data[] = $this->fmtProgram($doc);
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

    /**
     * POST /api/info/programs
     */
    public function programStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'            => 'required|string|max:150',
            'description'     => 'nullable|string',
            'target_audience' => 'nullable|string|max:255',
            'duration'        => 'nullable|string|max:100',
            'image'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $imageUrl = null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path     = $request->file('image')->store('info/programs', 'public');
            $imageUrl = Storage::url($path);
        }

        $doc = [
            'name'            => $request->name,
            'description'     => $request->description,
            'target_audience' => $request->target_audience,
            'duration'        => $request->duration,
            'image_url'       => $imageUrl,
            'created_at'      => new \MongoDB\BSON\UTCDateTime(),
            'updated_at'      => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result    = $this->programs->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();

        return response()->json([
            'success' => true,
            'message' => 'Program berhasil ditambahkan.',
            'data'    => $this->fmtProgram($doc),
        ], 201);
    }

    /**
     * POST /api/info/programs/{id}  (method-spoofing PUT via _method=PUT)
     * atau PUT /api/info/programs/{id}
     */
    public function programUpdate(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'name'            => 'required|string|max:150',
            'description'     => 'nullable|string',
            'target_audience' => 'nullable|string|max:255',
            'duration'        => 'nullable|string|max:100',
            'image'           => 'nullable|image|mimes:jpg,jpeg,png,webp|max:3072',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $existing = $this->programs->findOne(['_id' => $oid]);
        if (!$existing) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        $imageUrl = $existing['image_url'] ?? null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($imageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path     = $request->file('image')->store('info/programs', 'public');
            $imageUrl = Storage::url($path);
        }

        $this->programs->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'name'            => $request->name,
                'description'     => $request->description,
                'target_audience' => $request->target_audience,
                'duration'        => $request->duration,
                'image_url'       => $imageUrl,
                'updated_at'      => new \MongoDB\BSON\UTCDateTime(),
            ]]
        );

        $updated = $this->programs->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Program berhasil diperbarui.',
            'data'    => $this->fmtProgram($updated),
        ]);
    }

    /**
     * DELETE /api/info/programs/{id}
     */
    public function programDestroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $doc = $this->programs->findOne(['_id' => $oid]);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        // Hapus file gambar
        if (!empty($doc['image_url'])) {
            $path = str_replace('/storage/', '', parse_url($doc['image_url'], PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }

        $this->programs->deleteOne(['_id' => $oid]);

        return response()->json(['success' => true, 'message' => 'Program berhasil dihapus.']);
    }

    /* ═══════════════════════════════════════════════════════
       GALLERY — full CRUD
    ═══════════════════════════════════════════════════════ */

    /**
     * GET /api/info/gallery
     */
    public function galleryIndex(Request $request)
    {
        $search  = $request->query('search', '');
        $type    = $request->query('type', '');
        $perPage = (int) $request->query('per_page', 12);
        $page    = (int) $request->query('page', 1);
        $skip    = ($page - 1) * $perPage;

        $filter = [];
        if (!empty($search)) {
            $filter['title'] = ['$regex' => $search, '$options' => 'i'];
        }
        if (!empty($type)) {
            $filter['type'] = $type;
        }

        $total  = $this->gallery->countDocuments($filter);
        $cursor = $this->gallery->find($filter, [
            'skip'  => $skip,
            'limit' => $perPage,
            'sort'  => ['uploaded_at' => -1],
        ]);

        $data = [];
        foreach ($cursor as $doc) {
            $data[] = $this->fmtGallery($doc);
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

    /**
     * POST /api/info/gallery
     */
    public function galleryStore(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'type'  => 'required|in:Photo,Video',
            'media' => 'required_if:type,Photo|nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'media_url' => 'required_if:type,Video|nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $mediaUrl = $request->media_url ?? null;

        // Upload file jika Photo
        if ($request->type === 'Photo' && $request->hasFile('media') && $request->file('media')->isValid()) {
            $path     = $request->file('media')->store('info/gallery', 'public');
            $mediaUrl = Storage::url($path);
        }

        if (!$mediaUrl) {
            return response()->json(['success' => false, 'message' => 'File atau URL media wajib diisi.'], 422);
        }

        $doc = [
            'title'       => $request->title,
            'media_url'   => $mediaUrl,
            'type'        => $request->type,
            'uploaded_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result    = $this->gallery->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();

        return response()->json([
            'success' => true,
            'message' => 'Item galeri berhasil ditambahkan.',
            'data'    => $this->fmtGallery($doc),
        ], 201);
    }

    /**
     * POST /api/info/gallery/{id}  (method-spoofing)
     */
    public function galleryUpdate(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:200',
            'type'  => 'required|in:Photo,Video',
            'media' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'media_url' => 'nullable|url|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $existing = $this->gallery->findOne(['_id' => $oid]);
        if (!$existing) {
            return response()->json(['success' => false, 'message' => 'Item tidak ditemukan.'], 404);
        }

        $mediaUrl = $existing['media_url'] ?? null;

        if ($request->type === 'Photo' && $request->hasFile('media') && $request->file('media')->isValid()) {
            // Hapus file lama
            if ($mediaUrl && !str_starts_with($mediaUrl, 'http')) {
                $oldPath = str_replace('/storage/', '', parse_url($mediaUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path     = $request->file('media')->store('info/gallery', 'public');
            $mediaUrl = Storage::url($path);
        } elseif ($request->type === 'Video' && $request->filled('media_url')) {
            $mediaUrl = $request->media_url;
        }

        $this->gallery->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'title'     => $request->title,
                'type'      => $request->type,
                'media_url' => $mediaUrl,
            ]]
        );

        $updated = $this->gallery->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Item galeri berhasil diperbarui.',
            'data'    => $this->fmtGallery($updated),
        ]);
    }

    /**
     * DELETE /api/info/gallery/{id}
     */
    public function galleryDestroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $doc = $this->gallery->findOne(['_id' => $oid]);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Item tidak ditemukan.'], 404);
        }

        // Hapus file jika Photo
        if ($doc['type'] === 'Photo' && !empty($doc['media_url'])) {
            $path = str_replace('/storage/', '', parse_url($doc['media_url'], PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }

        $this->gallery->deleteOne(['_id' => $oid]);

        return response()->json(['success' => true, 'message' => 'Item galeri berhasil dihapus.']);
    }

    /* ═══════════════════════════════════════════════════════
       HELPERS
    ═══════════════════════════════════════════════════════ */
    private function fmtProfile($doc): array
    {
        return [
            'id'           => (string) $doc['_id'],
            'name'         => $doc['name']         ?? null,
            'logo'         => $doc['logo']         ?? null,
            'tagline'      => $doc['tagline']      ?? null,
            'history'      => $doc['history']      ?? null,
            'vision'       => $doc['vision']       ?? null,
            'mission'      => $doc['mission']      ?? null,
            'address'      => $doc['address']      ?? null,
            'whatsapp'     => $doc['whatsapp']     ?? null,
            'email'        => $doc['email']        ?? null,
            'social_media' => $doc['social_media'] ?? null,
            'updated_at'   => isset($doc['updated_at'])
                ? $doc['updated_at']->toDateTime()->format('Y-m-d H:i:s') : null,
        ];
    }

    private function fmtProgram($doc): array
    {
        return [
            'id'             => (string) $doc['_id'],
            'name'           => $doc['name']            ?? null,
            'description'    => $doc['description']     ?? null,
            'target_audience'=> $doc['target_audience'] ?? null,
            'duration'       => $doc['duration']        ?? null,
            'image_url'      => $doc['image_url']       ?? null,
            'created_at'     => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s') : null,
        ];
    }

    private function fmtGallery($doc): array
    {
        return [
            'id'          => (string) $doc['_id'],
            'title'       => $doc['title']     ?? null,
            'media_url'   => $doc['media_url'] ?? null,
            'type'        => $doc['type']      ?? null,
            'uploaded_at' => isset($doc['uploaded_at'])
                ? $doc['uploaded_at']->toDateTime()->format('Y-m-d H:i:s') : null,
        ];
    }
}