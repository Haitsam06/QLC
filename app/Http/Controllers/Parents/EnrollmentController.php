<?php

namespace App\Http\Controllers\Parents;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\UTCDateTime;

class EnrollmentController extends Controller
{
    private $programs;
    private $students;
    private $db;

    public function __construct()
    {
        $client         = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $this->db       = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->programs = $this->db->selectCollection('programs');
        $this->students = $this->db->selectCollection('students');
    }

    /**
     * GET /parents/daftar
     */
    public function create(): Response
    {
        $cursor   = $this->programs->find([], ['sort' => ['name' => 1]]);
        $programs = [];
        foreach ($cursor as $doc) {
            $programs[] = [
                'id'              => (string) $doc['_id'],
                'name'            => $doc['name']            ?? '',
                'description'     => $doc['description']     ?? '',
                'target_audience' => $doc['target_audience'] ?? '',
                'duration'        => $doc['duration']        ?? '',
                'image_url'       => $doc['image_url']       ?? null,
            ];
        }

        return Inertia::render('parents/Daftar', [
            'programs' => $programs,
            'flash'    => [
                'success'    => session('success'),
                'nama'       => session('nama'),
                'program_id' => session('program_id'),
            ],
        ]);
    }

    /**
     * POST /parents/daftar
     */
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

        $path    = $request->file('bukti_pembayaran')->store('enrollments/payments', 'public');
        $fileUrl = Storage::url($path);

        // Ambil data parent dari collection parents berdasarkan user_id
        $user       = Auth::user();
        $userId     = (string) $user->_id;
        $parentDoc  = $this->db->selectCollection('parents')->findOne(['user_id' => $userId]);
        $parentName = $parentDoc['parent_name'] ?? $user->username;

        // Ambil nama program
        $programDoc  = $this->programs->findOne(['_id' => new \MongoDB\BSON\ObjectId($request->program_id)]);
        $programName = $programDoc['name'] ?? 'Program tidak diketahui';

        $this->students->insertOne([
            'parent_id'         => $userId,
            'parent_name'       => $parentName,
            'program_id'        => $request->program_id,
            'nama'              => $request->nama,
            'tempat_lahir'      => $request->tempat_lahir,
            'tanggal_lahir'     => $request->tanggal_lahir,
            'usia'              => (int) $request->usia,
            'enrollment_status' => 'pending',
            'bukti_pembayaran'  => $fileUrl,
            'created_at'        => new UTCDateTime(),
            'updated_at'        => new UTCDateTime(),
        ]);

        // Kirim notifikasi ke semua admin
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