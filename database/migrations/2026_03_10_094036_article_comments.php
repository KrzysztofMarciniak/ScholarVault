<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("article_comments", function (Blueprint $table): void {
            $table->id();

            $table->foreignId("article_id")
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId("user_id")
                ->constrained()
                ->cascadeOnDelete();

            $table->text("comment");

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("article_comments");
    }
};
