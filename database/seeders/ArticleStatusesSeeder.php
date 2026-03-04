<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ArticleStatus;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ArticleStatusesSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [];

        foreach (ArticleStatus::cases() as $case) {
            $rows[] = [
                "id" => $case->value,
                "name" => strtolower($case->name),
                "created_at" => now(),
                "updated_at" => now(),
            ];
        }

        DB::table("article_statuses")->insert($rows);
    }
}
