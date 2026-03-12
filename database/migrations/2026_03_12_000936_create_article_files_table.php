<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        Schema::create("article_files", function (Blueprint $table): void {
            $table->id();
            $table->foreignId("article_id")->constrained()->cascadeOnDelete();
            $table->foreignId("uploaded_by")->constrained("users");
            $table->string("filename");
            $table->string("file_type", 10);
            $table->integer("version_number")->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("article_files");
    }
};
