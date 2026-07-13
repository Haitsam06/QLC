<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AgendaController extends Controller
{
    private function validationRules(): array
    {
        return [
            'title'             => 'required|string|max:200',
            'event_date'        => 'required|date_format:Y-m-d',
            'description'       => 'nullable|string|max:3000',
            'location'          => 'nullable|string|max:300',
            'registration_link' => 'nullable|url|max:500',
            'visibility'        => 'required|in:umum,mitra,keduanya',
            'image'             => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ];
    }

    public function index(Request $request)
    {
        $year       = (int) $request->query('year',  date('Y'));
        $month      = (int) $request->query('month', date('n'));
        $visibility = $request->query('visibility', 'all');

        $last  = cal_days_in_month(CAL_GREGORIAN, $month, $year);
        $start = sprintf('%04d-%02d-01', $year, $month);
        $end   = sprintf('%04d-%02d-%02d', $year, $month, $last);

        $data = Agenda::where('event_date', '>=', $start)
            ->where('event_date', '<=', $end)
            ->forVisibility($visibility)
            ->orderBy('event_date')
            ->get()
            ->map(fn($a) => $this->format($a));

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function upcoming(Request $request)
    {
        $visibility = $request->query('visibility', 'all');
        $limit      = max(1, min(50, (int) $request->query('limit', 5)));

        $data = Agenda::where('event_date', '>=', date('Y-m-d'))
            ->forVisibility($visibility)
            ->orderBy('event_date')
            ->limit($limit)
            ->get()
            ->map(fn($a) => $this->format($a));

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), $this->validationRules());

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $imageUrl = $request->file('image')->store('agenda/images', config('filesystems.default'));
        }

        $agenda = Agenda::create([
            'user_id'           => auth()->check() ? (string) auth()->user()->_id : null,
            'title'             => $request->title,
            'event_date'        => $request->event_date,
            'description'       => $request->description ?? '',
            'location'          => $request->location ?? '',
            'registration_link' => $request->registration_link ?? '',
            'visibility'        => $request->visibility,
            'image'             => $imageUrl,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil ditambahkan.',
            'data'    => $this->format($agenda),
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), $this->validationRules());

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $agenda = Agenda::find($id);

        if (!$agenda) {
            return response()->json(['success' => false, 'message' => 'Agenda tidak ditemukan.'], 404);
        }

        $user = auth()->user()->loadMissing('role');
        if ($user->getRoleName() !== 'admin' && (string) ($agenda->user_id ?? '') !== (string) $user->_id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak berhak mengubah agenda ini.'], 403);
        }

        $updateData = [
            'title'             => $request->title,
            'event_date'        => $request->event_date,
            'description'       => $request->description ?? '',
            'location'          => $request->location ?? '',
            'registration_link' => $request->registration_link ?? '',
            'visibility'        => $request->visibility,
        ];

        if ($request->hasFile('image')) {
            if (!empty($agenda->image)) {
                $this->deleteStorageFile($agenda->image);
            }
            $updateData['image'] = $request->file('image')->store('agenda/images', config('filesystems.default'));
        } elseif ($request->input('remove_image') === '1') {
            if (!empty($agenda->image)) {
                $this->deleteStorageFile($agenda->image);
            }
            $updateData['image'] = null;
        }

        $agenda->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Agenda berhasil diperbarui.',
            'data'    => $this->format($agenda->fresh()),
        ]);
    }

    public function destroy(string $id)
    {
        $agenda = Agenda::find($id);

        if (!$agenda) {
            return response()->json(['success' => false, 'message' => 'Agenda tidak ditemukan.'], 404);
        }

        $user = auth()->user()->loadMissing('role');
        if ($user->getRoleName() !== 'admin' && (string) ($agenda->user_id ?? '') !== (string) $user->_id) {
            return response()->json(['success' => false, 'message' => 'Anda tidak berhak menghapus agenda ini.'], 403);
        }

        if (!empty($agenda->image)) {
            $this->deleteStorageFile($agenda->image);
        }
        $agenda->delete();

        return response()->json(['success' => true, 'message' => 'Agenda berhasil dihapus.']);
    }

    private function format($doc): array
    {
        return [
            'id'                => (string) $doc->_id,
            'user_id'           => $doc->user_id ?? null,
            'title'             => $doc->title,
            'event_date'        => $doc->event_date,
            'description'       => $doc->description ?? '',
            'location'          => $doc->location ?? '',
            'registration_link' => $doc->registration_link ?? '',
            'visibility'        => $doc->visibility,
            'image'             => $this->getStorageUrl($doc->image ?? null),
            'created_at'        => $doc->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
