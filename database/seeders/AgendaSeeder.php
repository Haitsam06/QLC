<?php

namespace Database\Seeders;

use App\Models\Agenda;
use App\Models\User;
use Illuminate\Database\Seeder;

class AgendaSeeder extends Seeder
{
    public function run(): void
    {
        Agenda::truncate();

        $admin = User::where('role_id', 'RL01')->first();
        $userId = $admin ? (string) $admin->_id : null;

        $items = [
            [
                'title'             => 'Halaqah Tahfidz Bulanan',
                'event_date'        => '2026-07-10',
                'description'       => 'Sesi halaqah tahfidz rutin untuk seluruh santri aktif. Dihadiri oleh semua pengajar dan wali murid.',
                'location'          => 'Aula Utama QLC',
                'registration_link' => null,
                'visibility'        => 'umum',
            ],
            [
                'title'             => 'Pelatihan Guru Metode Yanbu\'a',
                'event_date'        => '2026-07-24',
                'description'       => 'Pelatihan intensif bagi para guru dalam penerapan metode Yanbu\'a secara efektif.',
                'location'          => 'Ruang Kelas B',
                'registration_link' => null,
                'visibility'        => 'keduanya',
            ],
            [
                'title'             => 'Seminar Kemitraan Lembaga 2026',
                'event_date'        => '2026-08-05',
                'description'       => 'Forum diskusi antara QLC dan lembaga mitra mengenai program kolaborasi tahun 2026.',
                'location'          => 'Hotel Grand Bekasi',
                'registration_link' => null,
                'visibility'        => 'mitra',
            ],
            [
                'title'             => 'Wisuda Hafidz Angkatan VIII',
                'event_date'        => '2026-08-20',
                'description'       => 'Upacara wisuda bagi santri yang telah menyelesaikan target hafalan 30 juz.',
                'location'          => 'Gedung Serbaguna QLC',
                'registration_link' => 'https://wa.me/6281234567890',
                'visibility'        => 'umum',
            ],
            [
                'title'             => 'Evaluasi Program Semester Ganjil',
                'event_date'        => '2026-09-15',
                'description'       => 'Rapat evaluasi awal semester ganjil bersama seluruh tenaga pengajar dan mitra strategis.',
                'location'          => 'Ruang Rapat QLC',
                'registration_link' => null,
                'visibility'        => 'keduanya',
            ],
            [
                'title'             => 'Kajian Dhuha Bersama Wali Murid',
                'event_date'        => '2026-09-28',
                'description'       => 'Kajian rutin bulanan bertema mendidik anak dengan Al-Qur\'an.',
                'location'          => 'Masjid Pejuang Qur\'an',
                'registration_link' => null,
                'visibility'        => 'umum',
            ],
            [
                'title'             => 'Kunjungan Edukasi (Field Trip)',
                'event_date'        => '2026-10-12',
                'description'       => 'Kunjungan santri ke museum sains untuk memperluas wawasan integrasi sains & islam.',
                'location'          => 'Museum Sains IPTEK',
                'registration_link' => null,
                'visibility'        => 'umum',
            ],
            [
                'title'             => 'Rapat Kerja Tahunan 2027',
                'event_date'        => '2026-11-20',
                'description'       => 'Rapat kerja seluruh pengurus dan direksi program QLC menyusun target tahun depan.',
                'location'          => 'Ruang Meeting Utama',
                'registration_link' => null,
                'visibility'        => 'keduanya',
            ],
        ];

        foreach ($items as $item) {
            Agenda::create(array_merge($item, ['user_id' => $userId]));
        }

        $this->command->info('AgendaSeeder: Data agenda berhasil di-seed.');
    }
}
