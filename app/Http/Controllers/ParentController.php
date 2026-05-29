<?php

namespace App\Http\Controllers;

use App\Models\Parents;
use App\Models\ProgressReport;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use MongoDB\BSON\Regex;

class ParentController extends Controller
{
    private const ROLE_PARENT = 'RL03';

    public function index(Request $request)
    {
        $search  = $request->query('search', '');
        $perPage = max(1, min(100, (int) $request->query('per_page', 10)));
        $page    = (int) $request->query('page', 1);
        $skip    = ($page - 1) * $perPage;

        $query = Parents::query();

        if (!empty($search)) {
            $regex = new Regex(preg_quote($search, '/'), 'i');
            $query->where(function ($q) use ($regex) {
                $q->where('parent_name', $regex)
                  ->orWhere('phone', $regex)
                  ->orWhere('address', $regex);
            });
        }

        $total   = $query->count();
        $parents = $query->orderBy('parent_name')->skip($skip)->take($perPage)->get();

        return response()->json([
            'success' => true,
            'data'    => $parents->map(fn($p) => $this->format($p)),
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
            'parent_name' => 'required|string|max:100',
            'phone'       => 'required|string|max:20',
            'address'     => 'required|string|max:255',
            'username'    => 'required|string|min:4|max:50|alpha_num',
            'password'    => 'required|string|min:8|max:100',
            'email'       => 'nullable|email|max:100',
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

        if (Parents::where('phone', $request->phone)->exists()) {
            return response()->json(['success' => false, 'message' => 'Nomor telepon sudah terdaftar.'], 409);
        }

        $user = User::create([
            'role_id'  => self::ROLE_PARENT,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'email'    => $request->email ?? null,
            'photo'    => null,
        ]);

        try {
            $parent = Parents::create([
                'user_id'     => (string) $user->_id,
                'parent_name' => $request->parent_name,
                'phone'       => $request->phone,
                'address'     => $request->address,
            ]);
        } catch (\Exception $e) {
            $user->delete();
            return response()->json(['success' => false, 'message' => 'Gagal menyimpan data wali murid.'], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Wali murid berhasil ditambahkan.',
            'data'    => $this->format($parent),
        ], 201);
    }

    public function show(string $id)
    {
        $parent = Parents::find($id);

        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'data' => $this->format($parent)]);
    }

    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'parent_name' => 'required|string|max:100',
            'phone'       => 'required|string|max:20',
            'address'     => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $parent = Parents::find($id);

        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        if (Parents::where('phone', $request->phone)->where('_id', '!=', $id)->exists()) {
            return response()->json(['success' => false, 'message' => 'Nomor telepon sudah digunakan wali murid lain.'], 409);
        }

        $parent->update([
            'parent_name' => $request->parent_name,
            'phone'       => $request->phone,
            'address'     => $request->address,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Data wali murid berhasil diperbarui.',
            'data'    => $this->format($parent->fresh()),
        ]);
    }

    public function updateOwnProfile(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return back()->withErrors(['general' => 'Unauthorized']);
        }

        $validator = Validator::make($request->all(), [
            'parent_name' => 'required|string|max:100',
            'phone'       => 'required|string|max:20',
            'address'     => 'required|string|max:255',
            'username'    => 'required|string|min:4|max:50|alpha_num',
            'email'       => 'nullable|email|max:100',
            'photo'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        if (User::where('username', $request->username)->where('_id', '!=', (string) $user->_id)->exists()) {
            return back()->withErrors(['username' => 'Username sudah digunakan.']);
        }

        if ($request->email && User::where('email', $request->email)->where('_id', '!=', (string) $user->_id)->exists()) {
            return back()->withErrors(['email' => 'Email sudah digunakan.']);
        }

        $parent = Parents::where('user_id', (string) $user->_id)->first();

        if (!$parent) {
            return back()->withErrors(['general' => 'Data wali murid tidak ditemukan.']);
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
            'email'    => $request->email,
            'photo'    => $photoUrl,
        ]);

        $parent->update([
            'parent_name' => $request->parent_name,
            'phone'       => $request->phone,
            'address'     => $request->address,
        ]);

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function resetPassword(string $id)
    {
        $parent = Parents::find($id);

        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        if (empty($parent->user_id)) {
            return response()->json(['success' => false, 'message' => 'Akun wali murid tidak ditemukan.'], 404);
        }

        $user = User::find($parent->user_id);
        if ($user) {
            $newPassword = Str::random(12);
            $user->update(['password' => Hash::make($newPassword)]);
        }

        Log::info('audit.password_reset', [
            'target'    => 'parent',
            'target_id' => (string) $parent->_id,
            'user_id'   => $parent->user_id ?? null,
            'by_admin'  => auth()->id(),
            'ip'        => request()->ip(),
        ]);

        return response()->json([
            'success'      => true,
            'message'      => 'Password wali murid berhasil direset.',
            'new_password' => $newPassword ?? null,
        ]);
    }

    public function destroy(string $id)
    {
        $parent = Parents::find($id);

        if (!$parent) {
            return response()->json(['success' => false, 'message' => 'Wali murid tidak ditemukan.'], 404);
        }

        // Cascade: hapus semua student + progress report milik parent ini
        Student::where('parent_id', (string) $parent->user_id)->each(function ($student) {
            ProgressReport::where('student_id', (string) $student->_id)->delete();
            if (!empty($student->bukti_pembayaran)) {
                $parsed = parse_url($student->bukti_pembayaran, PHP_URL_PATH);
                if ($parsed) {
                    Storage::disk('public')->delete(str_replace('/storage/', '', $parsed));
                }
            }
            $student->delete();
        });

        $parent->delete();

        if (!empty($parent->user_id)) {
            User::find($parent->user_id)?->delete();
        }

        Log::info('audit.parent_deleted', [
            'parent_id'   => (string) $parent->_id,
            'parent_name' => $parent->parent_name ?? '—',
            'by_admin'    => auth()->id(),
            'ip'          => request()->ip(),
        ]);

        return response()->json(['success' => true, 'message' => 'Wali murid dan akun berhasil dihapus.']);
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
            'id'          => (string) $doc->_id,
            'user_id'     => $doc->user_id ?? null,
            'parent_name' => $doc->parent_name,
            'phone'       => $doc->phone,
            'address'     => $doc->address,
            'created_at'  => $doc->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
