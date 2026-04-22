<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use MongoDB\Client;

class MitraDashboardController extends Controller
{
    public function index()
    {
        $client = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));

        // Ambil ID user yang sedang login
        $userId = (string) Auth::id();

        // 1. Ambil Profil Mitra (untuk mendapatkan link MOU)
        $partner = $db->selectCollection('partners')->findOne(['user_id' => $userId]);

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Data mitra tidak ditemukan'], 404);
        }

        $partnerId = (string) $partner['_id'];

        // 2. Ambil 3 Agenda / Jadwal Terdekat
        $today = date('Y-m-d');
        $agendas = $db->selectCollection('agenda')->find(
            [
                'event_date' => ['$gte' => $today],
                'visibility' => ['$in' => ['mitra', 'keduanya']]
            ],
            ['sort' => ['event_date' => 1], 'limit' => 3]
        );

        $scheduleData = [];
        foreach ($agendas as $ag) {
            $scheduleData[] = [
                'id' => (string) $ag['_id'],
                'date' => $ag['event_date'],
                'title' => $ag['title'],
                'location' => $ag['location'] ?? 'Online / TBA',
            ];
        }

        // 3. Ambil 3 Laporan Terbaru Khusus untuk Mitra Ini
        // Asumsi koleksi laporan mitra bernama 'partner_reports'
        $reports = $db->selectCollection('partner_reports')->find(
            ['partner_id' => $partnerId],
            ['sort' => ['created_at' => -1], 'limit' => 3]
        );

        $reportData = [];
        foreach ($reports as $rp) {
            $reportData[] = [
                'id' => (string) $rp['_id'],
                'title' => $rp['title'],
                'date' => $rp['date'] ?? null,
                'file_size' => $rp['file_size'] ?? 0,
                'file_url' => $rp['file_url'] ?? null,
                'file_type' => $rp['file_type'] ?? 'pdf'
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'id' => $partnerId,
                    'institution_name' => $partner['institution_name'] ?? 'Mitra',
                    'contact_person' => $partner['contact_person'] ?? '',
                    'mou_file_url' => $partner['mou_file_url'] ?? null,
                    'status' => $partner['status'] ?? 'Active'
                ],
                'schedules' => $scheduleData,
                'reports' => $reportData,
            ]
        ]);
    }
}