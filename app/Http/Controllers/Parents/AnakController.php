<?php

namespace App\Http\Controllers\Parents;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class AnakController extends Controller
{
    private $db;

    public function __construct()
    {
        $client   = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $this->db = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
    }

    /**
     * GET /parents/anak
     * Tampilkan daftar anak milik parent yang sedang login
     */
    public function index(): Response
    {
        $userId   = (string) Auth::user()->_id;
        $students = $this->db->selectCollection('students');
        $programs = $this->db->selectCollection('programs');

        // Ambil semua anak milik parent ini
        $cursor = $students->find(
            ['parent_id' => $userId],
            ['sort' => ['created_at' => -1]]
        );

        $data = [];
        foreach ($cursor as $doc) {
            // Resolve nama program
            $programName = null;
            if (!empty($doc['program_id'])) {
                try {
                    $prog = $programs->findOne(['_id' => new ObjectId($doc['program_id'])]);
                    $programName = $prog['name'] ?? null;
                } catch (\Exception $e) {}
            }

            $data[] = [
                'id'                => (string) $doc['_id'],
                'nama'              => $doc['nama'] ?? '',
                'tempat_lahir'      => $doc['tempat_lahir'] ?? '',
                'tanggal_lahir'     => $doc['tanggal_lahir'] ?? '',
                'usia'              => $doc['usia'] ?? null,
                'program_id'        => $doc['program_id'] ?? null,
                'program_name'      => $programName,
                'enrollment_status' => $doc['enrollment_status'] ?? 'pending',
                'bukti_pembayaran'  => $doc['bukti_pembayaran'] ?? null,
                'created_at'        => isset($doc['created_at'])
                    ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                    : null,
            ];
        }

        return Inertia::render('parents/Anak', [
            'children' => $data,
        ]);
    }
}