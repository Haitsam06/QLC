<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        User::truncate();

        User::create([
            'role_id' => 'RL01',
            'username' => 'admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('admin123'),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        User::create([
            'role_id' => 'RL02',
            'username' => 'guru',
            'email' => 'guru@gmail.com',
            'password' => Hash::make('guru123'),
            'created_at' => now(),
            'updated_at' => now()
        ]);

        User::create([
            'role_id' => 'RL03',
            'username' => 'parent',
            'email' => 'parent@gmail.com',
            'password' => Hash::make('parent123'),
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}