<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;

class TeacherDashboardController extends Controller
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
        $teachers = $this->db->selectCollection('teachers');
        $students = $this->db->selectCollection('students');
        $reports  = $this->db->selectCollection('progress_reports');
        $agendas  = $this->db->selectCollection('agendas');

        // ── Profil guru dari collection teachers ─────────────
        $teacherDoc = $teachers->findOne(['user_id' => $userId]);
        $teacherId  = $teacherDoc ? (string) $teacherDoc['_id'] : null;

        $profile = $teacherDoc ? [
            'nama_guru' => $teacherDoc['nama_guru'] ?? '—',
            'phone'     => $teacherDoc['phone']     ?? '—',
            'email'     => $teacherDoc['email']     ?? '—',
            'bidang'    => $teacherDoc['bidang']    ?? '—',
        ] : null;

        // ── Stats: total santri aktif ─────────────────────────
        $totalSantri = $students->countDocuments(['enrollment_status' => 'active']);

        // Target tercapai: % santri yang laporan terakhirnya sangat_lancar atau lancar
        $targetTercapai = 0;
        if ($totalSantri > 0) {
            $goodCount = 0;
            $cursor    = $students->find(['enrollment_status' => 'active'], ['projection' => ['_id' => 1]]);
            foreach ($cursor as $s) {
                $sid        = (string) $s['_id'];
                $lastReport = $reports->findOne(['student_id' => $sid], ['sort' => ['date' => -1]]);
                if ($lastReport && in_array($lastReport['kualitas'] ?? '', ['sangat_lancar', 'lancar'])) {
                    $goodCount++;
                }
            }
            $targetTercapai = (int) round(($goodCount / $totalSantri) * 100);
        }

        // ── Agenda hari ini dari collection agendas ───────────
        $today      = date('Y-m-d');
        $todayAgendas = [];

        try {
            $agCursor = $agendas->find(
                ['event_date' => $today],
                ['sort' => ['title' => 1], 'limit' => 10]
            );
            foreach ($agCursor as $ag) {
                $todayAgendas[] = [
                    'id'     => (string) $ag['_id'],
                    'time'   => $ag['time']        ?? '—',
                    'class'  => $ag['title']       ?? '—',
                    'type'   => $ag['description'] ?? '—',
                    'room'   => $ag['location']    ?? '—',
                    'status' => $ag['status']      ?? 'Menunggu',
                ];
            }
        } catch (\Exception $e) {}

        // ── 5 laporan terbaru dari guru ini ───────────────────
        $recentReports = [];
        if ($teacherId) {
            $rCursor = $reports->find(
                ['teacher_id' => $teacherId],
                ['sort' => ['date' => -1], 'limit' => 5]
            );

            foreach ($rCursor as $r) {
                $sid         = (string) ($r['student_id'] ?? '');
                $studentDoc  = null;
                if ($sid) {
                    try {
                        $studentDoc = $students->findOne(['_id' => new ObjectId($sid)]);
                    } catch (\Exception $e) {}
                }

                $recentReports[] = [
                    'id'            => (string) $r['_id'],
                    'student_name'  => $studentDoc['nama']    ?? 'Santri',
                    'class_name'    => $studentDoc['program_id'] ?? '—',
                    'report_type'   => $r['report_type']   ?? 'hafalan',
                    'surah_or_jilid'=> $r['hafalan_target'] ?? '—',
                    'ayat_or_hal'   => $r['hafalan_achievement'] ?? '—',
                    'kualitas'      => $r['kualitas']       ?? 'lancar',
                ];
            }
        }

        return Inertia::render('teacher/Dashboard', [
            'stats'          => [
                'total_santri'    => $totalSantri,
                'target_tercapai' => $targetTercapai,
            ],
            'today_agendas'  => $todayAgendas,
            'recent_reports' => $recentReports,
            'profile'        => $profile,
        ]);
    }
}