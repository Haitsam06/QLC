<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            UsersSeeder::class,
            LandingPageSeeder::class,
            TeacherSeeder::class,
            ParentSeeder::class,
            MitraSeeder::class,
            StudentSeeder::class,
            AgendaSeeder::class,
            ProgressReportSeeder::class,
            MitraReportSeeder::class,
        ]);
    }
}