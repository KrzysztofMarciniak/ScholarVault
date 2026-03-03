<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Role::insert([
            ["id" => Role::AUTHOR, "name" => "Author", "created_at" => now(), "updated_at" => now()],
            ["id" => Role::REVIEWER, "name" => "Reviewer", "created_at" => now(), "updated_at" => now()],
            ["id" => Role::ADMINISTRATOR, "name" => "Administrator", "created_at" => now(), "updated_at" => now()],
        ]);
    }
}
