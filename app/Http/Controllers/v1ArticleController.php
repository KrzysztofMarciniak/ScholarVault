<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\ArticleSubmitted;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class v1ArticleController extends Controller
{
    public function help(): JsonResponse
    {
        return response()->json([
            "version" => "v1",
            "endpoints" => [
                // === AUTHOR ENDPOINTS ===
                [
                    "method" => "POST",
                    "path" => "/api/v1/articles",
                    "description" => "Submit a new article (PDF or TeX file required)",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "request_body" => [
                        "title" => "string|required|max:255",
                        "abstract" => "string|required",
                        "file" => "file|required|mimes:pdf,tex",
                        "keywords" => "array|nullable",
                    ],
                    "response_code" => 201,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/my",
                    "description" => "List own articles and statuses",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/my/{id}",
                    "description" => "View own article details",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "POST",
                    "path" => "/api/v1/articles/my/{id}/revision",
                    "description" => "Submit revision after reviewer feedback",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "request_body" => [
                        "file" => "file|required|mimes:pdf,tex",
                        "notes" => "string|nullable",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/my/{id}/comments",
                    "description" => "View reviewer comments",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Array of Comment objects",
                ],

                // === REVIEWER ENDPOINTS ===
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/assigned",
                    "description" => "List assigned articles",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/assigned/{id}",
                    "description" => "View assigned article details",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "POST",
                    "path" => "/api/v1/articles/assigned/{id}/review",
                    "description" => "Submit review feedback",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "request_body" => [
                        "recommendation" => "string|required|in:accept,reject,revision_requested",
                        "comments" => "string|required",
                    ],
                    "response_code" => 200,
                    "response_data" => "Review object",
                ],

                // === ADMIN ENDPOINTS ===
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles",
                    "description" => "List all articles",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/articles/{id}/assign-reviewers",
                    "description" => "Assign reviewers to an article",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "request_body" => [
                        "reviewers" => "array|required|exists:users,id",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/articles/{id}/decision",
                    "description" => "Make final decision on an article",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "request_body" => [
                        "status" => "string|required|in:accepted,rejected,revision_requested",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/articles/{id}/publish",
                    "description" => "Publish an accepted article",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        // Validate request (file, title, abstract, optional keywords)
        $data = $request->validate([
            "title" => "required|string|max:255",
            "abstract" => "required|string",
            "file" => "required|file|mimes:pdf,tex",
            "keywords" => "array|nullable",
        ]);

        // Handle file upload
        $file = $request->file("file");
        $filename = $file->store("articles", "public"); // stored in storage/app/public/articles

        // Create article
        $article = Article::create([
            "title" => $data["title"],
            "abstract" => $data["abstract"],
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "keywords" => $data["keywords"] ?? [],
            "status" => "submission",
        ]);
        $article->authors()->attach($request->user()->id, ["is_primary" => 1]);
        event(new ArticleSubmitted($article));

        return response()->json([
            "status" => "success",
            "data" => $article,
        ], 201);
    }
}
