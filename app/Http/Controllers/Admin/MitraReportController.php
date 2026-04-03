<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use MongoDB\Client as MongoClient;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class MitraReportController extends Controller
{
    private $partners;
    private $mitraReports;

    public function __construct()
    {
        $client             = new MongoClient(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db                 = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->partners     = $db->selectCollection('partners');
        $this->mitraReports = $db->selectCollection('mitra_reports');
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/mitra/list
     | Daftar semua mitra + jumlah laporan masing-masing
     | Query params: search
     ───────────────────────────────────────────────────────── */
    public function partners(Request $request): JsonResponse
    {
        $search = trim($request->query('search', ''));
        $filter = [];
        if ($search !== '') {
            $filter['$or'] = [
                ['institution_name' => ['$regex' => $search, '$options' => 'i']],
                ['contact_person'   => ['$regex' => $search, '$options' => 'i']],
            ];
        }

        $cursor   = $this->partners->find($filter, ['sort' => ['institution_name' => 1]]);
        $partners = [];
        foreach ($cursor as $doc) {
            $partners[] = $doc;
        }

        // Hitung laporan per mitra (1 aggregation)
        $partnerIds  = array_map(fn($p) => (string) $p['_id'], $partners);
        $reportCount = [];
        if (!empty($partnerIds)) {
            $pipeline = [
                ['$match'  => ['partner_id' => ['$in' => $partnerIds]]],
                ['$group'  => ['_id' => '$partner_id', 'count' => ['$sum' => 1]]],
            ];
            foreach ($this->mitraReports->aggregate($pipeline) as $row) {
                $reportCount[(string) $row['_id']] = $row['count'];
            }
        }

        $data = [];
        foreach ($partners as $doc) {
            $pid    = (string) $doc['_id'];
            $data[] = [
                'id'               => $pid,
                'institution_name' => $doc['institution_name'] ?? '—',
                'contact_person'   => $doc['contact_person']   ?? '—',
                'status'           => $doc['status']           ?? 'Inactive',
                'report_count'     => $reportCount[$pid]       ?? 0,
            ];
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/admin/mitra/{partnerId}/reports
     | Daftar laporan satu mitra
     ───────────────────────────────────────────────────────── */
    public function reports(string $partnerId): JsonResponse
    {
        $cursor = $this->mitraReports->find(
            ['partner_id' => $partnerId],
            ['sort' => ['date' => -1]]
        );

        $data = [];
        foreach ($cursor as $r) {
            $data[] = $this->formatReport($r);
        }

        return response()->json($data);
    }

    /* ─────────────────────────────────────────────────────────
     | POST /api/admin/mitra/{partnerId}/reports
     | Upload laporan baru untuk mitra
     ───────────────────────────────────────────────────────── */
    public function store(Request $request, string $partnerId): JsonResponse
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'date'        => 'required|date_format:Y-m-d',
            'description' => 'nullable|string|max:2000',
            'file'        => 'required|file|mimes:pdf,doc,docx|max:10240', // max 10MB
        ]);

        // Pastikan mitra ada
        try {
            $partner = $this->partners->findOne(['_id' => new ObjectId($partnerId)]);
        } catch (\Exception $e) { $partner = null; }
        if (!$partner) {
            return response()->json(['message' => 'Mitra tidak ditemukan.'], 404);
        }

        // Simpan file ke storage/app/public/mitra-reports/
        $file     = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $path     = $file->store('mitra-reports', 'public');
        $fileUrl  = Storage::url($path);  // /storage/mitra-reports/xxx.pdf

        $doc = [
            'partner_id'  => $partnerId,
            'title'       => $request->title,
            'date'        => $request->date,
            'description' => $request->description ?? null,
            'file_url'    => $fileUrl,
            'file_path'   => $path,   // untuk keperluan delete
            'file_name'   => $fileName,
            'file_type'   => $file->getClientOriginalExtension(),
            'file_size'   => $file->getSize(),
            'uploaded_by' => (string) auth()->id(),
            'created_at'  => new UTCDateTime(),
            'updated_at'  => new UTCDateTime(),
        ];

        $result     = $this->mitraReports->insertOne($doc);
        $doc['_id'] = $result->getInsertedId();

        return response()->json($this->formatReport($doc), 201);
    }

    /* ─────────────────────────────────────────────────────────
     | DELETE /api/admin/mitra/reports/{reportId}
     | Hapus laporan + file fisiknya
     ───────────────────────────────────────────────────────── */
    public function destroy(string $reportId): JsonResponse
    {
        try { $oid = new ObjectId($reportId); }
        catch (\Exception $e) {
            return response()->json(['message' => 'ID tidak valid.'], 400);
        }

        $report = $this->mitraReports->findOne(['_id' => $oid]);
        if (!$report) {
            return response()->json(['message' => 'Laporan tidak ditemukan.'], 404);
        }

        // Hapus file fisik dari storage
        if (!empty($report['file_path'])) {
            Storage::disk('public')->delete($report['file_path']);
        }

        $this->mitraReports->deleteOne(['_id' => $oid]);

        return response()->json(['message' => 'Laporan berhasil dihapus.']);
    }

    /* ─────────────────────────────────────────────────────────
     | GET /api/mitra/reports
     | Laporan untuk mitra yang sedang login
     | Query params: search, page, per_page
     | Relasi: partners.user_id = users._id
     ───────────────────────────────────────────────────────── */
    public function mitraReports(Request $request): JsonResponse
    {
        $userId = (string) auth()->id();

        // Cari partner berdasarkan user_id
        $partner = $this->partners->findOne(['user_id' => $userId]);
        if (!$partner) {
            return response()->json(['message' => 'Profil mitra tidak ditemukan.'], 404);
        }

        $partnerId = (string) $partner['_id'];
        $search    = trim($request->query('search', ''));
        $perPage   = (int) $request->query('per_page', 10);
        $page      = max(1, (int) $request->query('page', 1));
        $skip      = ($page - 1) * $perPage;

        $filter = ['partner_id' => $partnerId];
        if ($search !== '') {
            $filter['title'] = ['$regex' => $search, '$options' => 'i'];
        }

        $total  = $this->mitraReports->countDocuments($filter);
        $cursor = $this->mitraReports->find($filter, [
            'sort'  => ['date' => -1],
            'skip'  => $skip,
            'limit' => $perPage,
        ]);

        // Hitung laporan baru (dalam 7 hari terakhir)
        $sevenDaysAgo = (new \DateTime('-7 days'))->format('Y-m-d');
        $newCount = $this->mitraReports->countDocuments([
            'partner_id' => $partnerId,
            'date'       => ['$gte' => $sevenDaysAgo],
        ]);

        $data = [];
        foreach ($cursor as $r) {
            $data[] = $this->formatReport($r);
        }

        return response()->json([
            'data'      => $data,
            'new_count' => $newCount,
            'meta'      => [
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => (int) ceil($total / max($perPage, 1)),
            ],
        ]);
    }

    /* ─────────────────────────────────────────────────────────
     | HELPER
     ───────────────────────────────────────────────────────── */
    private function formatReport($doc): array
    {
        $createdAt = $doc['created_at'] ?? null;
        if ($createdAt instanceof UTCDateTime) {
            $createdAt = $createdAt->toDateTime()->format('Y-m-d H:i:s');
        }

        return [
            'id'          => (string) $doc['_id'],
            'partner_id'  => (string) ($doc['partner_id'] ?? ''),
            'title'       => $doc['title']       ?? '—',
            'date'        => $doc['date']         ?? null,
            'description' => $doc['description']  ?? null,
            'file_url'    => $doc['file_url']     ?? null,
            'file_name'   => $doc['file_name']    ?? null,
            'file_type'   => $doc['file_type']    ?? null,
            'file_size'   => $doc['file_size']    ?? null,
            'created_at'  => $createdAt,
        ];
    }
}