<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("article_statuses", function (Blueprint $table): void {
            $table->id();
            $table->string("name")->unique();
            $table->timestamps();
        });

        Schema::table("articles", function (Blueprint $table): void {
            $table->foreignId("status_id")->default(1)->constrained("article_statuses");
        });
    }

    public function down(): void
    {
        Schema::table("articles", function (Blueprint $table): void {
            $table->dropForeign(["status_id"]);
            $table->dropColumn("status_id");
        });

        Schema::dropIfExists("article_statuses");
    }
};
