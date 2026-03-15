<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use MongoDB\Client;
use MongoDB\BSON\ObjectId;
use MongoDB\BSON\UTCDateTime;

class AgendaController extends Controller
{
    private $agenda;

    public function __construct()
    {
        $client       = new Client(env('MONGODB_URI', 'mongodb://localhost:27017'));
        $db           = $client->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));
        $this->agenda = $db->selectCollection('agenda');
    }

    /* ─────────────────────────────────────────────
       GET /api/agenda?year=&month=&visibility=
       visibility: all (default, admin) | umum | mitra
    ───────────────────────────────────────────── */
    public function index(Request $request)
    {
        $year       = (int) $request->query('year',  date('Y'));
        $month      = (int) $request->query('month', date('n'));
        $visibility = $request->query('visibility', 'all');

        $start = sprintf('%04d-%02d-01', $year, $month);
        $last  = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $end   = sprintf('%04d-%02d-%02d', $year, $month, $last);

        $filter = ['event_date' => ['$gte' => $start, '$lte' => $end]];

        if ($visibility === 'umum') {
            $filter['visibility'] = ['$in' => ['umum', 'keduanya']];
        } elseif ($visibility === 'mitra') {
            $filter['visibility'] = ['$in' => ['mitra', 'keduanya']];
        }

        $cursor = $this->agenda->find($filter, ['sort' => ['event_date' => 1]]);

        $data = [];
        foreach ($cursor as $doc) {
            $data[] = $this->format($doc);
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    /* ─────────────────────────────────────────────
       GET /api/agenda/upcoming?visibility=&limit=
       Untuk side panel "Agenda Terdekat"
    ───────────────────────────────────────────── */
    public function upcoming(Request $request)
    {
        $visibility = $request->query('visibility', 'all');
        $limit      = (int) $request->query('limit', 5);
        $today      = date('Y-m-d');

        $filter = ['event_date' => ['$gte' => $today]];

        if ($visibility === 'umum') {
            $filter['visibility'] = ['$in' => ['umum', 'keduanya']];
        } elseif ($visibility === 'mitra') {
            $filter['visibility'] = ['$in' => ['mitra', 'keduanya']];
        }

        $cursor = $this->agenda->find($filter, [
            'sort'  => ['event_date' => 1],
            'limit' => $limit,
        ]);

        $data = [];
        foreach ($cursor as $doc) {
            $data[] = $this->format($doc);
        }

        return response()->json(['success' => true, 'data' => $data]);
    }

    /* ─────────────────────────────────────────────
       POST /api/agenda
    ───────────────────────────────────────────── */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title'             => 'required|string|max:200',
            'event_date'        => 'required|date_format:Y-m-d',
            'description'       => 'nullable|string|max:3000',
            'location'          => 'nullable|string|max:300',
            'registration_link' => 'nullable|url|max:500',
            'visibility'        => 'required|in:umum,mitra,keduanya',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $now    = new UTCDateTime();
        $result = $this->agenda->insertOne([
            'user_id' => auth()->check() ? (string) auth()->user()->_id : null,
            'title'             => $request->title,
            'event_date'        => $request->event_date,
            'description'       => $request->description ?? '',
            'location'          => $request->location ?? '',
            'registration_link' => $request->registration_link ?? '',
            'visibility'        => $request->visibility,
            'created_at'        => $now,
            'updated_at'        => $now,
        ]);

        $inserted = $this->agenda->findOne(['_id' => $result->getInsertedId()]);

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil ditambahkan.',
            'data'    => $this->format($inserted),
        ], 201);
    }

    /* ─────────────────────────────────────────────
       PUT /api/agenda/{id}
    ───────────────────────────────────────────── */
    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'title'             => 'required|string|max:200',
            'event_date'        => 'required|date_format:Y-m-d',
            'description'       => 'nullable|string|max:3000',
            'location'          => 'nullable|string|max:300',
            'registration_link' => 'nullable|url|max:500',
            'visibility'        => 'required|in:umum,mitra,keduanya',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $result = $this->agenda->updateOne(
            ['_id' => $oid],
            ['$set' => [
                'title'             => $request->title,
                'event_date'        => $request->event_date,
                'description'       => $request->description ?? '',
                'location'          => $request->location ?? '',
                'registration_link' => $request->registration_link ?? '',
                'visibility'        => $request->visibility,
                'updated_at'        => new UTCDateTime(),
            ]]
        );

        if ($result->getMatchedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Agenda tidak ditemukan.'], 404);
        }

        $updated = $this->agenda->findOne(['_id' => $oid]);

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil diperbarui.',
            'data'    => $this->format($updated),
        ]);
    }

    /* ─────────────────────────────────────────────
       DELETE /api/agenda/{id}
    ───────────────────────────────────────────── */
    public function destroy(string $id)
    {
        try { $oid = new ObjectId($id); }
        catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'ID tidak valid.'], 400);
        }

        $result = $this->agenda->deleteOne(['_id' => $oid]);

        if ($result->getDeletedCount() === 0) {
            return response()->json(['success' => false, 'message' => 'Agenda tidak ditemukan.'], 404);
        }

        return response()->json(['success' => true, 'message' => 'Agenda berhasil dihapus.']);
    }

    /* ─────────────────────────────────────────────
       Helper
    ───────────────────────────────────────────── */
    private function format($doc): array
    {
        return [
            'id'                => (string) $doc['_id'],
            'user_id'           => $doc['user_id'] ?? null,
            'title'             => $doc['title'],
            'event_date'        => $doc['event_date'],
            'description'       => $doc['description'] ?? '',
            'location'          => $doc['location'] ?? '',
            'registration_link' => $doc['registration_link'] ?? '',
            'visibility'        => $doc['visibility'],
            'created_at'        => isset($doc['created_at'])
                ? $doc['created_at']->toDateTime()->format('Y-m-d H:i:s')
                : null,
        ];
    }
}