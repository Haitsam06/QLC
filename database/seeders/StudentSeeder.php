<?php

namespace Database\Seeders;

use App\Models\Parents;
use App\Models\Program;
use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        Student::truncate();

        $parents = Parents::orderBy('parent_name')->get();
        $program = Program::where('name', 'QL-SCHOOL')->first();

        if ($parents->isEmpty() || !$program) {
            $this->command->warn('StudentSeeder: data parent atau program QL-SCHOOL belum ada, skip.');
            return;
        }

        $data = [
            [
                'nama'              => 'Rizky Al-Faruq',
                'tempat_lahir'      => 'Jakarta',
                'tanggal_lahir'     => '2015-03-12',
                'usia'              => 10,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali1@qlc.id',
            ],
            [
                'nama'              => 'Nadia Putri Salsabila',
                'tempat_lahir'      => 'Bekasi',
                'tanggal_lahir'     => '2016-07-25',
                'usia'              => 9,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali2@qlc.id',
            ],
            [
                'nama'              => 'Muhammad Hafiz Firdaus',
                'tempat_lahir'      => 'Depok',
                'tanggal_lahir'     => '2014-11-08',
                'usia'              => 11,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali3@qlc.id',
            ],
            [
                'nama'              => 'Fatimah Az-Zahra',
                'tempat_lahir'      => 'Bogor',
                'tanggal_lahir'     => '2016-02-14',
                'usia'              => 9,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali4@qlc.id',
            ],
            [
                'nama'              => 'Umar Abdillah Hakim',
                'tempat_lahir'      => 'Tangerang',
                'tanggal_lahir'     => '2015-09-30',
                'usia'              => 10,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali5@qlc.id',
            ],
            [
                'nama'              => 'Aisyah Humaira',
                'tempat_lahir'      => 'Jakarta',
                'tanggal_lahir'     => '2016-12-05',
                'usia'              => 9,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali6@qlc.id',
            ],
            [
                'nama'              => 'Ali Zainal Abidin',
                'tempat_lahir'      => 'Bekasi',
                'tanggal_lahir'     => '2015-05-18',
                'usia'              => 11,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali7@qlc.id',
            ],
            [
                'nama'              => 'Khadijah Al-Kubra',
                'tempat_lahir'      => 'Depok',
                'tanggal_lahir'     => '2014-10-22',
                'usia'              => 11,
                'enrollment_status' => 'active',
                'parent_email'      => 'wali8@qlc.id',
            ],
        ];

        $users = \App\Models\User::where('role_id', 'RL03')->get()->keyBy('email');

        foreach ($data as $s) {
            $user = $users[$s['parent_email']] ?? null;
            if (!$user) {
                continue;
            }
            
            $parent = $parents->where('user_id', (string) $user->_id)->first();
            if (!$parent) {
                continue;
            }

            Student::create([
                'parent_id'         => (string) $parent->user_id,
                'parent_name'       => $parent->parent_name,
                'program_id'        => (string) $program->_id,
                'nama'              => $s['nama'],
                'tempat_lahir'      => $s['tempat_lahir'],
                'tanggal_lahir'     => $s['tanggal_lahir'],
                'usia'              => $s['usia'],
                'enrollment_status' => $s['enrollment_status'],
                'bukti_pembayaran'  => null,
            ]);
        }

        $this->command->info('StudentSeeder: Data siswa program QL-SCHOOL berhasil di-seed.');
    }
}
