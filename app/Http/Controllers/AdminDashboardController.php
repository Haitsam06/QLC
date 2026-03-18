<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class AdminDashboardController extends Controller
{
    private $students;
    private $teachers;
    private $programs;
    private $partners;
    private $agendas;
    private $reports;

    public function __construct()
    {
        $client          = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db              = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->students  = $db->selectCollection('students');
        $this->teachers  = $db->selectCollection('teachers');
        $this->programs  = $db->selectCollection('programs');
        $this->partners  = $db->selectCollection('partners');
        $this->agendas   = $db->selectCollection('agenda');
        $this->reports   = $db->selectCollection('progress_reports');
    }

    /* ─────────────────────────────────────────────────────────
     | GET /admin/dashboard  (web route → render Inertia)
     ───────────────────────────────────────────────────────── */
    public function dashboard(): Response
    {
        return Inertia::render('admin/Dashboard');
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/dashboard/stats
     | Stat cards: total siswa aktif, guru, program, mitra aktif
     | + jumlah siswa pending (untuk badge sidebar)
     ───────────────────────────────────────────────────────── */
    public function stats(): JsonResponse
    {
        $totalSiswa   = $this->students->countDocuments(['enrollment_status' => 'active']);
        $totalPending = $this->students->countDocuments(['enrollment_status' => 'pending']);
        $totalGuru    = $this->teachers->countDocuments([]);
        $totalProgram = $this->programs->countDocuments([]);
        $totalMitra   = $this->partners->countDocuments(['status' => 'Active']);

        return response()->json([
            'total_siswa'    => $totalSiswa,
            'total_pending'  => $totalPending,  // untuk badge sidebar
            'total_guru'     => $totalGuru,
            'total_program'  => $totalProgram,
            'total_mitra'    => $totalMitra,
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/dashboard/chart
     | Data grafik pendaftaran siswa 6 bulan terakhir
     ───────────────────────────────────────────────────────── */
    public function chart(): JsonResponse
    {
        // Hitung 6 bulan terakhir dari sekarang
        $now    = new \DateTime();
        $result = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = (clone $now)->modify("-{$i} months");

            $yearNum  = (int) $month->format('Y');
            $monthNum = (int) $month->format('n');

            // Batas awal dan akhir bulan
            $start = new UTCDateTime(
                (new \DateTime("{$yearNum}-{$monthNum}-01 00:00:00"))->getTimestamp() * 1000
            );
            $end = new UTCDateTime(
                (new \DateTime("{$yearNum}-{$monthNum}-01 00:00:00"))
                    ->modify('+1 month')->getTimestamp() * 1000
            );

            $count = $this->students->countDocuments([
                'created_at' => ['$gte' => $start, '$lt' => $end],
            ]);

            $result[] = [
                'name'       => $month->format('M'),  // "Jan", "Feb", dst
                'pendaftar'  => $count,
            ];
        }

        return response()->json($result);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/dashboard/upcoming-agenda
     | 3 agenda terdekat dari hari ini
     ───────────────────────────────────────────────────────── */
    public function upcomingAgenda(): JsonResponse
    {
        $today = date('Y-m-d');

        $cursor = $this->agendas->find(
            ['event_date' => ['$gte' => $today]],
            [
                'sort'  => ['event_date' => 1],
                'limit' => 3,
            ]
        );

        $data = [];
        foreach ($cursor as $a) {
            $eventDate = new \DateTime($a['event_date']);
            $data[] = [
                'id'    => (string) $a['_id'],
                'title' => $a['title'] ?? '—',
                'date'  => $eventDate->format('d M Y'),
                'type'  => $this->classifyAgenda($eventDate),
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/dashboard/pending-students
     | Siswa dengan status pending, terbaru dulu, max 5
     ───────────────────────────────────────────────────────── */
    public function pendingStudents(): JsonResponse
    {
        $cursor = $this->students->find(
            ['enrollment_status' => 'pending'],
            [
                'sort'  => ['created_at' => -1],
                'limit' => 5,
            ]
        );

        // Map program_id → name
        $studentList = [];
        foreach ($cursor as $doc) { $studentList[] = $doc; }

        $programMap = $this->buildProgramMap($studentList);

        $data = [];
        foreach ($studentList as $doc) {
            $createdAt = $doc['created_at'] instanceof UTCDateTime
                ? $doc['created_at']->toDateTime()
                : null;

            $data[] = [
                'id'   => (string) $doc['_id'],
                'nama' => $doc['nama'] ?? '—',
                'prog' => $programMap[$doc['program_id'] ?? ''] ?? '—',
                'date' => $createdAt
                    ? $createdAt->format('d M')
                    : '—',
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/dashboard/top-reports
     | Laporan dengan kualitas terbaik hari ini (max 5)
     | Urutan: sangat_lancar → lancar → mengulang
     ───────────────────────────────────────────────────────── */
    public function topReports(): JsonResponse
    {
        $today     = (new \DateTime())->format('Y-m-d');
        $yesterday = (new \DateTime('-1 day'))->format('Y-m-d');

        // Coba hari ini dulu, fallback ke kemarin jika kosong
        $cursor = $this->reports->find(
            [
                'date'       => $today,
                'attendance' => 'hadir',
                'kualitas'   => ['$in' => ['sangat_lancar', 'lancar']],
            ],
            ['sort' => ['kualitas' => 1], 'limit' => 5]
        );

        $rawReports = [];
        foreach ($cursor as $r) { $rawReports[] = $r; }

        // Fallback: jika hari ini kosong, ambil kemarin
        if (empty($rawReports)) {
            $cursor = $this->reports->find(
                [
                    'date'       => $yesterday,
                    'attendance' => 'hadir',
                    'kualitas'   => ['$in' => ['sangat_lancar', 'lancar']],
                ],
                ['sort' => ['kualitas' => 1], 'limit' => 5]
            );
            foreach ($cursor as $r) { $rawReports[] = $r; }
        }

        if (empty($rawReports)) {
            return response()->json([]);
        }

        // Enrich dengan nama siswa
        $studentIds = array_unique(array_map(fn($r) => (string) ($r['student_id'] ?? ''), $rawReports));
        $studentMap = $this->buildStudentNameMap($studentIds);

        $qualityOrder = ['sangat_lancar' => 0, 'lancar' => 1, 'mengulang' => 2];
        usort($rawReports, fn($a, $b) =>
            ($qualityOrder[$a['kualitas'] ?? 'mengulang'] ?? 2)
            <=> ($qualityOrder[$b['kualitas'] ?? 'mengulang'] ?? 2)
        );

        $data = [];
        foreach ($rawReports as $r) {
            $sid = (string) ($r['student_id'] ?? '');
            $data[] = [
                'id'          => (string) $r['_id'],
                'student_id'  => $sid,
                'nama'        => $studentMap[$sid] ?? '—',
                'capaian'     => $r['hafalan_achievement'] ?? $r['hafalan_target'] ?? '—',
                'report_type' => $r['report_type'] ?? null,
                'kualitas'    => $r['kualitas'] ?? null,
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | PRIVATE HELPERS
     ───────────────────────────────────────────────────────── */

    private function classifyAgenda(\DateTime $date): string
    {
        $diff = (new \DateTime())->diff($date)->days;
        return $diff <= 3 ? 'urgent' : ($diff <= 7 ? 'mitra' : 'umum');
    }

    private function buildProgramMap(array $studentList): array
    {
        $ids = array_values(array_unique(
            array_filter(array_map(fn($s) => $s['program_id'] ?? null, $studentList))
        ));
        if (empty($ids)) return [];

        $oids = [];
        foreach ($ids as $pid) {
            try { $oids[] = new ObjectId($pid); } catch (\Exception $e) {}
        }
        if (empty($oids)) return [];

        $cursor = $this->programs->find(['_id' => ['$in' => $oids]]);
        $map    = [];
        foreach ($cursor as $p) {
            $map[(string) $p['_id']] = $p['name'] ?? '—';
        }
        return $map;
    }

    private function buildStudentNameMap(array $studentIds): array
    {
        if (empty($studentIds)) return [];
        $oids = [];
        foreach ($studentIds as $sid) {
            try { $oids[] = new ObjectId($sid); } catch (\Exception $e) {}
        }
        if (empty($oids)) return [];

        $cursor = $this->students->find(
            ['_id' => ['$in' => $oids]],
            ['projection' => ['_id' => 1, 'nama' => 1]]
        );
        $map = [];
        foreach ($cursor as $s) {
            $map[(string) $s['_id']] = $s['nama'] ?? '—';
        }
        return $map;
    }
}