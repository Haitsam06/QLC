<?php

namespace Database\Seeders;

use App\Models\Foundation;
use App\Models\Gallery;
use App\Models\Leader;
use App\Models\Profile;
use App\Models\Program;
use Illuminate\Database\Seeder;

class LandingPageSeeder extends Seeder
{
    public function run(): void
    {
        // ── Profile ───────────────────────────────────────────
        Profile::truncate();
        Profile::create([
            'name'             => 'Pejuang Quran',
            'hero_title'       => 'Membangun Generasi Rabbani bersama',
            'tagline'          => "Pusat pembelajaran komprehensif (QLC) yang berdedikasi mencetak pemimpin masa depan dengan kurikulum terpadu dan sistem pelaporan mutakhir.",
            'history'          => "Menjawab kerinduan dan tingginya antusiasme umat untuk kembali kepada Al-Qur'an, Qur'anic Leadership Centre (QLC) hadir memberikan bimbingan pengajaran secara komprehensif. Kami membina santri tidak hanya untuk menghafal, tetapi juga memahami (terjemah), merenungi (tadabur), dan mengaplikasikan nilai-nilai Al-Qur'an.",
            'established_year' => '21 Juni 2016',
            'main_focus'       => 'Pengembangan SDM',
            'vision'           => "\"Menjadi salah satu LEMBAGA PENDIDIKAN QUR'AN UNGGULAN yang mencetak para PEMIMPIN / LEADER berdasarkan Al Qur'an dan Sunnah.\"",
            'mission'          => "Mencetak pribadi yang KOKOH/KUAT Aqidahnya.\nMencetak pribadi yang TAAT Menjalankan perintah Allah SWT.\nMencetak pribadi yang sehat jiwa, raga dan muamalahnya.\nMencetak pribadi yang mengikuti teladan orang-orang HEBAT.\nMencetak pribadi yang BERMANFAAT bagi orang lain.",
            'address'          => 'Jl. Pendidikan Islam No. 1, Kota Bekasi, Jawa Barat 17111',
            'whatsapp'         => '+6281234567890',
            'email'            => 'info@pejuangquran.com',
            'social_media'     => [
                'instagram' => 'https://instagram.com/pejuangquran',
                'facebook'  => 'https://facebook.com/pejuangquran',
                'youtube'   => 'https://youtube.com/@pejuangquran',
            ],
            'bank_name'        => 'Bank Syariah Indonesia',
            'bank_account'     => '7123456789',
            'bank_holder'      => 'Yayasan Pejuang Quran Indonesia',
            'bank_nominal'     => '500000',
        ]);

        // ── Pilar (Foundations) ───────────────────────────────
        Foundation::truncate();
        $foundations = [
            ['title' => 'PRIBADI KUAT',   'description' => 'Kuat secara AQIDAH Islamiyah mencakup keimanan kepada rukun iman.'],
            ['title' => 'PRIBADI TAAT',   'description' => 'Taat menjalankan SYARIAT Islam melingkupi pengamalan 5 Rukun Islam.'],
            ['title' => 'PRIBADI SEHAT',  'description' => 'Sehat secara Jiwa (Ruhiyah), Jasadiyah, Aqliyah, dan Muamalah.'],
            ['title' => 'PRIBADI HEBAT',  'description' => 'Mendalami sejarah dan mengambil teladan dari para Nabi dan Ulama.'],
            ['title' => 'PRIBADI MANFAAT','description' => 'Menggali potensi anak sesuai fitrahnya untuk mengejar cita-cita.'],
        ];
        foreach ($foundations as $f) {
            Foundation::create($f);
        }

        // ── Pengurus (Leaders) ────────────────────────────────
        Leader::truncate();
        $leaders = [
            ['nama' => "Ainun Na'im Al-Hafidh",   'jabatan' => "Ketua Yayasan Pejuang Qur'an Indonesia", 'deskripsi' => 'Pembina dan penggerak utama lembaga sejak awal berdiri.', 'poin' => "Hafidh Qur'an 30 Juz Bersanad\nMaster Trainer Metode Yanbu'a", 'image_url' => '/image/landing/1 (2).png'],
            ['nama' => 'Mushadi Sumaryanto',       'jabatan' => 'Direktur Program QLC',                   'deskripsi' => 'Bertanggung jawab atas seluruh kurikulum program pembelajaran.', 'poin' => "Hafidh 30 Juz 42 Hari Ziyadah\nMaster Trainer Metode Tamasya", 'image_url' => '/image/landing/1 (3).png'],
            ['nama' => 'K.H. Supriyatno, M.Pd.I', 'jabatan' => 'General Manager QLC',                    'deskripsi' => 'Mengawasi operasional harian dan pengembangan kelembagaan.', 'poin' => "Dosen\nKonsultan Lembaga Pendidikan\nDa'i dan Motivator",          'image_url' => '/image/landing/1 (4).png'],
        ];
        foreach ($leaders as $l) {
            Leader::create($l);
        }

        // ── Program ───────────────────────────────────────────
        Program::truncate();
        $programs = [
            [
                'name'            => 'QL - SCHOOL',
                'description'     => "Program pendidikan berkesinambungan terpadu berbasis Al-Qur'an.",
                'target_audience' => 'Semua usia',
                'image_url'       => '/image/landing/1 (5).png',
                'advantages'      => [
                    ['title' => 'Kurikulum Terpadu',   'desc' => 'Kurikulum Al-Quran yang dirancang secara komprehensif dan terstruktur.'],
                    ['title' => 'Guru Bersertifikat',  'desc' => 'Diampu oleh guru hafidz bersanad dan bersertifikat resmi.'],
                    ['title' => 'Laporan Berkala',     'desc' => 'Laporan perkembangan santri dikirim rutin kepada wali murid.'],
                ],
                'gallery'         => [],
            ],
            [
                'name'            => 'QL - TFT',
                'description'     => "Training for Trainers. Pelatihan intensif mencetak instruktur Al-Quran.",
                'target_audience' => 'Dewasa 18+',
                'image_url'       => '/image/landing/1 (6).png',
                'advantages'      => [
                    ['title' => 'Modul Eksklusif',   'desc' => 'Modul pelatihan yang dikembangkan langsung oleh tim QLC.'],
                    ['title' => 'Praktek Lapangan',  'desc' => 'Peserta langsung mengajar dan mendapatkan supervisi.'],
                ],
                'gallery'         => [],
            ],
            [
                'name'            => 'QL - PARENTING',
                'description'     => "Bimbingan untuk orang tua dalam mendidik anak sesuai fitrah Islami.",
                'target_audience' => 'Orang tua',
                'image_url'       => '/image/landing/1 (7).png',
                'advantages'      => [
                    ['title' => 'Konsultasi Personal', 'desc' => 'Sesi konsultasi privat bersama konselor parenting.'],
                    ['title' => 'Komunitas Wali',      'desc' => 'Bergabung dengan komunitas orang tua aktif QLC.'],
                ],
                'gallery'         => [],
            ],
            [
                'name'            => 'QL - KIDS',
                'description'     => "Edukasi penanaman nilai tauhid dasar untuk usia dini.",
                'target_audience' => 'Usia 4–12',
                'image_url'       => '/image/landing/1 (8).png',
                'advantages'      => [
                    ['title' => 'Metode Bermain', 'desc' => 'Pembelajaran menyenangkan melalui permainan edukatif Islami.'],
                    ['title' => 'Hafalan Dasar',  'desc' => 'Hafalan surat-surat pendek dan doa harian.'],
                ],
                'gallery'         => [],
            ],
            [
                'name'            => 'QL - TEENS',
                'description'     => "Pembinaan karakter & kepemimpinan remaja.",
                'target_audience' => 'Usia 13–17',
                'image_url'       => '/image/landing/1 (9).png',
                'advantages'      => [
                    ['title' => 'Leadership Camp',    'desc' => 'Program camp intensif untuk mengasah jiwa kepemimpinan.'],
                    ['title' => 'Mentoring Intensif', 'desc' => 'Pendampingan langsung oleh mentor berpengalaman.'],
                ],
                'gallery'         => [],
            ],
        ];
        foreach ($programs as $p) {
            Program::create($p);
        }

        // ── Galeri ────────────────────────────────────────────
        Gallery::truncate();
        $gallery = [
            ['title' => 'Halaqah Tahfidz Pagi', 'type' => 'Photo', 'media_url' => '/image/landing/1 (6).png'],
            ['title' => 'Ujian Sertifikasi',     'type' => 'Photo', 'media_url' => '/image/landing/1 (3).png'],
            ['title' => 'Kajian & Mabit',        'type' => 'Photo', 'media_url' => '/image/landing/1 (4).png'],
            ['title' => 'Outbound Santri',       'type' => 'Photo', 'media_url' => '/image/landing/1 (5).png'],
            ['title' => 'Wisuda Hafidz',         'type' => 'Photo', 'media_url' => '/image/landing/1 (7).png'],
        ];
        foreach ($gallery as $g) {
            Gallery::create($g);
        }
    }
}
