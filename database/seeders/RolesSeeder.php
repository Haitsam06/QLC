<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        Role::create([
            '_id' => 'RL01',
            'role_name' => 'admin'
        ]);

        Role::create([
            '_id' => 'RL02',
            'role_name' => 'teacher'
        ]);

        Role::create([
            '_id' => 'RL03',
            'role_name' => 'parents'
        ]);
    }
}