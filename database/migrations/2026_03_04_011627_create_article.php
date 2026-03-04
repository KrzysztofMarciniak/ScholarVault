<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("articles", function (Blueprint $table): void {
            $table->id();

            // Main metadata
            $table->string("title");
            $table->text("abstract");

            // File storage
            $table->string("filename");           // stored file path
            $table->enum("file_type", ["pdf", "tex"]);

            // Keywords and DOI
            $table->json("keywords")->nullable();
            $table->string("doi")->nullable()->unique();

            // Lifecycle status
            $table->enum("status", [
                "submission",
                "under_review",
                "revision_requested",
                "accepted",
                "rejected",
                "published",
            ])->default("submission");

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("article");
    }
};
