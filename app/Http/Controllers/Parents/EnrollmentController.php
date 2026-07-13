<?php

namespace App\Http\Controllers\Parents;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Parents;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function create(): Response
    {
        $programs = Program::orderBy('name')->get()->map(fn($doc) => [
            'id'              => (string) $doc->_id,
            'name'            => $doc->name            ?? '',
            'description'     => $doc->description     ?? '',
            'target_audience' => $doc->target_audience ?? '',
            'duration'        => $doc->duration        ?? '',
            'image_url'       => $doc->image_url       ?? null,
        ])->values()->toArray();

        return Inertia::render('parents/Daftar', [
            'programs' => $programs,
            'flash'    => [
                'success'    => session('success'),
                'nama'       => session('nama'),
                'program_id' => session('program_id'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'nama'             => 'required|string|max:150',
            'tempat_lahir'     => 'required|string|max:100',
            'tanggal_lahir'    => 'required|date',
            'usia'             => 'required|integer|min:1|max:30',
            'program_id'       => 'required|string',
            'bukti_pembayaran' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ], [
            'nama.required'             => 'Nama anak wajib diisi.',
            'tempat_lahir.required'     => 'Tempat lahir wajib diisi.',
            'tanggal_lahir.required'    => 'Tanggal lahir wajib diisi.',
            'usia.required'             => 'Usia wajib diisi.',
            'program_id.required'       => 'Program wajib dipilih.',
            'bukti_pembayaran.required' => 'Bukti pembayaran wajib diunggah.',
            'bukti_pembayaran.mimes'    => 'Bukti pembayaran harus berupa JPG, PNG, atau PDF.',
            'bukti_pembayaran.max'      => 'Ukuran file maksimal 5MB.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $program = Program::find($request->program_id);
        if (!$program) {
            return back()->withErrors(['program_id' => 'Program yang dipilih tidak ditemukan.'])->withInput();
        }

        $duplicate = Student::where('parent_id', (string) Auth::id())
            ->where('nama', $request->nama)
            ->where('program_id', $request->program_id)
            ->whereIn('enrollment_status', ['pending', 'active'])
            ->exists();

        if ($duplicate) {
            return back()->withErrors(['nama' => 'Anak ini sudah terdaftar atau sedang menunggu verifikasi untuk program yang sama.'])->withInput();
        }

        $path    = $request->file('bukti_pembayaran')->store('enrollments/payments', config('filesystems.default'));
        $fileUrl = $path;

        $user       = Auth::user();
        $userId     = (string) $user->_id;
        $parentDoc  = Parents::where('user_id', $userId)->first();
        $parentName = $parentDoc?->parent_name ?? $user->username;

        $programName = $program->name;

        Student::create([
            'parent_id'         => $userId,
            'parent_name'       => $parentName,
            'program_id'        => $request->program_id,
            'nama'              => $request->nama,
            'tempat_lahir'      => $request->tempat_lahir,
            'tanggal_lahir'     => $request->tanggal_lahir,
            'usia'              => (int) $request->usia,
            'enrollment_status' => 'pending',
            'bukti_pembayaran'  => $fileUrl,
        ]);

        Notification::sendToRole(
            roleName: 'admin',
            type:     'pendaftaran',
            title:    'Pendaftaran Siswa Baru',
            message:  "{$request->nama} didaftarkan oleh {$parentName} ke program {$programName}. Menunggu persetujuan.",
            link:     '?tab=siswa',
        );

        return back()->with([
            'success'    => true,
            'nama'       => $request->nama,
            'program_id' => $request->program_id,
        ]);
    }
}
