<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use App\Services\Article\AuthorArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1AuthorArticleController extends v1Controller
{
    public function help(ApiDocsService $docs): JsonResponse
    {
        $docs->addEndpoints([
            [
                "method" => "POST",
                "path" => "/api/v1/articles/submit",
                "description" => "Submit a new article (PDF or TeX file required)",
                "roles" => ["author"],
                "request_body" => [
                    "title" => "string|required|max:255",
                    "abstract" => "string|required",
                    "file" => "file|required|mimes:pdf,tex",
                    "keywords" => "array|nullable",
                ],
                "query_params" => [],
                "response_code" => 201,
                "response_data" => "Article object",
                "available" => true,
            ],
            [
                "method" => "GET",
                "path" => "/api/v1/articles/my",
                "description" => "List own articles and statuses (paginated)",
                "roles" => ["author"],
                "request_body" => [],
                "query_params" => [],
                "response_code" => 200,
                "response_data" => [
                    "data" => [
                        [
                            "id" => "integer",
                            "title" => "string",
                            "abstract" => "string",
                            "doi" => "string|null",
                            "status" => "string",
                        ],
                    ],
                    "pagination" => [
                        "current_page" => "integer",
                        "per_page" => "integer",
                        "total" => "integer",
                        "last_page" => "integer",
                    ],
                ],
                "available" => true,
            ],
            [
                "method" => "GET",
                "path" => "/api/v1/articles/my/{id}",
                "description" => "View details of an authored article",
                "roles" => ["author"],
                "request_body" => [],
                "query_params" => [],
                "response_code" => 200,
                "response_data" => [
                    "id" => "integer",
                    "title" => "string",
                    "abstract" => "string",
                    "filename" => "string",
                    "file_type" => "string",
                    "keywords" => "array",
                    "status" => "string",
                    "doi" => "string",
                    "authors" => [
                        [
                            "name" => "string",
                            "orcid" => "string|null",
                            "is_primary" => "boolean",
                        ],
                    ],
                    "citations" => [
                        [
                            "id" => "integer",
                            "title" => "string",
                            "doi" => "string",
                        ],
                    ],
                ],
                "available" => true,
            ],
            [
                "method" => "POST",
                "path" => "/api/v1/articles/my/{id}/revision",
                "description" => "Submit revision after reviewer feedback",
                "roles" => ["author"],
                "request_body" => [
                    "file" => "file|required|mimes:pdf,tex",
                    "notes" => "string|nullable",
                ],
                "query_params" => [],
                "response_code" => 200,
                "response_data" => "Article object",
                "available" => false,
            ],
            [
                "method" => "GET",
                "path" => "/api/v1/articles/my/{id}/comments",
                "description" => "View comment discussion between authors and reviewers",
                "roles" => ["author", "reviewer"],
                "request_body" => [],
                "query_params" => [],
                "response_code" => 200,
                "response_data" => [
                    [
                        "id" => "integer",
                        "user" => "string",
                        "comment" => "string",
                        "created_at" => "timestamp",
                    ],
                ],
                "available" => true,
            ],
            [
                "method" => "POST",
                "path" => "/api/v1/articles/my/{id}/comments",
                "description" => "Add a comment to an article discussion thread",
                "roles" => ["author", "reviewer"],
                "request_body" => [
                    "comment" => "string|required",
                ],
                "query_params" => [],
                "response_code" => 201,
                "response_data" => [
                    "id" => "integer",
                    "user" => "string",
                    "comment" => "string",
                    "created_at" => "timestamp",
                ],
                "available" => true,
            ],
            [
                "method" => "GET",
                "path" => "/api/v1/articles/my/{id}/comments",
                "description" => "View comment discussion between authors and reviewers",
                "roles" => ["author", "reviewer"],
                "request_body" => [],
                "query_params" => [],
                "response_code" => 200,
                "response_data" => [
                    [
                        "id" => "integer",
                        "user" => "string",
                        "comment" => "string",
                        "created_at" => "timestamp",
                    ],
                ],
                "available" => true,
            ],
        ]);

        return response()->json([
            "message" => "Author Article usage instructions",
            "endpoints" => $docs->getEndpoints(),
        ]);
    }

    public function store(
        Request $request,
        AuthorArticleService $service,
    ): JsonResponse {
        $data = $request->validate([
            "title" => "required|string|max:255",
            "abstract" => "required|string",
            "file" => "required|file|mimes:pdf,tex",
            "keywords" => "array|nullable",
        ]);

        $article = $service->submitArticle(
            $request->user()->id,
            $data["title"],
            $data["abstract"],
            $request->file("file"),
            $data["keywords"] ?? null,
        );

        return response()->json([
            "status" => "success",
            "data" => $article,
        ], 201);
    }

    public function myArticles(Request $request, AuthorArticleService $service): JsonResponse
    {
        $authorId = $request->user("sanctum")->id;
        $perPage = (int)$request->query("per_page", 10);

        $articles = $service->listMyArticles($authorId, $perPage);

        $data = $articles->map(fn($article) => [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "doi" => $article->doi,
            "status" => $article->status->name ?? null,
        ]);

        return response()->json([
            "status" => "success",
            "data" => $data,
            "pagination" => [
                "current_page" => $articles->currentPage(),
                "per_page" => $articles->perPage(),
                "total" => $articles->total(),
                "last_page" => $articles->lastPage(),
            ],
        ]);
    }

    public function myArticle(Request $request, int $id, AuthorArticleService $service): JsonResponse
    {
        $authorId = $request->user()->id;

        $article = $service->viewMyArticle($authorId, $id);

        if ($article === null) {
            return response()->json([
                "message" => "Article not found or you do not have access.",
            ], 404);
        }

        return response()->json($article, 200);
    }

    public function listComments(Request $request, int $id, AuthorArticleService $commentsService): JsonResponse
    {
        $comments = $commentsService->listComments($id, $request->user()->id);

        return response()->json(
            $comments->map(fn($c) => [
                "id" => $c->id,
                "user" => $c->user->name,
                "comment" => $c->comment,
                "created_at" => $c->created_at,
            ]),
        );
    }

    public function addComment(Request $request, int $id, AuthorArticleService $commentsService): JsonResponse
    {
        $request->validate([
            "comment" => "required|string|max:5000",
        ]);

        $comment = $commentsService->addComment($id, $request->user()->id, $request->input("comment"));

        return response()->json([
            "id" => $comment->id,
            "user" => $request->user()->name,
            "comment" => $comment->comment,
            "created_at" => $comment->created_at,
        ], 201);
    }
}
