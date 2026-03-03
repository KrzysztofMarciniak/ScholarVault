<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::insert([
            ['id' => Role::AUTHOR, 'name' => 'Author', 'created_at' => now(), 'updated_at' => now()],
            ['id' => Role::REVIEWER, 'name' => 'Reviewer', 'created_at' => now(), 'updated_at' => now()],
            ['id' => Role::ADMINISTRATOR, 'name' => 'Administrator', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
