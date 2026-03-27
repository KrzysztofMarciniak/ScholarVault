<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Citation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ArticleSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure articles storage folder exists
        Storage::makeDirectory("articles");

        // Pick some users as authors
        $authors = User::take(5)->get(); // first 5 users

        // Create sample articles
        $articleData = [
            [
                "title" => "Quantum Computing for Beginners",
                "abstract" => "An introductory article on quantum computing concepts.",
                "filename" => "articles/qc_beginners.pdf",
                "file_type" => "pdf",
                "keywords" => ["quantum", "computing", "introduction"],
                "status_id" => ArticleStatus::SUBMITTED->value,
                "doi" => "10.1234/sv.001",
            ],
            [
                "title" => "Deep Learning in NLP",
                "abstract" => "Exploring modern deep learning approaches for natural language processing.",
                "filename" => "articles/deep_nlp.tex",
                "file_type" => "tex",
                "keywords" => ["deep learning", "NLP", "AI"],
                "status_id" => ArticleStatus::UNDER_REVIEW->value,
                "doi" => "10.1234/sv.002",
            ],
            [
                "title" => "Blockchain Applications in Finance",
                "abstract" => "A comprehensive study of blockchain technology in financial systems.",
                "filename" => "articles/blockchain_finance.pdf",
                "file_type" => "pdf",
                "keywords" => ["blockchain", "finance", "crypto"],
                "status_id" => ArticleStatus::REVISION_REQUIRED->value,
                "doi" => "10.1234/sv.003",
            ],
        ];

        foreach ($articleData as $i => $data) {
            // Create article
            $article = Article::create($data);

            // Attach 1-3 random authors, mark first as primary
            $selectedAuthors = $authors->random(rand(1, 3));
            $first = true;

            foreach ($selectedAuthors as $author) {
                $article->authors()->attach($author->id, [
                    "is_primary" => $first,
                ]);
                $first = false;
            }

            Citation::create([
                "title" => "Sample External Citation for {$article->title}",
                "authors" => "Doe, John",
                "doi" => "10.1000/sample.{$i}",
                "url" => "https://example.com/citation/{$i}",
                "availability_status" => "external_link",
                "article_id" => $article->id,
            ]);
        }
    }
}
