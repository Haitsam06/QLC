<?php

namespace App\Http\Controllers;

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
    private $parents;

    public function __construct()
    {
        $client         = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db             = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->reports  = $db->selectCollection('progress_reports');
        $this->students = $db->selectCollection('students');
        $this->teachers = $db->selectCollection('teachers');
        $this->programs = $db->selectCollection('programs');
        $this->parents  = $db->selectCollection('parents');
    }

    /* ═══════════════════════════════════════════════════════════
     | TEACHER ROUTES
     | Prefix: /api/teacher
     ═══════════════════════════════════════════════════════════ */

    /* ─────────────────────────────────────────────────────────
     | GET /api/teacher/students
     | Daftar semua siswa aktif + lastReport masing-masing
     ───────────────────────────────────────────────────────── */
    public function teacherStudents(): JsonResponse
    {
        $teacher = $this->resolveTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
        }

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

        $programMap    = $this->buildProgramMap($studentList);
        $lastReportMap = $this->buildLastReportMap($studentIds);

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
     | Riwayat report satu siswa (lazy load detail panel guru)
     ───────────────────────────────────────────────────────── */
    public function teacherStudentReports(string $studentId): JsonResponse
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
     | Guru simpan progress report baru
     ───────────────────────────────────────────────────────── */
    public function teacherStore(Request $request): JsonResponse
    {
        $teacher = $this->resolveTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
        }

        $validated = $this->validateReport($request);

        try {
            $student = $this->students->findOne(['_id' => new ObjectId($validated['student_id'])]);
        } catch (\Exception $e) { $student = null; }
        if (!$student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

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
            'created_by'          => 'teacher',
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
    public function teacherShow(string $id): JsonResponse
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
     | PUT /api/teacher/reports/{id}
     | Guru edit laporan — hanya boleh jika teacher_id cocok
     ───────────────────────────────────────────────────────── */
    public function teacherUpdate(Request $request, string $id): JsonResponse
    {
        $teacher = $this->resolveTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
        }

        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        // Pastikan laporan ini milik guru yang sedang login
        $existing = $this->reports->findOne(['_id' => $oid]);
        if (!$existing) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }
        if ((string) $existing['teacher_id'] !== (string) $teacher['_id']) {
            return response()->json(['message' => 'Kamu tidak memiliki izin untuk mengubah laporan ini.'], 403);
        }

        $validated = $this->validateReport($request, requireStudent: false);
        $isAbsent  = in_array($validated['attendance'], ['izin', 'sakit', 'alpha']);

        $this->reports->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'date'                => $validated['date'],
                'attendance'          => $validated['attendance'],
                'report_type'         => $isAbsent ? null : ($validated['report_type']         ?? null),
                'kualitas'            => $isAbsent ? null : ($validated['kualitas']            ?? null),
                'hafalan_target'      => $isAbsent ? null : ($validated['hafalan_target']      ?? null),
                'hafalan_achievement' => $isAbsent ? null : ($validated['hafalan_achievement'] ?? null),
                'teacher_notes'       => $validated['teacher_notes'] ?? null,
                'updated_at'          => new UTCDateTime(),
            ]]
        );

        $updated = $this->reports->findOne(['_id' => $oid]);
        return response()->json($this->formatReport($updated));
    }

    /* ─────────────────────────────────────────────────────────
     | DELETE /api/teacher/reports/{id}
     | Guru hapus laporan — hanya boleh jika teacher_id cocok
     ───────────────────────────────────────────────────────── */
    public function teacherDestroy(string $id): JsonResponse
    {
        $teacher = $this->resolveTeacher();
        if (!$teacher) {
            return response()->json(['message' => 'Profil guru tidak ditemukan.'], 404);
        }

        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        $existing = $this->reports->findOne(['_id' => $oid]);
        if (!$existing) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }
        if ((string) $existing['teacher_id'] !== (string) $teacher['_id']) {
            return response()->json(['message' => 'Kamu tidak memiliki izin untuk menghapus laporan ini.'], 403);
        }

        $this->reports->deleteOne(['_id' => $oid]);
        return response()->json(['message' => 'Laporan berhasil dihapus.']);
    }

    /* ═══════════════════════════════════════════════════════════
     | PARENT ROUTES
     | Prefix: /api/parent
     ═══════════════════════════════════════════════════════════ */

    /* ─────────────────────────────────────────────────────────
     | GET /api/parent/children
     | Daftar SEMUA anak milik orang tua (active/pending/inactive)
     | Field 'enrollment_status' disertakan agar frontend bisa
     | menampilkan badge & mengunci laporan jika bukan 'active'
     ───────────────────────────────────────────────────────── */
    public function parentChildren(): JsonResponse
    {
        $userId = (string) Auth::id();

        $parent = $this->parents->findOne(['user_id' => $userId]);
        if (!$parent) {
            return response()->json(['message' => 'Profil wali murid tidak ditemukan.'], 404);
        }

        $parentId = (string) $parent['user_id'];

        // Ambil SEMUA anak tanpa filter status
        $cursor      = $this->students->find(
            ['parent_id' => $parentId],
            ['sort' => ['nama' => 1]]
        );

        $studentList = [];
        foreach ($cursor as $doc) {
            $studentList[] = $doc;
        }

        $programMap = $this->buildProgramMap($studentList);

        $data = [];
        foreach ($studentList as $doc) {
            $data[] = [
                'id'                => (string) $doc['_id'],
                'nama'              => $doc['nama'] ?? '',
                'program_name'      => $programMap[$doc['program_id'] ?? ''] ?? '—',
                'enrollment_status' => $doc['enrollment_status'] ?? 'pending',
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/parent/children/{studentId}/reports
     | Riwayat progress report satu anak
     | Validasi: pastikan siswa ini benar milik parent yang login
     ───────────────────────────────────────────────────────── */
    public function parentChildReports(string $studentId): JsonResponse
    {
        $userId = (string) Auth::id();

        // Verifikasi kepemilikan: siswa harus milik parent ini
        $parent = $this->parents->findOne(['user_id' => $userId]);
        if (!$parent) {
            return response()->json(['message' => 'Profil wali murid tidak ditemukan.'], 404);
        }

        try {
            $student = $this->students->findOne(['_id' => new ObjectId($studentId)]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        if (!$student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        // Pastikan siswa ini benar milik parent yang login
        if ((string) $student['parent_id'] !== (string) $parent['user_id']) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        // Blokir akses laporan jika siswa bukan active
        $status = $student['enrollment_status'] ?? 'pending';
        if ($status !== 'active') {
            return response()->json([
                'message' => $status === 'pending'
                    ? 'Pendaftaran anak Anda sedang dalam proses verifikasi. Laporan belum tersedia.'
                    : 'Akun anak Anda tidak aktif. Hubungi admin untuk informasi lebih lanjut.',
                'locked'  => true,
                'status'  => $status,
            ], 403);
        }

        // Ambil semua laporan siswa ini, diurutkan terbaru dulu
        $cursor     = $this->reports->find(
            ['student_id' => $studentId],
            ['sort' => ['date' => -1]]
        );

        // Build teacher name map
        $teacherMap = $this->buildTeacherMap();

        $data = [];
        foreach ($cursor as $r) {
            $report                 = $this->formatReport($r);
            $report['teacher_name'] = $teacherMap[$report['teacher_id']] ?? 'Admin';
            $data[] = $report;
        }

        return response()->json($data);
    }

    /* ═══════════════════════════════════════════════════════════
     | ADMIN ROUTES
     | Prefix: /api/admin/progress
     ═══════════════════════════════════════════════════════════ */

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/progress/options
     | Dropdown data: siswa, guru, program untuk FormModal
     ───────────────────────────────────────────────────────── */
    public function adminOptions(): JsonResponse
    {
        $sCursor  = $this->students->find(
            ['enrollment_status' => 'active'],
            ['sort' => ['nama' => 1], 'projection' => ['_id' => 1, 'nama' => 1]]
        );
        $students = [];
        foreach ($sCursor as $s) {
            $students[] = ['id' => (string) $s['_id'], 'label' => $s['nama']];
        }

        $tCursor  = $this->teachers->find([], ['sort' => ['nama_guru' => 1]]);
        $teachers = [];
        foreach ($tCursor as $t) {
            $teachers[] = ['id' => (string) $t['_id'], 'label' => $t['nama_guru'] ?? '—'];
        }

        $pCursor  = $this->programs->find([], ['sort' => ['name' => 1]]);
        $programs = [];
        foreach ($pCursor as $p) {
            $programs[] = ['id' => (string) $p['_id'], 'label' => $p['name'] ?? '—'];
        }

        return response()->json(compact('students', 'teachers', 'programs'));
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/progress/students
     | Tab 1 — Daftar semua siswa aktif + lastReport
     | Query params: search, program_id
     ───────────────────────────────────────────────────────── */
    public function adminStudents(Request $request): JsonResponse
    {
        $search    = trim($request->query('search', ''));
        $programId = trim($request->query('program_id', ''));

        $filter = ['enrollment_status' => 'active'];
        if ($search !== '')    $filter['nama']       = ['$regex' => $search, '$options' => 'i'];
        if ($programId !== '') $filter['program_id'] = $programId;

        $cursor      = $this->students->find($filter, ['sort' => ['nama' => 1]]);
        $studentList = [];
        $studentIds  = [];
        foreach ($cursor as $doc) {
            $sid           = (string) $doc['_id'];
            $studentIds[]  = $sid;
            $studentList[] = $doc;
        }

        $programMap    = $this->buildProgramMap($studentList);
        $lastReportMap = $this->buildLastReportMap($studentIds);

        $data = [];
        foreach ($studentList as $doc) {
            $sid    = (string) $doc['_id'];
            $data[] = [
                'id'         => $sid,
                'nama'       => $doc['nama'] ?? '',
                'program'    => $programMap[$doc['program_id'] ?? ''] ?? '—',
                'program_id' => $doc['program_id'] ?? null,
                'lastReport' => $lastReportMap[$sid] ?? null,
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/progress/students/{studentId}/reports
     | Detail modal — riwayat lengkap satu siswa + nama guru
     ───────────────────────────────────────────────────────── */
    public function adminStudentReports(string $studentId): JsonResponse
    {
        $teacherMap = $this->buildTeacherMap();

        $cursor = $this->reports->find(
            ['student_id' => $studentId],
            ['sort' => ['date' => -1]]
        );

        $data = [];
        foreach ($cursor as $r) {
            $report                 = $this->formatReport($r);
            $report['teacher_name'] = $teacherMap[$report['teacher_id']] ?? '—';
            $data[] = $report;
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/progress/reports
     | Tab 2 — Semua laporan global, filter + pagination
     | Query params: search, program_id, page, per_page
     ───────────────────────────────────────────────────────── */
    public function adminReports(Request $request): JsonResponse
    {
        $search    = trim($request->query('search', ''));
        $programId = trim($request->query('program_id', ''));
        $perPage   = (int) $request->query('per_page', 20);
        $page      = max(1, (int) $request->query('page', 1));
        $skip      = ($page - 1) * $perPage;

        // Jika ada filter, cari student_id dulu
        $studentIdFilter = null;
        if ($search !== '' || $programId !== '') {
            $sFilter = ['enrollment_status' => 'active'];
            if ($search !== '')    $sFilter['nama']       = ['$regex' => $search, '$options' => 'i'];
            if ($programId !== '') $sFilter['program_id'] = $programId;

            $sCursor         = $this->students->find($sFilter, ['projection' => ['_id' => 1]]);
            $studentIdFilter = [];
            foreach ($sCursor as $s) {
                $studentIdFilter[] = (string) $s['_id'];
            }

            if (empty($studentIdFilter)) {
                return response()->json([
                    'data' => [],
                    'meta' => ['total' => 0, 'page' => $page, 'per_page' => $perPage, 'last_page' => 1],
                ]);
            }
        }

        $rFilter = [];
        if ($studentIdFilter !== null) {
            $rFilter['student_id'] = ['$in' => $studentIdFilter];
        }

        $total  = $this->reports->countDocuments($rFilter);
        $cursor = $this->reports->find($rFilter, [
            'sort'  => ['date' => -1],
            'skip'  => $skip,
            'limit' => $perPage,
        ]);

        $allStudentIds = [];
        $allTeacherIds = [];
        $rawReports    = [];
        foreach ($cursor as $r) {
            $rawReports[]    = $r;
            $allStudentIds[] = (string) ($r['student_id'] ?? '');
            $allTeacherIds[] = (string) ($r['teacher_id'] ?? '');
        }

        $studentNameMap      = $this->buildStudentNameMap(array_unique($allStudentIds));
        $teacherMap          = $this->buildTeacherMap(array_unique($allTeacherIds));
        $programByStudentMap = $this->buildProgramByStudentMap(array_unique($allStudentIds));

        $data = [];
        foreach ($rawReports as $r) {
            $report                 = $this->formatReport($r);
            $sid                    = $report['student_id'];
            $tid                    = $report['teacher_id'];
            $report['student_name'] = $studentNameMap[$sid] ?? '—';
            $report['teacher_name'] = $teacherMap[$tid]     ?? '—';
            $report['program']      = $programByStudentMap[$sid] ?? '—';
            $data[] = $report;
        }

        return response()->json([
            'data' => $data,
            'meta' => [
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => (int) ceil($total / max($perPage, 1)),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     | POST /api/admin/progress/reports
     | Admin buat laporan baru (bisa pilih siswa & guru bebas)
     ───────────────────────────────────────────────────────── */
    public function adminStore(Request $request): JsonResponse
    {
        $validated = $this->validateReport($request, withTeacher: true);

        try {
            $student = $this->students->findOne(['_id' => new ObjectId($validated['student_id'])]);
        } catch (\Exception $e) { $student = null; }
        if (!$student) {
            return response()->json(['message' => 'Siswa tidak ditemukan.'], 404);
        }

        $isAbsent = in_array($validated['attendance'], ['izin', 'sakit', 'alpha']);

        $doc = [
            'student_id'          => $validated['student_id'],
            'teacher_id'          => $validated['teacher_id'] ?? null,
            'date'                => $validated['date'],
            'attendance'          => $validated['attendance'],
            'report_type'         => $isAbsent ? null : ($validated['report_type']         ?? null),
            'kualitas'            => $isAbsent ? null : ($validated['kualitas']            ?? null),
            'hafalan_target'      => $isAbsent ? null : ($validated['hafalan_target']      ?? null),
            'hafalan_achievement' => $isAbsent ? null : ($validated['hafalan_achievement'] ?? null),
            'teacher_notes'       => $validated['teacher_notes'] ?? null,
            'created_by'          => 'admin',
            'created_at'          => new UTCDateTime(),
            'updated_at'          => new UTCDateTime(),
        ];

        $result     = $this->reports->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();

        return response()->json($this->formatReport($doc), 201);
    }

    /* ─────────────────────────────────────────────────────────
     | PUT /api/admin/progress/reports/{id}
     | Admin edit laporan
     ───────────────────────────────────────────────────────── */
    public function adminUpdate(Request $request, string $id): JsonResponse
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        $validated = $this->validateReport($request, withTeacher: true, requireStudent: false);
        $isAbsent  = in_array($validated['attendance'], ['izin', 'sakit', 'alpha']);

        $result = $this->reports->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'teacher_id'          => $validated['teacher_id']          ?? null,
                'date'                => $validated['date'],
                'attendance'          => $validated['attendance'],
                'report_type'         => $isAbsent ? null : ($validated['report_type']         ?? null),
                'kualitas'            => $isAbsent ? null : ($validated['kualitas']            ?? null),
                'hafalan_target'      => $isAbsent ? null : ($validated['hafalan_target']      ?? null),
                'hafalan_achievement' => $isAbsent ? null : ($validated['hafalan_achievement'] ?? null),
                'teacher_notes'       => $validated['teacher_notes'] ?? null,
                'updated_at'          => new UTCDateTime(),
            ]]
        );

        if ($result->getMatchedCount() === 0) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }

        $updated = $this->reports->findOne(['_id' => $oid]);
        return response()->json($this->formatReport($updated));
    }

    /* ─────────────────────────────────────────────────────────
     | DELETE /api/admin/progress/reports/{id}
     ───────────────────────────────────────────────────────── */
    public function adminDestroy(string $id): JsonResponse
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        $result = $this->reports->deleteOne(['_id' => $oid]);

        if ($result->getDeletedCount() === 0) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }

        return response()->json(['message' => 'Laporan berhasil dihapus.']);
    }

    /* ═══════════════════════════════════════════════════════════
     | PRIVATE HELPERS
     ═══════════════════════════════════════════════════════════ */

    private function resolveTeacher(): ?object
    {
        $userId  = (string) Auth::id();
        $teacher = $this->teachers->findOne(['user_id' => $userId]);
        return $teacher ?? null;
    }

    /** Validasi request report — dipakai teacher & admin */
    private function validateReport(Request $request, bool $withTeacher = false, bool $requireStudent = true): array
    {
        $rules = [
            'date'                => 'required|date_format:Y-m-d',
            'attendance'          => ['required', Rule::in(['hadir', 'izin', 'sakit', 'alpha'])],
            'report_type'         => ['nullable', Rule::in(['hafalan', 'tilawah', 'yanbua'])],
            'kualitas'            => ['nullable', Rule::in(['sangat_lancar', 'lancar', 'mengulang'])],
            'hafalan_target'      => 'nullable|string|max:255',
            'hafalan_achievement' => 'nullable|string|max:255',
            'teacher_notes'       => 'nullable|string|max:2000',
        ];

        if ($requireStudent) $rules['student_id'] = 'required|string';
        if ($withTeacher)    $rules['teacher_id'] = 'nullable|string';

        return $request->validate($rules);
    }

    /** lastReport per siswa — 1 query, group di PHP */
    private function buildLastReportMap(array $studentIds): array
    {
        if (empty($studentIds)) return [];

        $cursor = $this->reports->find(
            ['student_id' => ['$in' => $studentIds]],
            ['sort' => ['date' => -1]]
        );

        $map = [];
        foreach ($cursor as $r) {
            $sid = (string) $r['student_id'];
            if (!isset($map[$sid])) {
                $map[$sid] = $this->formatReport($r);
            }
        }
        return $map;
    }

    /** program_id → program_name dari list siswa */
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

    /** student_id → nama siswa */
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

    /** teacher_id → nama_guru (opsional filter by id) */
    private function buildTeacherMap(array $teacherIds = []): array
    {
        $filter = [];
        if (!empty($teacherIds)) {
            $oids = [];
            foreach ($teacherIds as $tid) {
                try { $oids[] = new ObjectId($tid); } catch (\Exception $e) {}
            }
            if (!empty($oids)) $filter['_id'] = ['$in' => $oids];
        }

        $cursor = $this->teachers->find($filter, ['projection' => ['_id' => 1, 'nama_guru' => 1]]);
        $map    = [];
        foreach ($cursor as $t) {
            $map[(string) $t['_id']] = $t['nama_guru'] ?? '—';
        }
        return $map;
    }

    /** student_id → program_name (join 2 collection) */
    private function buildProgramByStudentMap(array $studentIds): array
    {
        if (empty($studentIds)) return [];

        $oids = [];
        foreach ($studentIds as $sid) {
            try { $oids[] = new ObjectId($sid); } catch (\Exception $e) {}
        }
        if (empty($oids)) return [];

        $cursor     = $this->students->find(
            ['_id' => ['$in' => $oids]],
            ['projection' => ['_id' => 1, 'program_id' => 1]]
        );
        $pidBySid   = [];
        $programIds = [];
        foreach ($cursor as $s) {
            $sid              = (string) $s['_id'];
            $pid              = $s['program_id'] ?? null;
            $pidBySid[$sid]   = $pid;
            if ($pid) $programIds[] = $pid;
        }

        $programIds = array_unique(array_filter($programIds));
        $poids      = [];
        foreach ($programIds as $pid) {
            try { $poids[] = new ObjectId($pid); } catch (\Exception $e) {}
        }

        $nameMap = [];
        if (!empty($poids)) {
            $pcursor = $this->programs->find(['_id' => ['$in' => $poids]]);
            foreach ($pcursor as $p) {
                $nameMap[(string) $p['_id']] = $p['name'] ?? '—';
            }
        }

        $result = [];
        foreach ($pidBySid as $sid => $pid) {
            $result[$sid] = $pid ? ($nameMap[$pid] ?? '—') : '—';
        }
        return $result;
    }

    /** Format satu report document → array JSON-friendly */
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
            'student_id'          => (string) ($doc['student_id']    ?? ''),
            'teacher_id'          => (string) ($doc['teacher_id']    ?? ''),
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