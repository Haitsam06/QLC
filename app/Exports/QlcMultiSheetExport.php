<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\Partner;
use App\Models\Parents;
use App\Models\Agenda;
use App\Models\ProgressReport;
use App\Models\SppPayment;
use App\Models\Program;
use App\Models\User;

class QlcMultiSheetExport implements WithMultipleSheets
{
    public function sheets(): array
    {
        return [
            new StudentsSheet(),
            new TeachersSheet(),
            new PartnersSheet(),
            new ParentsSheet(),
            new AgendasSheet(),
            new ProgressReportsSheet(),
            new SppPaymentsSheet(),
        ];
    }
}

class StudentsSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Data Siswa';
    }

    public function headings(): array
    {
        return [
            'ID Siswa',
            'Nama Siswa',
            'Program Studi',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Usia',
            'Nama Wali',
            'No Telepon Wali',
            'Status Pendaftaran',
            'Tanggal Daftar'
        ];
    }

    public function array(): array
    {
        $programs = Program::all()->pluck('name', 'id')->toArray();
        $students = Student::all();
        $parents = Parents::all()->keyBy('user_id')->toArray();

        $rows = [];
        foreach ($students as $s) {
            $progName = $programs[$s->program_id] ?? 'Umum';
            $parentPhone = $parents[$s->parent_id]['phone'] ?? '';
            
            $rows[] = [
                (string) $s->_id,
                $s->nama,
                $progName,
                $s->tempat_lahir,
                $s->tanggal_lahir,
                $s->usia,
                $s->parent_name,
                $parentPhone,
                $s->enrollment_status === 'approved' ? 'Disetujui' : ($s->enrollment_status === 'pending' ? 'Tertunda' : 'Ditolak'),
                $s->created_at ? $s->created_at->format('Y-m-d H:i') : ''
            ];
        }
        return $rows;
    }
}

class TeachersSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Data Guru';
    }

    public function headings(): array
    {
        return [
            'ID Guru',
            'Nama Guru',
            'Email',
            'No Telepon',
            'Spesialisasi / Bidang',
            'Tanggal Masuk'
        ];
    }

    public function array(): array
    {
        $teachers = Teacher::all();
        $rows = [];
        foreach ($teachers as $t) {
            $rows[] = [
                (string) $t->_id,
                $t->nama_guru,
                $t->email,
                $t->phone,
                $t->bidang,
                $t->tanggal_masuk
            ];
        }
        return $rows;
    }
}

class PartnersSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Data Mitra';
    }

    public function headings(): array
    {
        return [
            'ID Mitra',
            'Nama Institusi',
            'Nama PIC',
            'No Telepon PIC',
            'Link Dokumen MOU',
            'Status Keaktifan'
        ];
    }

    public function array(): array
    {
        $partners = Partner::all();
        $rows = [];
        foreach ($partners as $p) {
            $rows[] = [
                (string) $p->_id,
                $p->institution_name,
                $p->contact_person,
                $p->phone,
                $p->mou_file_url ? url('storage/' . $p->mou_file_url) : 'Tidak ada',
                $p->status === 'active' ? 'Aktif' : 'Non-aktif'
            ];
        }
        return $rows;
    }
}

class ParentsSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Data Wali Murid';
    }

    public function headings(): array
    {
        return [
            'ID Wali',
            'Nama Wali Murid',
            'Email Akun',
            'No Telepon',
            'Alamat'
        ];
    }

    public function array(): array
    {
        $parents = Parents::all();
        $users = User::all()->keyBy('id')->toArray();
        $rows = [];
        foreach ($parents as $p) {
            $userEmail = $users[$p->user_id]['email'] ?? '';
            $rows[] = [
                (string) $p->_id,
                $p->parent_name,
                $userEmail,
                $p->phone,
                $p->address
            ];
        }
        return $rows;
    }
}

class AgendasSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Agenda Kegiatan';
    }

    public function headings(): array
    {
        return [
            'ID Agenda',
            'Judul Agenda',
            'Tanggal Kegiatan',
            'Lokasi',
            'Target Audience',
            'Link Pendaftaran',
            'Deskripsi'
        ];
    }

    public function array(): array
    {
        $agendas = Agenda::all();
        $rows = [];
        foreach ($agendas as $a) {
            $rows[] = [
                (string) $a->_id,
                $a->title,
                $a->event_date,
                $a->location,
                $a->visibility === 'keduanya' ? 'Umum & Mitra' : ucfirst($a->visibility),
                $a->registration_link ?: 'Tidak ada',
                $a->description
            ];
        }
        return $rows;
    }
}

class ProgressReportsSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Laporan Progress';
    }

    public function headings(): array
    {
        return [
            'ID Laporan',
            'Nama Siswa',
            'Tanggal Laporan',
            'Kehadiran',
            'Capaian Materi',
            'Kualitas Capaian',
            'Tipe Laporan',
            'Catatan Pengajar'
        ];
    }

    public function array(): array
    {
        $reports = ProgressReport::all();
        $students = Student::all()->keyBy('id')->toArray();
        $rows = [];
        foreach ($reports as $r) {
            $studentName = $students[$r->student_id]['nama'] ?? 'Tidak Dikenal';
            $rows[] = [
                (string) $r->_id,
                $studentName,
                $r->date,
                $r->attendance === 'present' ? 'Hadir' : 'Absen',
                $r->hafalan_achievement,
                $r->kualitas === 'sangat_lancar' ? 'Sangat Lancar' : ($r->kualitas === 'lancar' ? 'Lancar' : 'Mengulang'),
                $r->report_type === 'harian' ? 'Harian' : 'Bulanan',
                $r->teacher_notes
            ];
        }
        return $rows;
    }
}

class SppPaymentsSheet implements FromArray, WithTitle, WithHeadings, ShouldAutoSize
{
    public function title(): string
    {
        return 'Pembayaran SPP';
    }

    public function headings(): array
    {
        return [
            'ID Pembayaran',
            'Nama Siswa',
            'Bulan SPP',
            'Tahun SPP',
            'Nominal SPP',
            'Status Pembayaran',
            'Tanggal Bayar',
            'Keterangan'
        ];
    }

    public function array(): array
    {
        $payments = SppPayment::all();
        $rows = [];
        foreach ($payments as $p) {
            $rows[] = [
                (string) $p->_id,
                $p->student_name,
                $p->bulan,
                $p->tahun,
                $p->nominal,
                $p->status === 'paid' ? 'Lunas' : ($p->status === 'unpaid' ? 'Belum Lunas' : 'Menunggu Konfirmasi'),
                $p->tanggal_bayar ?: 'Belum Bayar',
                $p->keterangan ?: ''
            ];
        }
        return $rows;
    }
}
