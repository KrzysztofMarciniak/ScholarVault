<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("article_reviewer", function (Blueprint $table): void {
            $table->id();
            $table->foreignId("article_id")->constrained("articles")->cascadeOnDelete();
            $table->foreignId("user_id")->constrained("users")->cascadeOnDelete();
            $table->timestamps();

            $table->unique(["article_id", "user_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("article_reviewer");
    }
};
