<?php

namespace App\Http\Controllers\Parents;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class ParentDashboardController extends Controller
{
    private $db;

    public function __construct()
    {
        $client   = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $this->db = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
    }

    public function index(): Response
    {
        $userId   = (string) Auth::user()->_id;
        $students = $this->db->selectCollection('students');
        $programs = $this->db->selectCollection('programs');
        $reports  = $this->db->selectCollection('progress_reports');

        // ── Ambil semua anak ─────────────────────────────────
        $cursor   = $students->find(['parent_id' => $userId], ['sort' => ['created_at' => -1]]);
        $children = [];

        foreach ($cursor as $doc) {
            $programName = null;
            if (!empty($doc['program_id'])) {
                try {
                    $prog = $programs->findOne(['_id' => new ObjectId($doc['program_id'])]);
                    $programName = $prog['name'] ?? null;
                } catch (\Exception $e) {}
            }
            $children[] = [
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
                    ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s') : null,
            ];
        }

        $firstChild = count($children) > 0 ? [
            'nama'         => $children[0]['nama'],
            'program_name' => $children[0]['program_name'],
        ] : null;

        // ── IDs anak aktif ────────────────────────────────────
        $activeChildIds = array_values(array_map(
            fn($c) => $c['id'],
            array_filter($children, fn($c) => $c['enrollment_status'] === 'active')
        ));

        // ── Default values ────────────────────────────────────
        $now          = new \DateTime();
        $totalLaporan = 0;
        $totalHadir   = 0;
        $recentReports = [];
        $teacherMap   = $this->buildTeacherMap();

        $monthStart = $now->format('Y-m') . '-01';
        $monthEnd   = $now->format('Y-m-t');

        // ── Stats per anak aktif ─────────────────────────────
        $childrenStats = [];
        foreach ($activeChildIds as $childId) {
            $baseF  = ['student_id' => $childId];
            $monthF = array_merge($baseF, ['date' => ['$gte' => $monthStart, '$lte' => $monthEnd]]);

            $attStat = [];
            foreach (['hadir', 'izin', 'sakit', 'alpha'] as $att) {
                $attStat[$att] = $reports->countDocuments(array_merge($monthF, ['attendance' => $att]));
            }
            $qualStat = [];
            foreach (['sangat_lancar', 'lancar', 'mengulang'] as $kual) {
                $qualStat[$kual] = $reports->countDocuments(array_merge($monthF, ['kualitas' => $kual]));
            }

            $childrenStats[$childId] = [
                'attendance' => [
                    'hadir'  => $attStat['hadir'],
                    'izin'   => $attStat['izin'],
                    'sakit'  => $attStat['sakit'],
                    'alpha'  => $attStat['alpha'],
                    'total'  => array_sum($attStat),
                ],
                'quality' => [
                    'sangat_lancar' => $qualStat['sangat_lancar'],
                    'lancar'        => $qualStat['lancar'],
                    'mengulang'     => $qualStat['mengulang'],
                    'total'         => array_sum($qualStat),
                ],
            ];
        }

        // ── Total laporan & catatan terbaru ───────────────────
        if (!empty($activeChildIds)) {
            $baseFilter   = ['student_id' => ['$in' => $activeChildIds]];
            $totalLaporan = $reports->countDocuments($baseFilter);
            $totalHadir   = $reports->countDocuments(array_merge($baseFilter, ['attendance' => 'hadir']));

            $recentCursor = $reports->find($baseFilter, ['sort' => ['date' => -1], 'limit' => 10]);
            $i = 1;
            foreach ($recentCursor as $r) {
                $date = $r['date'] ?? '';
                if ($date instanceof \MongoDB\BSON\UTCDateTime) {
                    $date = $date->toDateTime()->format('Y-m-d');
                }
                $recentReports[] = [
                    'id'            => $i++,
                    'student_id'    => $r['student_id'] ?? '',
                    'date'          => $date,
                    'report_type'   => $r['report_type'] ?? '',
                    'kualitas'      => $r['kualitas'] ?? '',
                    'teacher_name'  => $teacherMap[$r['teacher_id'] ?? ''] ?? 'Guru',
                    'teacher_notes' => $r['teacher_notes'] ?? '',
                ];
            }
        }

        // Nama bulan dalam Bahasa Indonesia
        $bulanId = ['January'=>'Januari','February'=>'Februari','March'=>'Maret',
                    'April'=>'April','May'=>'Mei','June'=>'Juni','July'=>'Juli',
                    'August'=>'Agustus','September'=>'September','October'=>'Oktober',
                    'November'=>'November','December'=>'Desember'];
        $namaBulan = ($bulanId[$now->format('F')] ?? $now->format('F')) . ' ' . $now->format('Y');

        return Inertia::render('parents/Dashboard', [
            'anakList'       => $children,
            'first_child'    => $firstChild,
            'stats'          => [
                'total_anak'    => count($children),
                'total_laporan' => $totalLaporan,
                'total_hadir'   => $totalHadir,
            ],
            'bulan'          => $namaBulan,
            'children_stats' => $childrenStats,
            'recent_reports' => $recentReports,
        ]);
    }

    private function buildTeacherMap(): array
    {
        $cursor = $this->db->selectCollection('teachers')->find(
            [],
            ['projection' => ['_id' => 1, 'nama_guru' => 1]]
        );
        $map = [];
        foreach ($cursor as $t) {
            $map[(string) $t['_id']] = $t['nama_guru'] ?? '—';
        }
        return $map;
    }
}