<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("citations", function (Blueprint $table): void {
            $table->id();
            $table->foreignId("article_id")->constrained("articles")->cascadeOnDelete();
            $table->string("title");
            $table->string("authors")->nullable();
            $table->string("doi")->nullable();
            $table->string("url")->nullable();
            $table->timestamp("published_at")->nullable();
            $table->enum("availability_status", ["on_site", "external_link", "doi_only"])->default("doi_only");
            $table->string("on_site_path")->nullable();
            $table->timestamps();
        });
        Schema::dropIfExists("article_citation");
    }

    public function down(): void
    {
        Schema::dropIfExists("citations");
    }
};
