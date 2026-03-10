<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class v1AdminArticleController extends v1Controller
{
    public function AdminAssignReviewers(
        Request $request,
        int $id,
        AdminArticleService $service,
    ): JsonResponse {
        $validated = $request->validate([
            "reviewers" => ["required", "array"],
            "reviewers.*" => ["integer"],
        ]);

        try {
            $article = $service->assignReviewers($id, $validated["reviewers"]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                "message" => $e->getMessage(),
            ], 422);
        }

        return response()->json($article, 200);
    }

    public function AdminlistAllArticles(
        Request $request,
        AdminArticleService $service,
    ): JsonResponse {
        $articles = $service->listArticles(5);

        return response()->json($articles, 200);
    }

    /**
     * Make final decision on an article (admin only).
     */
    public function decide(Request $request, int $id): JsonResponse
    {
        // Validate input
        $validated = $request->validate([
            "status" => "required|string|in:published,rejected",
        ]);

        // Fetch article
        $article = Article::findOrFail($id);

        // Map string to enum value
        $statusMap = [
            "published" => ArticleStatus::PUBLISHED->value,
            "rejected" => ArticleStatus::REJECTED->value,
        ];

        $article->status_id = $statusMap[$validated["status"]];
        $article->save();

        return response()->json([
            "status" => "success",
            "data" => $article,
        ], 200);
    }

    public function help(ApiDocsService $service): void
    {
        $service->addEndpoints([
            [
                "method" => "GET",
                "path" => "/api/v1/articles",
                "description" => "List all articles with full details, including authors, citations, and articles that cite them. Paginated to 5 per page.",
                "auth_required" => true,
                "roles" => ["admin"],
                "response_code" => 200,
                "response_data" => [
                    "current_page" => "integer",
                    "per_page" => "integer",
                    "total" => "integer",
                    "data" => [
                        [
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
                                    "id" => "integer",
                                    "name" => "string",
                                    "email" => "string",
                                    "role_id" => "integer",
                                    "role_name" => "string",
                                    "affiliation" => "string|null",
                                    "bio" => "string|null",
                                    "deactivated" => "boolean",
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
                            "cited_by" => [
                                [
                                    "id" => "integer",
                                    "title" => "string",
                                    "doi" => "string",
                                ],
                            ],
                        ],
                    ],
                ],
                "available" => true,
                "roles" => [],
                "request_body" => [],
                "query_params" => [],
            ],
            [
                "method" => "PATCH",
                "path" => "/api/v1/articles/{id}/reviewers",
                "description" => "Replace all reviewers assigned to an article (admin only). Existing reviewers are removed if not included in request.",
                "auth_required" => true,
                "roles" => ["admin"],
                "request_body" => [
                    "reviewers" => "array|required",
                    "reviewers.*" => "integer|exists:users,id (must have reviewer role)",
                ],
                "behavior" => "sync (overwrite)",
                "response_code" => 200,
                "response_data" => "Updated Article resource with reviewers",
                "available" => true,
                "roles" => [],
                "query_params" => [],
            ],
            [
                "method" => "PATCH",
                "path" => "/api/v1/articles/{id}/decision",
                "description" => "Make final decision on an article",
                "auth_required" => true,
                "roles" => ["admin"],
                "request_body" => [
                    "status" => "string|required|in:published,rejected",
                ],
                "response_code" => 200,
                "response_data" => "Article object",
                "available" => true,
                "roles" => [],
                "query_params" => [],
            ],
        ]);
    }
}
