<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\SppPayment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use MongoDB\BSON\Regex;

class SppController extends Controller
{
    private function format(SppPayment $p): array
    {
        $tahun = (int) $p->tahun;
        $bulan = (int) $p->bulan;

        $dueBulan = $bulan + 1;
        $dueTahun = $tahun;
        if ($dueBulan > 12) {
            $dueBulan = 1;
            $dueTahun++;
        }
        $dueDateStr = sprintf('%04d-%02d-05', $dueTahun, $dueBulan);

        $isOverdue = false;
        if (in_array($p->status, ['belum', 'cicilan'])) {
            $today = date('Y-m-d');
            $isOverdue = ($today > $dueDateStr);
        }

        return [
            'id'            => (string) $p->_id,
            'student_id'    => $p->student_id,
            'student_name'  => $p->student_name,
            'parent_id'     => $p->parent_id,
            'tahun'         => $tahun,
            'bulan'         => $bulan,
            'nominal'       => (int) $p->nominal,
            'status'        => $p->status,
            'tanggal_bayar' => $p->tanggal_bayar,
            'keterangan'    => $p->keterangan,
            'bukti_bayar'   => $p->bukti_bayar,
            'created_at'    => $p->created_at?->format('Y-m-d'),
            'jatuh_tempo'   => $dueDateStr,
            'is_overdue'    => $isOverdue,
        ];
    }

    public function index(Request $request)
    {
        $search   = $request->query('search', '');
        $tahun    = $request->query('tahun', '');
        $bulan    = $request->query('bulan', '');
        $status   = $request->query('status', '');
        $perPage  = max(1, min(100, (int) $request->query('per_page', 10)));
        $page     = (int) $request->query('page', 1);
        $skip     = ($page - 1) * $perPage;

        $query = SppPayment::query();

        if (!empty($search)) {
            $regex = new Regex(preg_quote($search, '/'), 'i');
            $query->where('student_name', $regex);
        }
        if ($tahun !== '')  $query->where('tahun', (int) $tahun);
        if ($bulan !== '')  $query->where('bulan', (int) $bulan);
        if (!empty($status)) $query->where('status', $status);

        $total    = $query->count();
        $payments = $query
            ->orderByDesc('tahun')
            ->orderByDesc('bulan')
            ->orderBy('student_name')
            ->skip($skip)
            ->take($perPage)
            ->get();

        return response()->json([
            'success' => true,
            'data'    => $payments->map(fn($p) => $this->format($p)),
            'meta'    => [
                'total'     => $total,
                'page'      => $page,
                'per_page'  => $perPage,
                'last_page' => (int) ceil($total / $perPage),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tahun'      => 'required|integer|min:2000|max:2100',
            'bulan'      => 'required|integer|min:1|max:12',
            'nominal'    => 'required|integer|min:0',
            'keterangan' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $tahun = (int) $request->tahun;
        $bulan = (int) $request->bulan;

        $students = Student::where('enrollment_status', 'active')->get();
        if ($students->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Tidak ada siswa aktif.'], 422);
        }

        // Ambil siswa yang sudah punya tagihan bulan ini
        $existingIds = SppPayment::where('tahun', $tahun)
            ->where('bulan', $bulan)
            ->pluck('student_id')
            ->toArray();

        $bln = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
        $nominalFmt = 'Rp ' . number_format((int) $request->nominal, 0, ',', '.');

        $created = 0;
        $skipped = 0;

        foreach ($students as $student) {
            $studentId = (string) $student->_id;
            if (in_array($studentId, $existingIds)) {
                $skipped++;
                continue;
            }

            $payment = SppPayment::create([
                'student_id'    => $studentId,
                'student_name'  => $student->nama,
                'parent_id'     => $student->parent_id ?? null,
                'tahun'         => $tahun,
                'bulan'         => $bulan,
                'nominal'       => (int) $request->nominal,
                'status'        => 'belum',
                'tanggal_bayar' => null,
                'keterangan'    => $request->keterangan,
                'bukti_bayar'   => null,
            ]);

            if (!empty($student->parent_id)) {
                Notification::send(
                    (string) $student->parent_id,
                    'spp',
                    'Tagihan SPP Baru',
                    "Tagihan SPP {$student->nama} bulan {$bln[$bulan]} {$tahun} sebesar {$nominalFmt} telah diterbitkan.",
                    '?tab=spp'
                );
            }

            $created++;
        }

        $msg = "{$created} tagihan berhasil dibuat" . ($skipped > 0 ? ", {$skipped} sudah ada (dilewati)." : ".");

        return response()->json([
            'success' => true,
            'message' => $msg,
            'created' => $created,
            'skipped' => $skipped,
        ], 201);
    }

    public function summary(Request $request)
    {
        $tahun = $request->query('tahun', '');
        $bulan = $request->query('bulan', '');

        $query = SppPayment::query();
        if ($tahun !== '') $query->where('tahun', (int) $tahun);
        if ($bulan !== '') $query->where('bulan', (int) $bulan);

        $all     = $query->get(['status', 'nominal']);
        $lunas   = $all->where('status', 'lunas');
        $belum   = $all->where('status', 'belum');
        $cicilan = $all->where('status', 'cicilan');

        return response()->json([
            'success'       => true,
            'total'         => $all->count(),
            'lunas'         => $lunas->count(),
            'belum'         => $belum->count(),
            'cicilan'       => $cicilan->count(),
            'nominal_lunas' => (int) $lunas->sum('nominal'),
            'nominal_all'   => (int) $all->sum('nominal'),
        ]);
    }

    public function parentIndex(Request $request)
    {
        $userId   = (string) auth()->user()->_id;
        $tahun    = $request->query('tahun', '');
        $bulan    = $request->query('bulan', '');

        $children = Student::where('parent_id', $userId)
            ->orderBy('nama')
            ->get(['_id', 'nama']);

        if ($children->isEmpty()) {
            return response()->json(['success' => true, 'data' => []]);
        }

        $childIds = $children->map(fn($c) => (string) $c->_id)->toArray();

        $query = SppPayment::whereIn('student_id', $childIds);
        if ($tahun !== '') $query->where('tahun', (int) $tahun);
        if ($bulan !== '') $query->where('bulan', (int) $bulan);

        $payments = $query->orderByDesc('tahun')->orderByDesc('bulan')->get();

        $grouped = $children->map(function ($child) use ($payments) {
            $cid           = (string) $child->_id;
            $childPayments = $payments->filter(fn($p) => $p->student_id === $cid)->values();
            return [
                'student_id'   => $cid,
                'student_name' => $child->nama ?? '',
                'payments'     => $childPayments->map(fn($p) => $this->format($p))->values(),
            ];
        });

        return response()->json(['success' => true, 'data' => $grouped]);
    }

    public function show(string $id)
    {
        $payment = SppPayment::where('_id', $id)->first();
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }
        return response()->json(['success' => true, 'data' => $this->format($payment)]);
    }

    public function update(Request $request, string $id)
    {
        $payment = SppPayment::where('_id', $id)->first();
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nominal'       => 'sometimes|integer|min:0',
            'status'        => 'sometimes|in:lunas,belum,cicilan,menunggu',
            'tanggal_bayar' => 'nullable|date_format:Y-m-d',
            'keterangan'    => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $oldStatus = $payment->status;
        $update    = [];
        if ($request->has('nominal'))       $update['nominal']       = (int) $request->nominal;
        if ($request->has('status'))        $update['status']        = $request->status;
        if ($request->has('tanggal_bayar')) $update['tanggal_bayar'] = $request->tanggal_bayar;
        if ($request->has('keterangan'))    $update['keterangan']    = $request->keterangan;

        $payment->update($update);
        $payment->refresh();

        // Kirim notif ke wali saat admin konfirmasi/tolak pembayaran
        if (isset($update['status']) && !empty($payment->parent_id) && $oldStatus !== $update['status']) {
            $bln = ['','Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
            if ($update['status'] === 'lunas') {
                Notification::send(
                    (string) $payment->parent_id, 'spp',
                    'Pembayaran Dikonfirmasi',
                    "Pembayaran SPP {$payment->student_name} bulan {$bln[(int)$payment->bulan]} {$payment->tahun} telah dikonfirmasi lunas.",
                    '?tab=spp'
                );
            } elseif ($update['status'] === 'belum' && $oldStatus === 'menunggu') {
                Notification::send(
                    (string) $payment->parent_id, 'spp',
                    'Bukti Bayar Ditolak',
                    "Bukti pembayaran SPP {$payment->student_name} bulan {$bln[(int)$payment->bulan]} {$payment->tahun} tidak valid. Silakan upload ulang.",
                    '?tab=spp'
                );
            }
        }

        return response()->json(['success' => true, 'data' => $this->format($payment)]);
    }

    public function destroy(string $id)
    {
        $payment = SppPayment::where('_id', $id)->first();
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }
        $payment->delete();
        return response()->json(['success' => true, 'message' => 'Data berhasil dihapus.']);
    }

    public function studentOptions(Request $request)
    {
        $search = $request->query('search', '');

        $query = Student::query();
        if (!empty($search)) {
            $regex = new Regex(preg_quote($search, '/'), 'i');
            $query->where('nama', $regex);
        }

        $students = $query->orderBy('nama')->limit(50)->get();

        return response()->json([
            'success' => true,
            'data'    => $students->map(fn($s) => [
                'id'     => (string) $s->_id,
                'nama'   => $s->nama,
                'status' => $s->enrollment_status ?? 'active',
            ]),
        ]);
    }

    public function parentPay(Request $request, string $id)
    {
        $payment = SppPayment::where('_id', $id)->first();
        if (!$payment) {
            return response()->json(['success' => false, 'message' => 'Data tidak ditemukan.'], 404);
        }

        $userId  = (string) auth()->user()->_id;
        $student = Student::where('_id', $payment->student_id)
            ->where('parent_id', $userId)
            ->first();
        if (!$student) {
            return response()->json(['success' => false, 'message' => 'Tidak memiliki akses.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'bukti_bayar' => 'required|image|max:4096',
            'keterangan'  => 'nullable|string|max:500',
        ]);
        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Hapus bukti lama jika ada
        if (!empty($payment->bukti_bayar)) {
            $oldPath = str_replace(url('storage/'), '', $payment->bukti_bayar);
            Storage::disk('public')->delete(ltrim($oldPath, '/'));
        }

        $path = $request->file('bukti_bayar')->store('spp/bukti', 'public');
        $url  = url('storage/' . $path);

        $update = ['bukti_bayar' => $url, 'status' => 'menunggu'];
        if ($request->filled('keterangan')) $update['keterangan'] = $request->keterangan;

        $payment->update($update);

        return response()->json(['success' => true]);
    }
}
