<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("reviews", function (Blueprint $table): void {
            $table->id();
            $table->foreignId("article_id")->constrained()->cascadeOnDelete();
            $table->foreignId("reviewer_id")->constrained("users")->cascadeOnDelete();
            $table->text("comments");
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("reviews");
    }
};
