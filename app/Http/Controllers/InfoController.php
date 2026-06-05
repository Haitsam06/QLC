<?php

namespace App\Http\Controllers;

use App\Models\Foundation;
use App\Models\Gallery;
use App\Models\Leader;
use App\Models\Profile;
use App\Models\Program;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class InfoController extends Controller
{
    /* ═══════════════════════════════════════════════════════
       PROFILES
    ═══════════════════════════════════════════════════════ */
    public function profileShow()
    {
        $doc = Profile::first();
        return response()->json(['success' => true, 'data' => $doc ? $this->fmtProfile($doc) : null]);
    }

    public function profileUpsert(Request $request)
    {
        $existing = Profile::first();

        $request->validate([
            'name'             => 'nullable|string|max:200',
            'hero_title'       => 'nullable|string|max:300',
            'tagline'          => 'nullable|string|max:500',
            'history'          => 'nullable|string|max:5000',
            'vision'           => 'nullable|string|max:2000',
            'mission'          => 'nullable|string|max:2000',
            'address'          => 'nullable|string|max:500',
            'whatsapp'         => 'nullable|string|max:20',
            'email'            => 'nullable|email|max:150',
            'established_year' => 'nullable|string|max:100',
            'main_focus'       => 'nullable|string|max:500',
            'bank_name'        => 'nullable|string|max:100',
            'bank_account'     => 'nullable|string|max:30',
            'bank_holder'      => 'nullable|string|max:150',
            'bank_nominal'     => 'nullable|string|max:200',
            'logo'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'about_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        // Handle Logo
        $logoUrl = $existing?->logo ?? null;
        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $parsedPath = parse_url($logoUrl, PHP_URL_PATH);
            if ($parsedPath) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $parsedPath));
            }
            $path    = $request->file('logo')->store('info/logos', 'public');
            $logoUrl = url('storage/' . $path);
        }

        // Handle About Image
        $aboutImageUrl = $existing?->about_image ?? null;
        if ($request->hasFile('about_image') && $request->file('about_image')->isValid()) {
            $parsedPath = parse_url($aboutImageUrl, PHP_URL_PATH);
            if ($parsedPath) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $parsedPath));
            }
            $path          = $request->file('about_image')->store('info/about', 'public');
            $aboutImageUrl = url('storage/' . $path);
        }

        $socialMedia = null;
        if ($request->filled('social_media')) {
            $decoded     = json_decode($request->social_media, true);
            $socialMedia = is_array($decoded) ? $decoded : null;
        }

        $payload = [
            'name'             => $request->name,
            'hero_title'       => $request->hero_title,
            'logo'             => $logoUrl,
            'about_image'      => $aboutImageUrl,
            'tagline'          => $request->tagline,
            'history'          => $request->history,
            'vision'           => $request->vision,
            'mission'          => $request->mission,
            'address'          => $request->address,
            'whatsapp'         => $request->whatsapp,
            'email'            => $request->email,
            'social_media'     => $socialMedia,
            'established_year' => $request->established_year,
            'main_focus'       => $request->main_focus,
            'bank_name'        => $request->bank_name    ?? $existing?->bank_name,
            'bank_account'     => $request->bank_account ?? $existing?->bank_account,
            'bank_holder'      => $request->bank_holder  ?? $existing?->bank_holder,
            'bank_nominal'     => $request->bank_nominal ?? $existing?->bank_nominal,
        ];

        if ($existing) {
            $existing->update($payload);
            $profile = $existing->fresh();
        } else {
            $profile = Profile::create($payload);
        }

        return response()->json(['success' => true, 'data' => $this->fmtProfile($profile)]);
    }

    /* ═══════════════════════════════════════════════════════
       FOUNDATIONS (Pilar)
    ═══════════════════════════════════════════════════════ */
    public function foundationIndex()
    {
        $data = Foundation::all()->map(fn($doc) => $this->fmtFoundation($doc))->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function foundationStore(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:2000',
        ]);

        $doc = Foundation::create($validated);
        return response()->json(['success' => true, 'data' => $this->fmtFoundation($doc)]);
    }

    public function foundationUpdate(Request $request, string $id)
    {
        $doc = Foundation::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:200',
            'description' => 'nullable|string|max:2000',
        ]);

        $doc->update($validated);
        return response()->json(['success' => true]);
    }

    public function foundationDestroy(string $id)
    {
        $doc = Foundation::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }
        $doc->delete();
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       LEADERS (Pengurus)
    ═══════════════════════════════════════════════════════ */
    public function leaderIndex()
    {
        $data = Leader::all()->map(fn($doc) => $this->fmtLeader($doc))->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function leaderStore(Request $request)
    {
        $request->validate([
            'nama'      => 'required|string|max:150',
            'jabatan'   => 'nullable|string|max:150',
            'deskripsi' => 'nullable|string|max:1000',
            'poin'      => 'nullable|string|max:2000',
            'image'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path     = $request->file('image')->store('info/leaders', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $doc = Leader::create([
            'nama'      => $request->nama,
            'jabatan'   => $request->jabatan,
            'deskripsi' => $request->deskripsi,
            'poin'      => $request->poin ?: null,
            'image_url' => $imageUrl,
        ]);

        return response()->json(['success' => true, 'data' => $this->fmtLeader($doc)]);
    }

    public function leaderUpdate(Request $request, string $id)
    {
        $doc = Leader::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }

        $request->validate([
            'nama'      => 'required|string|max:150',
            'jabatan'   => 'nullable|string|max:150',
            'deskripsi' => 'nullable|string|max:1000',
            'poin'      => 'nullable|string|max:2000',
            'image'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $imageUrl = $doc->image_url ?? null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($imageUrl) {
                $oldPath = str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH));
                Storage::disk('public')->delete($oldPath);
            }
            $path     = $request->file('image')->store('info/leaders', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $doc->update([
            'nama'      => $request->nama,
            'jabatan'   => $request->jabatan,
            'deskripsi' => $request->deskripsi,
            'poin'      => $request->poin ?: null,
            'image_url' => $imageUrl,
        ]);

        return response()->json(['success' => true]);
    }

    public function leaderDestroy(string $id)
    {
        $doc = Leader::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }
        if (!empty($doc->image_url)) {
            $path = str_replace('/storage/', '', parse_url($doc->image_url, PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }
        $doc->delete();
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       PROGRAMS
    ═══════════════════════════════════════════════════════ */
    public function programIndex(Request $request)
    {
        $data = Program::orderBy('name')->get()->map(fn($doc) => $this->fmtProgram($doc))->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function programStore(Request $request)
    {
        $request->validate([
            'name'             => 'required|string|max:200',
            'description'      => 'nullable|string|max:5000',
            'target_audience'  => 'nullable|string|max:500',
            'advantages'       => 'nullable|string',
            'image'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'hero_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'about_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'gallery_images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            $path     = $request->file('image')->store('info/programs', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $heroImageUrl = null;
        if ($request->hasFile('hero_image') && $request->file('hero_image')->isValid()) {
            $path         = $request->file('hero_image')->store('info/programs/hero', 'public');
            $heroImageUrl = url('storage/' . $path);
        }

        $aboutImageUrl = null;
        if ($request->hasFile('about_image') && $request->file('about_image')->isValid()) {
            $path          = $request->file('about_image')->store('info/programs/about', 'public');
            $aboutImageUrl = url('storage/' . $path);
        }

        $galleryUrls = [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                if ($file->isValid()) {
                    $path          = $file->store('info/programs/gallery', 'public');
                    $galleryUrls[] = url('storage/' . $path);
                }
            }
        }

        $advantages = [];
        if ($request->filled('advantages')) {
            $decoded    = json_decode($request->advantages, true);
            $advantages = is_array($decoded) ? $decoded : [];
        }

        $doc = Program::create([
            'name'            => $request->name,
            'description'     => $request->description,
            'target_audience' => $request->target_audience,
            'image_url'       => $imageUrl,
            'hero_image_url'  => $heroImageUrl,
            'about_image_url' => $aboutImageUrl,
            'advantages'      => $advantages,
            'gallery'         => $galleryUrls,
        ]);

        return response()->json(['success' => true, 'data' => $this->fmtProgram($doc)]);
    }

    public function programUpdate(Request $request, string $id)
    {
        $doc = Program::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }

        $request->validate([
            'name'             => 'required|string|max:200',
            'description'      => 'nullable|string|max:5000',
            'target_audience'  => 'nullable|string|max:500',
            'advantages'       => 'nullable|string',
            'image'            => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'hero_image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'about_image'      => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'gallery_images.*' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        $imageUrl = $doc->image_url ?? null;
        if ($request->hasFile('image') && $request->file('image')->isValid()) {
            if ($imageUrl) {
                Storage::disk('public')->delete(str_replace('/storage/', '', parse_url($imageUrl, PHP_URL_PATH)));
            }
            $path     = $request->file('image')->store('info/programs', 'public');
            $imageUrl = url('storage/' . $path);
        }

        $heroImageUrl = $doc->hero_image_url ?? null;
        if ($request->hasFile('hero_image') && $request->file('hero_image')->isValid()) {
            if ($heroImageUrl) {
                Storage::disk('public')->delete(str_replace('/storage/', '', parse_url($heroImageUrl, PHP_URL_PATH)));
            }
            $path         = $request->file('hero_image')->store('info/programs/hero', 'public');
            $heroImageUrl = url('storage/' . $path);
        }

        $aboutImageUrl = $doc->about_image_url ?? null;
        if ($request->hasFile('about_image') && $request->file('about_image')->isValid()) {
            if ($aboutImageUrl) {
                Storage::disk('public')->delete(str_replace('/storage/', '', parse_url($aboutImageUrl, PHP_URL_PATH)));
            }
            $path          = $request->file('about_image')->store('info/programs/about', 'public');
            $aboutImageUrl = url('storage/' . $path);
        }

        $galleryUrls = $doc->gallery ?? [];
        if ($request->hasFile('gallery_images')) {
            foreach ($request->file('gallery_images') as $file) {
                if ($file->isValid()) {
                    $path          = $file->store('info/programs/gallery', 'public');
                    $galleryUrls[] = url('storage/' . $path);
                }
            }
        }

        $advantages = $doc->advantages ?? [];
        if ($request->filled('advantages')) {
            $decoded    = json_decode($request->advantages, true);
            $advantages = is_array($decoded) ? $decoded : [];
        }

        $doc->update([
            'name'            => $request->name,
            'description'     => $request->description,
            'target_audience' => $request->target_audience,
            'image_url'       => $imageUrl,
            'hero_image_url'  => $heroImageUrl,
            'about_image_url' => $aboutImageUrl,
            'advantages'      => $advantages,
            'gallery'         => array_values($galleryUrls),
        ]);

        return response()->json(['success' => true]);
    }

    public function programGalleryDestroy(string $id, int $index)
    {
        $doc = Program::find($id);
        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Program tidak ditemukan.'], 404);
        }

        $gallery = array_values($doc->gallery ?? []);

        if (!isset($gallery[$index])) {
            return response()->json(['success' => false, 'message' => 'Gambar tidak ditemukan.'], 404);
        }

        $fileUrl = $gallery[$index];
        $path    = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));
        Storage::disk('public')->delete($path);

        array_splice($gallery, $index, 1);
        $doc->update(['gallery' => array_values($gallery)]);

        return response()->json(['success' => true]);
    }

    public function programDestroy(string $id)
    {
        $doc = Program::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }

        $filesToDelete = array_filter([
            $doc->image_url,
            $doc->hero_image_url,
            $doc->about_image_url,
        ]);

        foreach ($doc->gallery ?? [] as $g) {
            $filesToDelete[] = $g;
        }

        foreach ($filesToDelete as $fileUrl) {
            $path = str_replace('/storage/', '', parse_url($fileUrl, PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }

        $doc->delete();
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       GALLERY
    ═══════════════════════════════════════════════════════ */
    public function galleryIndex(Request $request)
    {
        $data = Gallery::orderBy('uploaded_at', 'desc')->get()->map(fn($doc) => $this->fmtGallery($doc))->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function galleryStore(Request $request)
    {
        $request->validate([
            'title'     => 'required|string|max:200',
            'type'      => 'required|in:Photo,Video',
            'media'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'media_url' => 'nullable|url|max:500',
        ]);

        $mediaUrl = $request->media_url ?? null;
        if ($request->type === 'Photo' && $request->hasFile('media') && $request->file('media')->isValid()) {
            $path     = $request->file('media')->store('info/gallery', 'public');
            $mediaUrl = url('storage/' . $path);
        }

        $doc = Gallery::create([
            'title'     => $request->title,
            'media_url' => $mediaUrl,
            'type'      => $request->type,
        ]);

        return response()->json(['success' => true, 'data' => $this->fmtGallery($doc)]);
    }

    public function galleryUpdate(Request $request, string $id)
    {
        $doc = Gallery::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }

        $request->validate([
            'title'     => 'required|string|max:200',
            'type'      => 'required|in:Photo,Video',
            'media'     => 'nullable|image|mimes:jpg,jpeg,png,webp|max:4096',
            'media_url' => 'nullable|url|max:500',
        ]);

        $mediaUrl = $doc->media_url ?? null;
        if ($request->type === 'Photo' && $request->hasFile('media') && $request->file('media')->isValid()) {
            if ($mediaUrl && str_contains($mediaUrl, '/storage/')) {
                $parsedPath = parse_url($mediaUrl, PHP_URL_PATH);
                if ($parsedPath) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $parsedPath));
                }
            }
            $path     = $request->file('media')->store('info/gallery', 'public');
            $mediaUrl = url('storage/' . $path);
        } elseif ($request->type === 'Video') {
            if ($doc->type === 'Photo' && $mediaUrl && str_contains($mediaUrl, '/storage/')) {
                $parsedPath = parse_url($mediaUrl, PHP_URL_PATH);
                if ($parsedPath) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $parsedPath));
                }
            }
            $mediaUrl = $request->filled('media_url') ? $request->media_url : null;
        }

        $doc->update(['title' => $request->title, 'type' => $request->type, 'media_url' => $mediaUrl]);
        return response()->json(['success' => true]);
    }

    public function galleryDestroy(string $id)
    {
        $doc = Gallery::find($id);
        if (!$doc) {
            return response()->json(['success' => false], 404);
        }
        if ($doc->type === 'Photo' && !empty($doc->media_url)) {
            $path = str_replace('/storage/', '', parse_url($doc->media_url, PHP_URL_PATH));
            Storage::disk('public')->delete($path);
        }
        $doc->delete();
        return response()->json(['success' => true]);
    }

    /* ═══════════════════════════════════════════════════════
       HELPERS FORMATTER
    ═══════════════════════════════════════════════════════ */
    private function fmtProfile($doc): array
    {
        return [
            'id'               => (string) $doc->_id,
            'name'             => $doc->name             ?? null,
            'hero_title'       => $doc->hero_title       ?? null,
            'logo'             => $doc->logo             ?? null,
            'about_image'      => $doc->about_image      ?? null,
            'tagline'          => $doc->tagline          ?? null,
            'history'          => $doc->history          ?? null,
            'vision'           => $doc->vision           ?? null,
            'mission'          => $doc->mission          ?? null,
            'address'          => $doc->address          ?? null,
            'whatsapp'         => $doc->whatsapp         ?? null,
            'email'            => $doc->email            ?? null,
            'social_media'     => $doc->social_media     ?? null,
            'established_year' => $doc->established_year ?? null,
            'main_focus'       => $doc->main_focus       ?? null,
            'bank_name'        => $doc->bank_name        ?? null,
            'bank_account'     => $doc->bank_account     ?? null,
            'bank_holder'      => $doc->bank_holder      ?? null,
            'bank_nominal'     => $doc->bank_nominal     ?? null,
            'updated_at'       => $doc->updated_at?->format('Y-m-d H:i:s'),
            'created_at'       => $doc->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function fmtFoundation($doc): array
    {
        return [
            'id'          => (string) $doc->_id,
            'title'       => $doc->title       ?? null,
            'description' => $doc->description ?? null,
            'created_at'  => $doc->created_at?->format('Y-m-d H:i:s'),
            'updated_at'  => $doc->updated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function fmtLeader($doc): array
    {
        return [
            'id'        => (string) $doc->_id,
            'nama'      => $doc->nama      ?? null,
            'jabatan'   => $doc->jabatan   ?? null,
            'deskripsi' => $doc->deskripsi ?? null,
            'poin'      => $doc->poin      ?? null,
            'image_url' => $doc->image_url ?? null,
        ];
    }

    private function fmtProgram($doc): array
    {
        return [
            'id'              => (string) $doc->_id,
            'name'            => $doc->name            ?? null,
            'description'     => $doc->description     ?? null,
            'target_audience' => $doc->target_audience ?? null,
            'image_url'       => $doc->image_url       ?? null,
            'hero_image_url'  => $doc->hero_image_url  ?? null,
            'about_image_url' => $doc->about_image_url ?? null,
            'advantages'      => $doc->advantages      ?? [],
            'gallery'         => $doc->gallery         ?? [],
        ];
    }

    private function fmtGallery($doc): array
    {
        return [
            'id'          => (string) $doc->_id,
            'title'       => $doc->title     ?? null,
            'media_url'   => $doc->media_url ?? null,
            'type'        => $doc->type      ?? null,
            'uploaded_at' => $doc->uploaded_at?->format('Y-m-d H:i:s'),
        ];
    }
}
