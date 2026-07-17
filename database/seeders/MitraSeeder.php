<?php

namespace Database\Seeders;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Seeder;

class MitraSeeder extends Seeder
{
    public function run(): void
    {
        Partner::truncate();

        $profiles = [
            ['institution_name' => 'Yayasan Al-Ilmi Bekasi',      'contact_person' => 'Dr. Hendra Kusuma', 'phone' => '02112300001', 'status' => 'Active',   'email' => 'mitra1@qlc.id'],
            ['institution_name' => 'Pondok Pesantren Nurul Huda',  'contact_person' => 'K.H. Mahmud Hasyim', 'phone' => '02112300002', 'status' => 'Active',   'email' => 'mitra2@qlc.id'],
            ['institution_name' => 'CV. Berkah Mandiri Sejahtera', 'contact_person' => 'Ir. Reza Firmansyah', 'phone' => '02112300003', 'status' => 'Inactive', 'email' => 'mitra3@qlc.id'],
            ['institution_name' => 'Lembaga Pendidikan Al-Hikmah', 'contact_person' => 'Drs. H. Mulyadi',   'phone' => '02112300004', 'status' => 'Active',   'email' => 'mitra4@qlc.id'],
            ['institution_name' => 'Yayasan Darul Qur\'an Mulia',  'contact_person' => 'Ust. Yusuf Rahman', 'phone' => '02112300005', 'status' => 'Active',   'email' => 'mitra5@qlc.id'],
            ['institution_name' => 'PT. Edukasi Bangsa Utama',     'contact_person' => 'Santi Rahmawati',   'phone' => '02112300006', 'status' => 'Active',   'email' => 'mitra6@qlc.id'],
            ['institution_name' => 'Yayasan Bina Umat Bekasi',    'contact_person' => 'Dian Wijaya, M.Pd', 'phone' => '02112300007', 'status' => 'Inactive', 'email' => 'mitra7@qlc.id'],
            ['institution_name' => 'CV. Qur\'an Tech Solusindo',   'contact_person' => 'Hafiz Prasetyo',    'phone' => '02112300008', 'status' => 'Active',   'email' => 'mitra8@qlc.id'],
        ];

        $users = User::where('role_id', 'RL04')->get()->keyBy('email');

        foreach ($profiles as $p) {
            $user = $users[$p['email']] ?? null;
            Partner::create([
                'user_id'          => $user ? (string) $user->_id : null,
                'institution_name' => $p['institution_name'],
                'contact_person'   => $p['contact_person'],
                'phone'            => $p['phone'],
                'status'           => $p['status'],
                'mou_file_url'     => null,
            ]);
        }

        $this->command->info('MitraSeeder: Data mitra berhasil di-seed.');
    }
}
