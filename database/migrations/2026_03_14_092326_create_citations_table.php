<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("article_citation_pivot", function (Blueprint $table): void {
            $table->id();
            $table->foreignId("article_id")->constrained()->onDelete("cascade");
            $table->foreignId("citation_id")->constrained()->onDelete("cascade");
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("citations");
    }
};
