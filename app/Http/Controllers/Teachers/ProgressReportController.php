<?php

namespace App\Http\Controllers\Teachers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class ProgressReportController extends Controller
{
    private $reports;
    private $students;
    private $teachers;
    private $programs;

    public function __construct()
    {
        $client         = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db             = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->reports  = $db->selectCollection('progress_reports');
        $this->students = $db->selectCollection('students');
        $this->teachers = $db->selectCollection('teachers');
        $this->programs = $db->selectCollection('programs');
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/teacher/students
     | Daftar semua siswa aktif + lastReport masing-masing
     ───────────────────────────────────────────────────────── */
    public function students(): JsonResponse
    {
        $teacher = $this->resolveTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
        }

        // Ambil semua siswa aktif, sort by nama
        $cursor      = $this->students->find(
            ['enrollment_status' => 'active'],
            ['sort' => ['nama' => 1]]
        );

        $studentList = [];
        $studentIds  = [];
        foreach ($cursor as $doc) {
            $sid           = (string) $doc['_id'];
            $studentIds[]  = $sid;
            $studentList[] = $doc;
        }

        // Buat map program_id → program_name (1 query)
        $programMap = $this->buildProgramMap($studentList);

        // Ambil lastReport per siswa (1 query, sorted desc, groupBy di PHP)
        $lastReportMap = [];
        if (!empty($studentIds)) {
            $reportCursor = $this->reports->find(
                ['student_id' => ['$in' => $studentIds]],
                ['sort' => ['date' => -1]]
            );
            foreach ($reportCursor as $r) {
                $rsid = (string) $r['student_id'];
                if (!isset($lastReportMap[$rsid])) {
                    $lastReportMap[$rsid] = $this->formatReport($r);
                }
            }
        }

        // Susun response
        $data = [];
        foreach ($studentList as $doc) {
            $sid    = (string) $doc['_id'];
            $data[] = [
                'id'         => $sid,
                'nama'       => $doc['nama'] ?? '',
                'program'    => $programMap[$doc['program_id'] ?? ''] ?? '—',
                'lastReport' => $lastReportMap[$sid] ?? null,
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/teacher/students/{studentId}/reports
     | Seluruh riwayat report satu siswa (lazy load detail panel)
     ───────────────────────────────────────────────────────── */
    public function studentReports(string $studentId): JsonResponse
    {
        $cursor = $this->reports->find(
            ['student_id' => $studentId],
            ['sort' => ['date' => -1]]
        );

        $data = [];
        foreach ($cursor as $r) {
            $data[] = $this->formatReport($r);
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | POST /api/teacher/reports
     | Simpan progress report baru
     ───────────────────────────────────────────────────────── */
    public function store(Request $request): JsonResponse
    {
        $teacher = $this->resolveTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
        }

        $validated = $request->validate([
            'student_id'          => 'required|string',
            'date'                => 'required|date_format:Y-m-d',
            'attendance'          => ['required', Rule::in(['hadir', 'izin', 'sakit', 'alpha'])],
            'report_type'         => ['nullable', Rule::in(['hafalan', 'tilawah', 'yanbua'])],
            'kualitas'            => ['nullable', Rule::in(['sangat_lancar', 'lancar', 'mengulang'])],
            'hafalan_target'      => 'nullable|string|max:255',
            'hafalan_achievement' => 'nullable|string|max:255',
            'teacher_notes'       => 'nullable|string|max:2000',
        ]);

        // Pastikan siswa ada
        try {
            $student = $this->students->findOne(['_id' => new ObjectId($validated['student_id'])]);
        } catch (\Exception $e) {
            $student = null;
        }
        if (!$student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        // Jika tidak hadir → kosongkan field akademis
        $isAbsent = in_array($validated['attendance'], ['izin', 'sakit', 'alpha']);

        $doc = [
            'student_id'          => $validated['student_id'],
            'teacher_id'          => (string) $teacher['_id'],
            'date'                => $validated['date'],
            'attendance'          => $validated['attendance'],
            'report_type'         => $isAbsent ? null : ($validated['report_type']         ?? null),
            'kualitas'            => $isAbsent ? null : ($validated['kualitas']            ?? null),
            'hafalan_target'      => $isAbsent ? null : ($validated['hafalan_target']      ?? null),
            'hafalan_achievement' => $isAbsent ? null : ($validated['hafalan_achievement'] ?? null),
            'teacher_notes'       => $validated['teacher_notes'] ?? null,
            'created_at'          => new UTCDateTime(),
            'updated_at'          => new UTCDateTime(),
        ];

        $result     = $this->reports->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();

        return response()->json($this->formatReport($doc), 201);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/teacher/reports/{id}
     ───────────────────────────────────────────────────────── */
    public function show(string $id): JsonResponse
    {
        try {
            $report = $this->reports->findOne(['_id' => new ObjectId($id)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }

        return response()->json($this->formatReport($report));
    }

    /* ─────────────────────────────────────────────────────────
     | PRIVATE HELPERS
     ───────────────────────────────────────────────────────── */

    /**
     * Resolve teacher document dari user yang sedang login.
     * Relasi: teachers.user_id = users._id (disimpan sebagai string)
     */
    private function resolveTeacher(): ?object
    {
        $userId  = (string) Auth::id();
        $teacher = $this->teachers->findOne(['user_id' => $userId]);
        return $teacher ?? null;
    }

    /**
     * Buat map program_id (string) → program_name dari list siswa.
     * Satu query untuk semua program, menghindari N+1.
     */
    private function buildProgramMap(array $studentList): array
    {
        $programIds = array_values(array_unique(
            array_filter(array_map(fn($s) => $s['program_id'] ?? null, $studentList))
        ));

        if (empty($programIds)) return [];

        $oids = [];
        foreach ($programIds as $pid) {
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

    /**
     * Format satu report document → array JSON-friendly.
     * Handle UTCDateTime untuk field date & created_at.
     */
    private function formatReport($doc): array
    {
        $date = $doc['date'] ?? null;
        if ($date instanceof UTCDateTime) {
            $date = $date->toDateTime()->format('Y-m-d');
        }

        $createdAt = $doc['created_at'] ?? null;
        if ($createdAt instanceof UTCDateTime) {
            $createdAt = $createdAt->toDateTime()->format('Y-m-d H:i:s');
        }

        return [
            'id'                  => (string) $doc['_id'],
            'student_id'          => (string) ($doc['student_id'] ?? ''),
            'teacher_id'          => (string) ($doc['teacher_id'] ?? ''),
            'date'                => $date,
            'attendance'          => $doc['attendance']          ?? null,
            'report_type'         => $doc['report_type']         ?? null,
            'kualitas'            => $doc['kualitas']            ?? null,
            'hafalan_target'      => $doc['hafalan_target']      ?? null,
            'hafalan_achievement' => $doc['hafalan_achievement'] ?? null,
            'teacher_notes'       => $doc['teacher_notes']       ?? null,
            'created_at'          => $createdAt,
        ];
    }
}