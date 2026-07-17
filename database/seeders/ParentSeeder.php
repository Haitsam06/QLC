<?php

namespace Database\Seeders;

use App\Models\Parents;
use App\Models\User;
use Illuminate\Database\Seeder;

class ParentSeeder extends Seeder
{
    public function run(): void
    {
        Parents::truncate();

        $profiles = [
            ['parent_name' => 'Budi Santoso', 'phone' => '082100001111', 'address' => 'Jl. Mawar No. 1, Bekasi',    'email' => 'wali1@qlc.id'],
            ['parent_name' => 'Sri Wahyuni',  'phone' => '082100002222', 'address' => 'Jl. Melati No. 5, Bekasi',   'email' => 'wali2@qlc.id'],
            ['parent_name' => 'Ahmad Mukhlas', 'phone' => '082100003333', 'address' => 'Jl. Anggrek No. 10, Depok',   'email' => 'wali3@qlc.id'],
            ['parent_name' => 'Dewi Rahayu',  'phone' => '082100004444', 'address' => 'Jl. Kenanga No. 3, Bogor',    'email' => 'wali4@qlc.id'],
            ['parent_name' => 'Eko Prasetyo', 'phone' => '082100005555', 'address' => 'Jl. Dahlia No. 7, Tangerang', 'email' => 'wali5@qlc.id'],
            ['parent_name' => 'Hadi Prabowo', 'phone' => '082100006666', 'address' => 'Jl. Kamboja No. 9, Jakarta',   'email' => 'wali6@qlc.id'],
            ['parent_name' => 'Yuni Lestari', 'phone' => '082100007777', 'address' => 'Jl. Cempaka No. 12, Bekasi',   'email' => 'wali7@qlc.id'],
            ['parent_name' => 'Rahmat Hidayat', 'phone' => '082100008888', 'address' => 'Jl. Flamboyan No. 2, Depok',  'email' => 'wali8@qlc.id'],
        ];

        $users = User::where('role_id', 'RL03')->get()->keyBy('email');

        foreach ($profiles as $p) {
            $user = $users[$p['email']] ?? null;
            Parents::create([
                'user_id'     => $user ? (string) $user->_id : null,
                'parent_name' => $p['parent_name'],
                'phone'       => $p['phone'],
                'address'     => $p['address'],
            ]);
        }

        $this->command->info('ParentSeeder: Data wali murid berhasil di-seed.');
    }
}
