<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1ReviewerArticleController extends v1Controller
{
    public function __construct(
        protected ApiDocsService $apiDocs,
    ) {
        $this->registerEndpoints();
    }

    public function assignedArticles(Request $request, ReviewerArticleService $service)
    {
        $user = $request->user();
        $articles = $service->assignedArticles($user, 10);

        return response()->json($articles, 200);
    }

    public function assignedArticle(Request $request, int $id, ReviewerArticleService $service): JsonResponse
    {
        $user = $request->user();
        $article = $service->assignedArticle($user, $id);

        if (!$article) {
            return response()->json([
                "message" => "Article not found or not assigned to you.",
            ], 404);
        }

        return response()->json($article, 200);
    }

    public function submitAssignedReview(Request $request, int $id, ReviewerArticleService $service): JsonResponse
    {
        $user = $request->user();
        $review = $service->submitReview($user, $id, $request->all());

        return response()->json($review, 200);
    }

    protected function registerEndpoints(): void
    {
        $this->apiDocs->addEndpoints([
            [
                "method" => "GET",
                "path" => "/api/v1/articles/assigned",
                "description" => "List articles assigned to the authenticated reviewer (paginated).",
                "auth_required" => true,
                "roles" => ["reviewer"],
                "response_code" => 200,
                "response_data" => [
                    "current_page" => "integer",
                    "per_page" => "integer",
                    "total" => "integer",
                    "last_page" => "integer",
                    "data" => "array of Article objects with authors, status, citations, and cited_by",
                ],
                "available" => true,
                "roles" => [],
                "request_body" => [],
                "query_params" => [],
            ],
            [
                "method" => "GET",
                "path" => "/api/v1/articles/assigned/{id}",
                "description" => "View detailed information of a specific article assigned to the authenticated reviewer.",
                "auth_required" => true,
                "roles" => ["reviewer"],
                "response_code" => 200,
                "response_data" => [
                    "id" => "integer",
                    "title" => "string",
                    "abstract" => "string",
                    "filename" => "string",
                    "file_type" => "string",
                    "keywords" => "array of strings",
                    "doi" => "string|null",
                    "created_at" => "datetime",
                    "updated_at" => "datetime",
                    "status" => [
                        "id" => "integer",
                        "name" => "string",
                    ],
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
                            "doi" => "string|null",
                        ],
                    ],
                    "cited_by" => [
                        [
                            "id" => "integer",
                            "title" => "string",
                            "doi" => "string|null",
                        ],
                    ],
                ],
                "available" => true,
                "roles" => [],
                "request_body" => [],
                "query_params" => [],
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
                "available" => true,
                "roles" => [],
                "query_params" => [],
            ],
        ]);
    }
}
