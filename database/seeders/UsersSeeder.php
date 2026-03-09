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
    }
}