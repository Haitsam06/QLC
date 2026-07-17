<?php

namespace Database\Seeders;

use App\Models\ProgressReport;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class ProgressReportSeeder extends Seeder
{
    public function run(): void
    {
        ProgressReport::truncate();

        $students = Student::orderBy('nama')->get();
        $teachers = Teacher::orderBy('nama_guru')->get();

        if ($students->isEmpty() || $teachers->isEmpty()) {
            $this->command->warn('ProgressReportSeeder: data siswa atau guru belum ada, skip.');
            return;
        }

        $data = [
            [
                'student_index'      => 0, // Rizky Al-Faruq
                'teacher_index'      => 0, // Ahmad Fauzan
                'date'               => '2026-07-01',
                'attendance'         => 'hadir',
                'report_type'        => 'hafalan',
                'kualitas'           => 'sangat_lancar',
                'hafalan_target'     => 'Al-Baqarah 1-10',
                'hafalan_achievement'=> 'Al-Baqarah 1-10',
                'teacher_notes'      => 'Santri sangat fokus dan lancar dalam hafalan hari ini.',
            ],
            [
                'student_index'      => 1, // Nadia Putri Salsabila
                'teacher_index'      => 1, // Siti Fatimah
                'date'               => '2026-07-02',
                'attendance'         => 'hadir',
                'report_type'        => 'tilawah',
                'kualitas'           => 'lancar',
                'hafalan_target'     => 'Al-Fatihah & Al-Ikhlas',
                'hafalan_achievement'=> 'Al-Fatihah & Al-Ikhlas',
                'teacher_notes'      => 'Murajaah berjalan baik, tajwid perlu sedikit perbaikan.',
            ],
            [
                'student_index'      => 2, // Muhammad Hafiz Firdaus
                'teacher_index'      => 0, // Ahmad Fauzan
                'date'               => '2026-07-03',
                'attendance'         => 'izin',
                'report_type'        => null,
                'kualitas'           => null,
                'hafalan_target'     => null,
                'hafalan_achievement'=> null,
                'teacher_notes'      => 'Santri izin karena sakit ringan.',
            ],
            [
                'student_index'      => 3, // Fatimah Az-Zahra
                'teacher_index'      => 2, // Muhammad Ridwan
                'date'               => '2026-07-04',
                'attendance'         => 'hadir',
                'report_type'        => 'hafalan',
                'kualitas'           => 'mengulang',
                'hafalan_target'     => 'Ali Imran 1-5',
                'hafalan_achievement'=> 'Ali Imran 1-3',
                'teacher_notes'      => 'Progres baik, perlu penguatan pada ayat 4 dan 5.',
            ],
            [
                'student_index'      => 4, // Umar Abdillah Hakim
                'teacher_index'      => 1, // Siti Fatimah
                'date'               => '2026-07-05',
                'attendance'         => 'hadir',
                'report_type'        => 'yanbua',
                'kualitas'           => 'sangat_lancar',
                'hafalan_target'     => 'Juz 30',
                'hafalan_achievement'=> 'Juz 30',
                'teacher_notes'      => 'Santri menyelesaikan murajaah Juz 30 dengan sangat baik.',
            ],
            [
                'student_index'      => 5, // Aisyah Humaira
                'teacher_index'      => 3, // Nur Halimah
                'date'               => '2026-07-06',
                'attendance'         => 'hadir',
                'report_type'        => 'hafalan',
                'kualitas'           => 'lancar',
                'hafalan_target'     => 'An-Naba 1-15',
                'hafalan_achievement'=> 'An-Naba 1-15',
                'teacher_notes'      => 'Hafalan lancar dengan makhraj yang baik.',
            ],
            [
                'student_index'      => 6, // Ali Zainal Abidin
                'teacher_index'      => 4, // Hasan Basri
                'date'               => '2026-07-07',
                'attendance'         => 'hadir',
                'report_type'        => 'tilawah',
                'kualitas'           => 'lancar',
                'hafalan_target'     => 'Yasin 1-20',
                'hafalan_achievement'=> 'Yasin 1-15',
                'teacher_notes'      => 'Membaca lancar, perlu pengulangan di ayat 16-20.',
            ],
            [
                'student_index'      => 7, // Khadijah Al-Kubra
                'teacher_index'      => 5, // Lutfi Hakim
                'date'               => '2026-07-08',
                'attendance'         => 'hadir',
                'report_type'        => 'yanbua',
                'kualitas'           => 'sangat_lancar',
                'hafalan_target'     => 'Jilid 4 Halaman 1-5',
                'hafalan_achievement'=> 'Jilid 4 Halaman 1-5',
                'teacher_notes'      => 'Luar biasa, materi diserap dengan sangat baik.',
            ],
        ];

        foreach ($data as $r) {
            $student = $students[$r['student_index']] ?? $students->first();
            $teacher = $teachers[$r['teacher_index']] ?? $teachers->first();

            ProgressReport::create([
                'student_id'          => (string) $student->_id,
                'teacher_id'          => (string) $teacher->_id,
                'date'                => $r['date'],
                'attendance'          => $r['attendance'],
                'report_type'         => $r['report_type'],
                'kualitas'            => $r['kualitas'],
                'hafalan_target'      => $r['hafalan_target'],
                'hafalan_achievement' => $r['hafalan_achievement'],
                'teacher_notes'       => $r['teacher_notes'],
                'created_by'          => 'teacher',
            ]);
        }

        $this->command->info('ProgressReportSeeder: Data laporan progress berhasil di-seed.');
    }
}
