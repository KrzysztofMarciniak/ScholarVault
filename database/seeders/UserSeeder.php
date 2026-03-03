<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::insert([
            [
                'name' => 'Admin',
                'email' => 'admin@example.com',
                'password' => bcrypt('admin'),
                'role_id' => Role::ADMINISTRATOR,
                'affiliation' => null,
                'orcid' => null,
                'bio' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Reviewer',
                'email' => 'reviewer@example.com',
                'password' => bcrypt('reviewer'),
                'role_id' => Role::REVIEWER,
                'affiliation' => null,
                'orcid' => null,
                'bio' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Author',
                'email' => 'author@example.com',
                'password' => bcrypt('author'),
                'role_id' => Role::AUTHOR,
                'affiliation' => null,
                'orcid' => null,
                'bio' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
