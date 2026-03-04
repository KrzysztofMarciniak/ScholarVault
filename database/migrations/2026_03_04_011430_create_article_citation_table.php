<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("article_citation", function (Blueprint $table): void {
            $table->id();
            $table->foreignId("article_id")->constrained("articles")->cascadeOnDelete();
            $table->foreignId("cited_article_id")->constrained("articles")->cascadeOnDelete();
            $table->timestamps();
            $table->unique(["article_id", "cited_article_id"]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("article_citation");
    }
};
