<?php

namespace App\Http\Controllers;

use App\Models\Agenda;
use App\Models\MitraReport;
use App\Models\Partner;
use Illuminate\Support\Facades\Auth;

class MitraDashboardController extends Controller
{
    public function index()
    {
        $userId = (string) Auth::id();

        $partner = Partner::where('user_id', $userId)->first();

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Data mitra tidak ditemukan'], 404);
        }

        $partnerId = (string) $partner->_id;

        $scheduleData = Agenda::where('event_date', '>=', date('Y-m-d'))
            ->whereIn('visibility', ['mitra', 'keduanya'])
            ->orderBy('event_date')
            ->limit(3)
            ->get()
            ->map(fn($ag) => [
                'id'       => (string) $ag->_id,
                'date'     => $ag->event_date,
                'title'    => $ag->title,
                'location' => $ag->location ?? 'Online / TBA',
            ]);

        $reportData = MitraReport::where('partner_id', $partnerId)
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(fn($rp) => [
                'id'        => (string) $rp->_id,
                'title'     => $rp->title,
                'date'      => $rp->date ?? null,
                'file_size' => $rp->file_size ?? 0,
                'file_url'  => $rp->file_url ?? null,
                'file_type' => $rp->file_type ?? 'pdf',
            ]);

        return response()->json([
            'success' => true,
            'data' => [
                'profile' => [
                    'id'               => $partnerId,
                    'institution_name' => $partner->institution_name ?? 'Mitra',
                    'contact_person'   => $partner->contact_person ?? '',
                    'mou_file_url'     => $partner->mou_file_url ?? null,
                    'status'           => $partner->status ?? 'Active',
                ],
                'schedules' => $scheduleData,
                'reports'   => $reportData,
            ],
        ]);
    }
}
