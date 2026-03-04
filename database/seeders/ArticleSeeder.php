<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Article;
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

        // Create 3 sample articles
        $articleData = [
            [
                "title" => "Quantum Computing for Beginners",
                "abstract" => "An introductory article on quantum computing concepts.",
                "filename" => "articles/qc_beginners.pdf",
                "file_type" => "pdf",
                "keywords" => ["quantum", "computing", "introduction"],
                "status" => "submission",
                "doi" => "10.1234/sv.001",
            ],
            [
                "title" => "Deep Learning in NLP",
                "abstract" => "Exploring modern deep learning approaches for natural language processing.",
                "filename" => "articles/deep_nlp.tex",
                "file_type" => "tex",
                "keywords" => ["deep learning", "NLP", "AI"],
                "status" => "under_review",
                "doi" => "10.1234/sv.002",
            ],
            [
                "title" => "Blockchain Applications in Finance",
                "abstract" => "A comprehensive study of blockchain technology in financial systems.",
                "filename" => "articles/blockchain_finance.pdf",
                "file_type" => "pdf",
                "keywords" => ["blockchain", "finance", "crypto"],
                "status" => "revision_requested",
                "doi" => "10.1234/sv.003",
            ],
        ];

        foreach ($articleData as $i => $data) {
            $article = Article::create($data);

            // Attach random authors (1-3 authors per article)
            $authorIds = $authors->random(rand(1, 3))->pluck("id")->toArray();
            $article->authors()->attach($authorIds, ["is_primary" => true]);

            // Optional: add a citation to previous article (if exists)
            if ($i > 0) {
                $article->citations()->attach(Article::find($i)->id);
            }
        }
    }
}
