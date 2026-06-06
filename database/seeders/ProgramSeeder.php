<?php

namespace Database\Seeders;

use App\Models\Program;
use Illuminate\Database\Seeder;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        Program::truncate();

        $programs = [
            // ─────────────────────────────────────────────────────────
            // QL-SCHOOL
            // ─────────────────────────────────────────────────────────
            [
                'name'            => 'QL-SCHOOL',
                'description'     => "Program pendidikan berbasis Qur'an untuk anak usia sekolah dengan pendekatan holistik yang memadukan hafalan Al-Qur'an, pembentukan akhlak, dan prestasi akademik.",
                'target_audience' => 'Anak usia sekolah (SD–SMP)',
                'image_url'       => null,
                'hero_image_url'  => null,
                'about_image_url' => null,
                'advantages'      => [
                    [
                        'title' => "Hafalan Qur'an Bersanad",
                        'desc'  => "Membimbing siswa menghafal Al-Qur'an dengan metode terstruktur dan bersanad terpercaya.",
                    ],
                    [
                        'title' => 'Pembentukan Akhlak Mulia',
                        'desc'  => "Menanamkan nilai-nilai Islami dan akhlaqul karimah sejak usia sekolah.",
                    ],
                    [
                        'title' => 'Prestasi Akademik',
                        'desc'  => "Mendukung pencapaian akademik siswa melalui pendekatan integral berbasis Qur'an.",
                    ],
                ],
                'gallery'         => [],
            ],

            // ─────────────────────────────────────────────────────────
            // QL-TFT  (Train For Trainer)
            // ─────────────────────────────────────────────────────────
            [
                'name'            => 'QL-TFT (Train For Trainer)',
                'description'     => "Mencetak para Trainer Qur'an berbasis 5 Pillar inti Pribadi Muslim melalui Training, Coaching, Workshop Qur'an dengan tujuan Hafidz Qur'an 30 Juz bersanad.",
                'target_audience' => 'Dewasa (18 tahun ke atas)',
                'image_url'       => null,
                'hero_image_url'  => null,
                'about_image_url' => null,
                'advantages'      => [
                    [
                        'title' => 'Berbasis 5 Pillar',
                        'desc'  => "Kurikulum berlandaskan 5 Pillar inti Pribadi Muslim: Kuat, Taat, Sehat, Hebat, Manfaat.",
                    ],
                    [
                        'title' => 'Training, Coaching & Workshop',
                        'desc'  => "Metode pembelajaran variatif: training intensif, coaching personal, dan workshop praktis.",
                    ],
                    [
                        'title' => "Target Hafidz Qur'an 30 Juz Bersanad",
                        'desc'  => "Peserta dibimbing hingga mencapai hafalan 30 Juz dengan sanad yang terpercaya.",
                    ],
                    [
                        'title' => 'Sertifikasi Trainer',
                        'desc'  => "Lulusan mendapatkan sertifikat resmi sebagai Trainer Qur'an yang diakui.",
                    ],
                ],
                'gallery'         => [],
            ],

            // ─────────────────────────────────────────────────────────
            // QL-PARENTING  (Islamic Parenting)
            // ─────────────────────────────────────────────────────────
            [
                'name'            => 'QL-PARENTING (Islamic Parenting)',
                'description'     => "Memberikan Workshop Pendidikan Parenting Qur'an berbasis 5 Pillar inti Pribadi Muslim tujuannya agar para AYAH dan BUNDA mengerti cara mendidik, berkomunikasi, dan mengarahkan anak-anaknya melalui Qur'an.",
                'target_audience' => 'Orang tua (Ayah & Bunda)',
                'image_url'       => null,
                'hero_image_url'  => null,
                'about_image_url' => null,
                'advantages'      => [
                    [
                        'title' => 'Workshop Parenting Qur\'ani',
                        'desc'  => "Materi parenting islami yang praktis dan aplikatif untuk kehidupan sehari-hari.",
                    ],
                    [
                        'title' => 'Panduan Mendidik Anak',
                        'desc'  => "Teknik mendidik anak sesuai fitrah Islami agar tumbuh menjadi generasi Qur'ani.",
                    ],
                    [
                        'title' => 'Komunikasi Efektif Orang Tua & Anak',
                        'desc'  => "Membangun pola komunikasi yang sehat dan penuh kasih sayang berlandaskan Al-Qur\'an.",
                    ],
                    [
                        'title' => 'Komunitas Orang Tua Aktif',
                        'desc'  => "Bergabung dalam komunitas Ayah-Bunda QLC untuk saling mendukung dan berbagi.",
                    ],
                ],
                'gallery'         => [],
            ],

            // ─────────────────────────────────────────────────────────
            // QL-FAMILY
            // ─────────────────────────────────────────────────────────
            [
                'name'            => 'QL-FAMILY',
                'description'     => "Program pembinaan keluarga Islami berbasis Al-Qur'an untuk mewujudkan keluarga yang sakinah, mawaddah, dan rahmah melalui pemahaman dan pengamalan nilai-nilai Qur'ani dalam kehidupan rumah tangga.",
                'target_audience' => 'Keluarga Muslim (Suami & Istri)',
                'image_url'       => null,
                'hero_image_url'  => null,
                'about_image_url' => null,
                'advantages'      => [
                    [
                        'title' => 'Keluarga Sakinah Mawaddah Rahmah',
                        'desc'  => "Membimbing pasangan suami-istri membangun rumah tangga yang harmonis berlandaskan Al-Qur\'an.",
                    ],
                    [
                        'title' => 'Manajemen Konflik Islami',
                        'desc'  => "Teknik menyelesaikan perbedaan dan konflik rumah tangga dengan cara yang Islami.",
                    ],
                    [
                        'title' => 'Perencanaan Keluarga Qur\'ani',
                        'desc'  => "Panduan merencanakan kehidupan keluarga sesuai tuntunan Al-Qur\'an dan Sunnah.",
                    ],
                ],
                'gallery'         => [],
            ],

            // ─────────────────────────────────────────────────────────
            // QL-KIDS
            // ─────────────────────────────────────────────────────────
            [
                'name'            => 'QL-KIDS',
                'description'     => "Program pembekalan anak-anak dengan nilai-nilai Qur'ani sejak dini melalui Training, Coaching, dan Workshop yang menyenangkan, dengan tujuan Hafidz Qur'an bersanad serta menggali seluruh potensi anak dalam bidang prestasi Akademik maupun Akhlaqul Karimahnya.",
                'target_audience' => 'Anak-anak (usia 5–12 tahun)',
                'image_url'       => null,
                'hero_image_url'  => null,
                'about_image_url' => null,
                'advantages'      => [
                    [
                        'title' => 'Hafalan Qur\'an Sejak Dini',
                        'desc'  => "Membimbing anak menghafal Al-Qur\'an dengan metode menyenangkan dan bersanad.",
                    ],
                    [
                        'title' => 'Metode Bermain Edukatif',
                        'desc'  => "Pembelajaran berbasis permainan yang dirancang sesuai tumbuh kembang anak.",
                    ],
                    [
                        'title' => 'Pembentukan Akhlaqul Karimah',
                        'desc'  => "Menanamkan karakter mulia sejak usia dini melalui keteladanan dan pembiasaan.",
                    ],
                    [
                        'title' => 'Pengembangan Potensi Akademik',
                        'desc'  => "Mendukung prestasi akademik anak melalui pendekatan integral berbasis Qur\'an.",
                    ],
                ],
                'gallery'         => [],
            ],

            // ─────────────────────────────────────────────────────────
            // QL-TEENS
            // ─────────────────────────────────────────────────────────
            [
                'name'            => 'QL-TEENS',
                'description'     => "Pembekalan untuk remaja Muslim melalui Training, Coaching, Workshop Qur'an dengan tujuan Hafidz Qur'an bersanad, menggali seluruh potensinya baik dalam bidang prestasi Akademik maupun Akhlaqul Karimahnya.",
                'target_audience' => 'Remaja (usia 13–17 tahun)',
                'image_url'       => null,
                'hero_image_url'  => null,
                'about_image_url' => null,
                'advantages'      => [
                    [
                        'title' => 'Hafidz Qur\'an Bersanad',
                        'desc'  => "Program tahfidz intensif untuk remaja dengan bimbingan hafidz bersanad terpercaya.",
                    ],
                    [
                        'title' => 'Pengembangan Potensi & Prestasi',
                        'desc'  => "Menggali dan mengoptimalkan potensi remaja dalam bidang akademik dan non-akademik.",
                    ],
                    [
                        'title' => 'Pembinaan Akhlaqul Karimah',
                        'desc'  => "Membentuk karakter remaja yang berakhlak mulia dan berjiwa pemimpin Qur\'ani.",
                    ],
                    [
                        'title' => 'Leadership & Mentoring',
                        'desc'  => "Pendampingan langsung oleh mentor berpengalaman untuk mengasah jiwa kepemimpinan.",
                    ],
                ],
                'gallery'         => [],
            ],
        ];

        foreach ($programs as $program) {
            Program::create($program);
        }

        $this->command->info('ProgramSeeder: ' . count($programs) . ' program berhasil di-seed.');
    }
}
