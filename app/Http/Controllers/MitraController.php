<?php

namespace App\Http\Controllers;

use App\Models\MitraReport;
use App\Models\Partner;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use MongoDB\BSON\Regex;

class MitraController extends Controller
{
    private const ROLE_MITRA = 'RL04';

    public function index(Request $request)
    {
        $page    = max(1, (int) $request->query('page', 1));
        $perPage = max(1, min(50, (int) $request->query('per_page', 10)));
        $search  = trim($request->query('search', ''));
        $status  = trim($request->query('status', ''));
        $skip    = ($page - 1) * $perPage;

        $query = Partner::query();

        if ($search !== '') {
            $regex = new Regex(preg_quote($search, '/'), 'i');
            $query->where(function ($q) use ($regex) {
                $q->where('institution_name', $regex)
                  ->orWhere('contact_person', $regex)
                  ->orWhere('phone', $regex);
            });
        }

        if (in_array($status, ['Active', 'Inactive'], true)) {
            $query->where('status', $status);
        }

        $total    = $query->count();
        $partners = $query->orderBy('institution_name')->skip($skip)->take($perPage)->get();

        return response()->json([
            'success' => true,
            'data'    => $partners->map(fn($p) => $this->format($p)),
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
        $partner = Partner::find($id);

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->format($partner)]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'institution_name' => 'required|string|max:200',
            'contact_person'   => 'required|string|max:150',
            'phone'            => 'required|string|max:20',
            'mou_file'         => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:5120',
            'status'           => 'required|in:Active,Inactive',
            'username'         => 'required|string|min:4|max:50|alpha_num',
            'password'         => 'required|string|min:8|max:100',
            'email'            => 'nullable|email|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if (User::where('username', $request->username)->exists()) {
            return response()->json(['success' => false, 'message' => 'Username sudah digunakan.'], 409);
        }

        if ($request->email && User::where('email', $request->email)->exists()) {
            return response()->json(['success' => false, 'message' => 'Email sudah digunakan.'], 409);
        }

        if (Partner::where('phone', $request->phone)->exists()) {
            return response()->json(['success' => false, 'message' => 'Nomor telepon sudah terdaftar.'], 409);
        }

        $mouFileUrl = null;
        if ($request->hasFile('mou_file')) {
            $path       = $request->file('mou_file')->store('mous', 'public');
            $mouFileUrl = url('storage/' . $path);
        }

        $user = User::create([
            'role_id'  => self::ROLE_MITRA,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'email'    => $request->email ?? null,
            'photo'    => null,
        ]);

        try {
            $partner = Partner::create([
                'user_id'          => (string) $user->_id,
                'institution_name' => $request->institution_name,
                'contact_person'   => $request->contact_person,
                'phone'            => $request->phone,
                'mou_file_url'     => $mouFileUrl,
                'status'           => $request->status,
            ]);
        } catch (\Exception $e) {
            $user->delete();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan data mitra. Akun telah di-rollback.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mitra berhasil ditambahkan beserta akun.',
            'data'    => $this->format($partner),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'institution_name' => 'required|string|max:200',
            'contact_person'   => 'required|string|max:150',
            'phone'            => 'required|string|max:20',
            'mou_file'         => 'nullable|file|mimes:pdf,doc,docx,jpg,png|max:5120',
            'status'           => 'required|in:Active,Inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $partner = Partner::find($id);
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        if (Partner::where('phone', $request->phone)->where('_id', '!=', $id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Nomor telepon sudah digunakan mitra lain.'], 409);
        }

        $mouFileUrl = $partner->mou_file_url ?? null;
        if ($request->hasFile('mou_file')) {
            if ($mouFileUrl) {
                $parsed = parse_url($mouFileUrl, PHP_URL_PATH);
                if ($parsed) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $parsed));
                }
            }
            $path       = $request->file('mou_file')->store('mous', 'public');
            $mouFileUrl = url('storage/' . $path);
        }

        $partner->update([
            'institution_name' => $request->institution_name,
            'contact_person'   => $request->contact_person,
            'phone'            => $request->phone,
            'mou_file_url'     => $mouFileUrl,
            'status'           => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data mitra berhasil diperbarui.',
            'data'    => $this->format($partner->fresh()),
        ]);
    }

    public function resetPassword(string $id)
    {
        $partner = Partner::find($id);
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        if (empty($partner->user_id)) {
            return response()->json(['success' => false, 'message' => 'Akun mitra tidak ditemukan.'], 404);
        }

        $user = User::find($partner->user_id);
        if ($user) {
            $newPassword = Str::random(12);
            $user->update(['password' => Hash::make($newPassword)]);
        }

        Log::info('audit.password_reset', [
            'target'    => 'mitra',
            'target_id' => (string) $partner->_id,
            'user_id'   => $partner->user_id ?? null,
            'by_admin'  => auth()->id(),
            'ip'        => request()->ip(),
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'Password mitra berhasil direset.',
            'new_password' => $newPassword ?? null,
        ]);
    }

    public function destroy(string $id)
    {
        $partner = Partner::find($id);
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Mitra tidak ditemukan.'], 404);
        }

        if (!empty($partner->mou_file_url)) {
            $parsed = parse_url($partner->mou_file_url, PHP_URL_PATH);
            if ($parsed) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $parsed));
            }
        }

        // Cascade: hapus semua laporan mitra beserta file-nya
        MitraReport::where('partner_id', (string) $partner->_id)->each(function ($report) {
            if (!empty($report->file_path)) {
                Storage::disk('public')->delete($report->file_path);
            }
            $report->delete();
        });

        $partner->delete();

        if (!empty($partner->user_id)) {
            User::find($partner->user_id)?->delete();
        }

        Log::info('audit.mitra_deleted', [
            'partner_id'       => (string) $partner->_id,
            'institution_name' => $partner->institution_name ?? '—',
            'by_admin'         => auth()->id(),
            'ip'               => request()->ip(),
        ]);

        return response()->json(['success' => true, 'message' => 'Mitra dan akun pengguna berhasil dihapus.']);
    }

    public function ownProfile()
    {
        $userId  = (string) Auth::id();
        $user    = Auth::user();
        $partner = Partner::where('user_id', $userId)->first();

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Data mitra tidak ditemukan.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'institution_name' => $partner->institution_name ?? null,
                'contact_person'   => $partner->contact_person   ?? null,
                'phone'            => $partner->phone             ?? null,
                'status'           => $partner->status            ?? null,
                'email'            => $user->email                ?? null,
            ],
        ]);
    }

    public function updateOwnProfile(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|min:4|max:50|alpha_num',
            'photo'    => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator);
        }

        $user = Auth::user();
        if (!$user) {
            return back()->withErrors(['auth' => 'User tidak ditemukan.']);
        }

        if (User::where('username', $request->username)->where('_id', '!=', (string) $user->_id)->exists()) {
            return back()->withErrors(['username' => 'Username sudah digunakan.']);
        }

        $photoUrl = $user->photo ?? null;
        if ($request->hasFile('photo')) {
            if ($photoUrl && str_contains($photoUrl, '/storage/')) {
                $parsedPath = parse_url($photoUrl, PHP_URL_PATH);
                if ($parsedPath) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $parsedPath));
                }
            }
            $path     = $request->file('photo')->store('profile', 'public');
            $photoUrl = url('storage/' . $path);
        }

        $user->update([
            'username' => $request->username,
            'photo'    => $photoUrl,
        ]);

        Auth::setUser($user->fresh());

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updateOwnPassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($request->current_password, $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini salah.']);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }

    private function format($doc): array
    {
        return [
            'id'               => (string) $doc->_id,
            'user_id'          => $doc->user_id ?? null,
            'institution_name' => $doc->institution_name,
            'contact_person'   => $doc->contact_person,
            'phone'            => $doc->phone,
            'mou_file_url'     => $doc->mou_file_url ?? null,
            'status'           => $doc->status,
            'created_at'       => $doc->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
