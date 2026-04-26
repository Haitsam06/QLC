<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;

class LandingPageSeeder extends Seeder
{
    public function run()
    {
        // Ambil koneksi MongoDB
        $db = DB::connection('mongodb')->getMongoClient()->selectDatabase(env('MONGODB_DATABASE', 'educonnect'));

        // 1. SEED PROFIL (Termasuk Kontak & Media Sosial)
        $db->selectCollection('profiles')->deleteMany([]);
        $db->selectCollection('profiles')->insertOne([
            'name' => 'Pejuang Quran',
            'hero_title' => 'Membangun Generasi Rabbani bersama',
            'tagline' => 'Pusat pembelajaran komprehensif (QLC) yang berdedikasi mencetak pemimpin masa depan dengan kurikulum terpadu dan sistem pelaporan mutakhir.',
            'history' => "Menjawab kerinduan dan tingginya antusiasme umat untuk kembali kepada Al-Qur'an, Qur’anic Leadership Centre (QLC) hadir memberikan bimbingan pengajaran secara komprehensif. Kami membina santri tidak hanya untuk menghafal, tetapi juga memahami (terjemah), merenungi (tadabur), dan mengaplikasikan nilai-nilai Al-Qur'an.",
            'established_year' => '21 Juni 2016',
            'main_focus' => 'Pengembangan SDM',
            'vision' => "\"Menjadi salah satu LEMBAGA PENDIDIKAN QUR'AN UNGGULAN yang mencetak para PEMIMPIN / LEADER berdasarkan Al Qur'an dan Sunnah.\"",
            'mission' => "Mencetak pribadi yang KOKOH/KUAT Aqidahnya.\nMencetak pribadi yang TAAT Menjalankan perintah Allah SWT dan beribadah sesuai dengan tuntunan Rasulullah SAW.\nMencetak pribadi yang sehat jiwa, raga dan muamalahnya.\nMencetak pribadi yang mengikuti teladan orang-orang HEBAT dari Zaman Rasulullah SAW, Sahabat, Tabiin, Tabiut Tabiin dan Ilmuan Islam.\nMencetak pribadi yang BERMANFAAT bagi orang lain.",

            // --- DATA KONTAK & SOSIAL MEDIA BARU ---
            'address' => 'Jl. Pendidikan Islam No. 1, Kota Bekasi, Jawa Barat 17111',
            'whatsapp' => '+6281234567890',
            'email' => 'info@pejuangquran.com',
            'social_media' => [
                'instagram' => 'https://instagram.com/pejuangquran',
                'facebook' => 'https://facebook.com/pejuangquran',
                'youtube' => 'https://youtube.com/@pejuangquran',
            ],
            // ---------------------------------------

            'created_at' => new UTCDateTime(),
            'updated_at' => new UTCDateTime(),
        ]);

        // 2. SEED PILAR (FOUNDATIONS)
        $db->selectCollection('foundations')->deleteMany([]);
        $db->selectCollection('foundations')->insertMany([
            ['title' => 'PRIBADI KUAT', 'description' => 'Kuat secara AQIDAH Islamiyah mencakup keimanan kepada rukun iman.'],
            ['title' => 'PRIBADI TAAT', 'description' => 'Taat menjalankan SYARIAT Islam melingkupi pengamalan 5 Rukun Islam.'],
            ['title' => 'PRIBADI SEHAT', 'description' => 'Sehat secara Jiwa (Ruhiyah), Jasadiyah, Aqliyah, dan Muamalah.'],
            ['title' => 'PRIBADI HEBAT', 'description' => 'Mendalami sejarah dan mengambil teladan dari para Nabi dan Ulama.'],
            ['title' => 'PRIBADI MANFAAT', 'description' => 'Menggali potensi anak sesuai fitrahnya untuk mengejar cita-cita.']
        ]);

        // 3. SEED PENGURUS (LEADERS)
        $db->selectCollection('leaders')->deleteMany([]);
        $db->selectCollection('leaders')->insertMany([
            ['nama' => "Ainun Na'im Al-Hafidh", 'jabatan' => "Ketua Yayasan Pejuang Qur'an Indonesia", 'poin' => "Hafidh Qur'an 30 Juz Bersanad\nMaster Trainer Metode Yanbu'a", 'image_url' => '/image/landing/1 (2).png'],
            ['nama' => 'Mushadi Sumaryanto', 'jabatan' => 'Direktur Program QLC', 'poin' => "Hafidh 30 Juz 42 Hari Ziyadah\nMaster Trainer Metode Tamasya", 'image_url' => '/image/landing/1 (3).png'],
            ['nama' => 'K.H. Supriyatno, M.Pd.I', 'jabatan' => 'General Manager QLC', 'poin' => "Dosen\nKonsultan Lembaga Pendidikan\nDa'i dan Motivator", 'image_url' => '/image/landing/1 (4).png'],
        ]);

        // 4. SEED PROGRAM
        $db->selectCollection('programs')->deleteMany([]);
        $db->selectCollection('programs')->insertMany([
            ['name' => 'QL - SCHOOL', 'description' => "Program pendidikan berkesinambungan terpadu berbasis Al-Qur'an.", 'image_url' => '/image/landing/1 (5).png'],
            ['name' => 'QL - TFT', 'description' => "Training for Trainers. Pelatihan intensif mencetak instruktur.", 'image_url' => '/image/landing/1 (6).png'],
            ['name' => 'QL - PARENTING', 'description' => "Bimbingan untuk orang tua dalam mendidik anak sesuai fitrah.", 'image_url' => '/image/landing/1 (7).png'],
            ['name' => 'QL - KIDS', 'description' => "Edukasi penanaman nilai tauhid dasar untuk usia dini.", 'image_url' => '/image/landing/1 (8).png'],
            ['name' => 'QL - TEENS', 'description' => "Pembinaan karakter & kepemimpinan remaja.", 'image_url' => '/image/landing/1 (9).png'],
            ['name' => 'QL - TEACHER', 'description' => "Pengembangan kapasitas profesionalisme guru.", 'image_url' => '/image/landing/1 (9).png'],
        ]);

        // 5. SEED GALERI
        $db->selectCollection('gallery')->deleteMany([]);
        $db->selectCollection('gallery')->insertMany([
            ['title' => 'Halaqah Tahfidz Pagi', 'type' => 'Photo', 'media_url' => '/image/landing/1 (6).png', 'uploaded_at' => new UTCDateTime()],
            ['title' => 'Ujian Sertifikasi', 'type' => 'Photo', 'media_url' => '/image/landing/1 (3).png', 'uploaded_at' => new UTCDateTime()],
            ['title' => 'Kajian & Mabit', 'type' => 'Photo', 'media_url' => '/image/landing/1 (4).png', 'uploaded_at' => new UTCDateTime()],
            ['title' => 'Outbound Santri', 'type' => 'Photo', 'media_url' => '/image/landing/1 (5).png', 'uploaded_at' => new UTCDateTime()],
        ]);
    }
}