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
    private $foundations;
    private $leaders;

    public function __construct()
    {
        $client = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->profiles = $db->selectCollection('profiles');
        $this->programs = $db->selectCollection('programs');
        $this->gallery = $db->selectCollection('gallery');
        $this->foundations = $db->selectCollection('foundations');
        $this->leaders = $db->selectCollection('leaders');
    }

    /* ═══════════════════════════════════════════════════════
       PROFILES
    ═══════════════════════════════════════════════════════ */
    public function profileShow()
    {
        $doc = $this->profiles->findOne([]);
        return response()->json(['success' => true, 'data' => $doc ? $this->fmtProfile($doc) : null]);
    }

    public function profileUpsert(Request $request)
    {
        $existing = $this->profiles->findOne([]);

        // 1. Handle Logo
        $logoUrl = $existing['logo'] ?? null;
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            if ($logoUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($logoUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('logo')->store('info/logos', 'public');
            $logoUrl = Storage::url($path);
        }

        // 2. Handle About Image
        $aboutImageUrl = $existing['about_image'] ?? null;
        if ($request->hasFile('about_image') && $request->file('about_image')->isValid()) {
            if ($aboutImageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($aboutImageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('about_image')->store('info/about', 'public');
            $aboutImageUrl = Storage::url($path);
        }

        $socialMedia = null;
        if ($request->filled('social_media')) {
            $decoded = json_decode($request->social_media, true);
            $socialMedia = is_array($decoded) ? $decoded : null;
        }

        $payload = [
            'name' => $request->name,
            'hero_title' => $request->hero_title,
            'logo' => $logoUrl,
            'about_image' => $aboutImageUrl,
            'tagline' => $request->tagline,
            'history' => $request->history,
            'vision' => $request->vision,
            'mission' => $request->mission,
            'address' => $request->address,
            'whatsapp' => $request->whatsapp,
            'email' => $request->email,
            'social_media' => $socialMedia,
            'established_year' => $request->established_year,
            'main_focus' => $request->main_focus,
            'bank_name' => $request->bank_name ?? ($existing['bank_name'] ?? null),
            'bank_account' => $request->bank_account ?? ($existing['bank_account'] ?? null),
            'bank_holder' => $request->bank_holder ?? ($existing['bank_holder'] ?? null),
            'bank_nominal' => $request->bank_nominal ?? ($existing['bank_nominal'] ?? null),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        if (!$existing) {
            $payload['created_at'] = new \MongoDB\BSON\UTCDateTime();
            $result = $this->profiles->insertOne($payload);
            $payload['_id'] = $result->getInsertedId();
        } else {
            $this->profiles->updateOne(['_id' => $existing['_id']], ['$set' => $payload]);
            $payload['_id'] = $existing['_id'];
        }

        $updated = $this->profiles->findOne(['_id' => $payload['_id']]);
        return response()->json(['success' => true, 'data' => $this->fmtProfile($updated)]);
    }

    /* ═══════════════════════════════════════════════════════
       FOUNDATIONS (Pilar)
    ═══════════════════════════════════════════════════════ */
    public function foundationIndex()
    {
        $cursor = $this->foundations->find([]);
        $data = [];
        foreach ($cursor as $doc)
            $data[] = $this->fmtFoundation($doc);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function foundationStore(Request $request)
    {
        $doc = [
            'title' => $request->title,
            'description' => $request->description,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];
        $result = $this->foundations->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();
        return response()->json(['success' => true, 'data' => $this->fmtFoundation($doc)]);
    }

    public function foundationUpdate(Request $request, string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $this->foundations->updateOne(
            ['_id' => $oid],
            ['$set' => ['title' => $request->title, 'description' => $request->description, 'updated_at' => new \MongoDB\BSON\UTCDateTime()]]
        );
        return response()->json(['success' => true]);
    }

    public function foundationDestroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $this->foundations->deleteOne(['_id' => $oid]);
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       LEADERS (Pengurus)
    ═══════════════════════════════════════════════════════ */
    public function leaderIndex()
    {
        $cursor = $this->leaders->find([]);
        $data = [];
        foreach ($cursor as $doc)
            $data[] = $this->fmtLeader($doc);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function leaderStore(Request $request)
    {
        $imageUrl = null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('info/leaders', 'public');
            $imageUrl = Storage::url($path);
        }

        $doc = [
            'nama' => $request->nama,
            'jabatan' => $request->jabatan,
            'deskripsi' => $request->deskripsi,
            'poin' => $request->poin,
            'image_url' => $imageUrl,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->leaders->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();
        return response()->json(['success' => true, 'data' => $this->fmtLeader($doc)]);
    }

    public function leaderUpdate(Request $request, string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $existing = $this->leaders->findOne(['_id' => $oid]);
        if (!$existing)
            return response()->json(['success' => false], 404);

        $imageUrl = $existing['image_url'] ?? null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($imageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('info/leaders', 'public');
            $imageUrl = Storage::url($path);
        }

        $this->leaders->updateOne(
            ['_id' => $oid],
            [
                '$set' => [
                    'nama' => $request->nama,
                    'jabatan' => $request->jabatan,
                    'deskripsi' => $request->deskripsi,
                    'poin' => $request->poin,
                    'image_url' => $imageUrl,
                    'updated_at' => new \MongoDB\BSON\UTCDateTime(),
                ]
            ]
        );
        return response()->json(['success' => true]);
    }

    public function leaderDestroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $doc = $this->leaders->findOne(['_id' => $oid]);
        if ($doc && !empty($doc['image_url'])) {
            $path = str_replace('/storage/', '', parse_url($doc['image_url'], PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }
        $this->leaders->deleteOne(['_id' => $oid]);
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       PROGRAMS
    ═══════════════════════════════════════════════════════ */
    public function programIndex(Request $request)
    {
        $cursor = $this->programs->find([], ['sort' => ['name' => 1]]);
        $data = [];
        foreach ($cursor as $doc)
            $data[] = $this->fmtProgram($doc);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function programStore(Request $request)
    {
        // Thumbnail lama
        $imageUrl = null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path = $request->file('image')->store('info/programs', 'public');
            $imageUrl = Storage::url($path);
        }

        // Hero Image
        $heroImageUrl = null;
        if ($request->hasFile('hero_image') && $request->file('hero_image')->isValid()) {
            $path = $request->file('hero_image')->store('info/programs/hero', 'public');
            $heroImageUrl = Storage::url($path);
        }

        // About Image
        $aboutImageUrl = null;
        if ($request->hasFile('about_image') && $request->file('about_image')->isValid()) {
            $path = $request->file('about_image')->store('info/programs/about', 'public');
            $aboutImageUrl = Storage::url($path);
        }

        // Gallery Images (Multi Upload)
        $galleryUrls = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                if ($file->isValid()) {
                    $path = $file->store('info/programs/gallery', 'public');
                    $galleryUrls[] = Storage::url($path);
                }
            }
        }

        // Advantages (Decode JSON)
        $advantages = [];
        if ($request->filled('advantages')) {
            $decoded = json_decode($request->advantages, true);
            $advantages = is_array($decoded) ? $decoded : [];
        }

        $doc = [
            'name' => $request->name,
            'description' => $request->description,
            'target_audience' => $request->target_audience,
            // 'duration' telah dihapus
            'image_url' => $imageUrl,
            'hero_image_url' => $heroImageUrl,
            'about_image_url' => $aboutImageUrl,
            'advantages' => $advantages,
            'gallery' => $galleryUrls,
            'created_at' => new \MongoDB\BSON\UTCDateTime(),
            'updated_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->programs->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();
        return response()->json(['success' => true, 'data' => $this->fmtProgram($doc)]);
    }

    public function programUpdate(Request $request, string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }

        $existing = $this->programs->findOne(['_id' => $oid]);
        if (!$existing)
            return response()->json(['success' => false], 404);

        // Update Thumbnail Lama
        $imageUrl = $existing['image_url'] ?? null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($imageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('info/programs', 'public');
            $imageUrl = Storage::url($path);
        }

        // Update Hero Image
        $heroImageUrl = $existing['hero_image_url'] ?? null;
        if ($request->hasFile('hero_image') && $request->file('hero_image')->isValid()) {
            if ($heroImageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($heroImageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('hero_image')->store('info/programs/hero', 'public');
            $heroImageUrl = Storage::url($path);
        }

        // Update About Image
        $aboutImageUrl = $existing['about_image_url'] ?? null;
        if ($request->hasFile('about_image') && $request->file('about_image')->isValid()) {
            if ($aboutImageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($aboutImageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('about_image')->store('info/programs/about', 'public');
            $aboutImageUrl = Storage::url($path);
        }

        // Update Gallery Images
        $galleryUrls = (isset($existing['gallery']) && is_array($existing['gallery'])) ? iterator_to_array($existing['gallery']) : [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                if ($file->isValid()) {
                    $path = $file->store('info/programs/gallery', 'public');
                    $galleryUrls[] = Storage::url($path);
                }
            }
        }

        // Update Advantages
        $advantages = (isset($existing['advantages']) && is_array($existing['advantages'])) ? iterator_to_array($existing['advantages']) : [];
        if ($request->filled('advantages')) {
            $decoded = json_decode($request->advantages, true);
            $advantages = is_array($decoded) ? $decoded : [];
        }

        $this->programs->updateOne(
            ['_id' => $oid],
            [
                '$set' => [
                    'name' => $request->name,
                    'description' => $request->description,
                    'target_audience' => $request->target_audience,
                    // 'duration' telah dihapus
                    'image_url' => $imageUrl,
                    'hero_image_url' => $heroImageUrl,
                    'about_image_url' => $aboutImageUrl,
                    'advantages' => $advantages,
                    'gallery' => array_values($galleryUrls),
                    'updated_at' => new \MongoDB\BSON\UTCDateTime(),
                ]
            ]
        );
        return response()->json(['success' => true]);
    }

    public function programDestroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $doc = $this->programs->findOne(['_id' => $oid]);

        if ($doc) {
            $filesToDelete = [];
            if (!empty($doc['image_url']))
                $filesToDelete[] = $doc['image_url'];
            if (!empty($doc['hero_image_url']))
                $filesToDelete[] = $doc['hero_image_url'];
            if (!empty($doc['about_image_url']))
                $filesToDelete[] = $doc['about_image_url'];

            if (!empty($doc['gallery']) && is_array($doc['gallery'])) {
                foreach ($doc['gallery'] as $g) {
                    $filesToDelete[] = $g;
                }
            }

            foreach ($filesToDelete as $fileUrl) {
                $path = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($path);
            }
        }

        $this->programs->deleteOne(['_id' => $oid]);
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       GALLERY
    ═══════════════════════════════════════════════════════ */
    public function galleryIndex(Request $request)
    {
        $cursor = $this->gallery->find([], ['sort' => ['uploaded_at' => -1]]);
        $data = [];
        foreach ($cursor as $doc)
            $data[] = $this->fmtGallery($doc);
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function galleryStore(Request $request)
    {
        $mediaUrl = $request->media_url ?? null;
        if ($request->type === 'Photo' && $request->hasFile('media') && $request->file('media')->isValid()) {
            $path = $request->file('media')->store('info/gallery', 'public');
            $mediaUrl = Storage::url($path);
        }

        $doc = [
            'title' => $request->title,
            'media_url' => $mediaUrl,
            'type' => $request->type,
            'uploaded_at' => new \MongoDB\BSON\UTCDateTime(),
        ];

        $result = $this->gallery->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();
        return response()->json(['success' => true, 'data' => $this->fmtGallery($doc)]);
    }

    public function galleryUpdate(Request $request, string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $existing = $this->gallery->findOne(['_id' => $oid]);
        if (!$existing)
            return response()->json(['success' => false], 404);

        $mediaUrl = $existing['media_url'] ?? null;
        if ($request->type === 'Photo' && $request->hasFile('media') && $request->file('media')->isValid()) {
            if ($mediaUrl && !str_starts_with($mediaUrl, 'http')) {
                $oldPath = str_replace('/storage/', '', parse_url($mediaUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('media')->store('info/gallery', 'public');
            $mediaUrl = Storage::url($path);
        } elseif ($request->type === 'Video' && $request->filled('media_url')) {
            $mediaUrl = $request->media_url;
        }

        $this->gallery->updateOne(
            ['_id' => $oid],
            ['$set' => ['title' => $request->title, 'type' => $request->type, 'media_url' => $mediaUrl]]
        );
        return response()->json(['success' => true]);
    }

    public function galleryDestroy(string $id)
    {
        try {
            $oid = new ObjectId($id);
        } catch (\Exception $e) {
            return response()->json(['success' => false], 400);
        }
        $doc = $this->gallery->findOne(['_id' => $oid]);
        if ($doc && $doc['type'] === 'Photo' && !empty($doc['media_url'])) {
            $path = str_replace('/storage/', '', parse_url($doc['media_url'], PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }
        $this->gallery->deleteOne(['_id' => $oid]);
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       HELPERS FORMATTER
    ═══════════════════════════════════════════════════════ */
    private function fmtProfile($doc): array
    {
        $doc['id'] = (string) $doc['_id'];
        unset($doc['_id']);

        if (isset($doc['updated_at'])) {
            $doc['updated_at'] = $doc['updated_at']->toDateTime()->format('Y-m-d H:i:s');
        }
        if (isset($doc['created_at'])) {
            $doc['created_at'] = $doc['created_at']->toDateTime()->format('Y-m-d H:i:s');
        }

        return (array) $doc;
    }
    private function fmtFoundation($doc): array
    {
        $doc['id'] = (string) $doc['_id'];
        unset($doc['_id']);
        return (array) $doc;
    }
    private function fmtLeader($doc): array
    {
        $doc['id'] = (string) $doc['_id'];
        unset($doc['_id']);
        return (array) $doc;
    }
    private function fmtProgram($doc): array
    {
        $doc['id'] = (string) $doc['_id'];
        unset($doc['_id']);

        if (isset($doc['advantages']) && is_object($doc['advantages'])) {
            $doc['advantages'] = iterator_to_array($doc['advantages']);
        }
        if (isset($doc['gallery']) && is_object($doc['gallery'])) {
            $doc['gallery'] = iterator_to_array($doc['gallery']);
        }

        return (array) $doc;
    }
    private function fmtGallery($doc): array
    {
        $doc['id'] = (string) $doc['_id'];
        unset($doc['_id']);
        return (array) $doc;
    }
}