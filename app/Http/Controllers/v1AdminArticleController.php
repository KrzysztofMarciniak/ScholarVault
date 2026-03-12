<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Events\ReviewersAssigned;
use App\Models\Article;
use App\Services\ApiDocsService;
use App\Services\Article\AdminArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Log;
use Throwable;

class v1AdminArticleController extends v1Controller
{

    public function help(ApiDocsService $apiDocs): JsonResponse
    {
        $apiDocs->addEndpoints([
            [
                "method" => "GET",
                "path" => "/api/v1/admin/articles",
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
                "path" => "/api/v1/articles/admin/reviewers/{id}",
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
                "path" => "/api/v1/articles/decision/{id}",
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
            [
                "method" => "GET",
                "path" => "/api/v1/articles/admin/reviewers",
                "description" => "List all reviewers (admin only). Paginated.",
                "auth_required" => true,
                "roles" => ["admin"],
                "query_params" => [
                    "page" => "integer",
                    "per_page" => "integer",
                    "search" => "string (optional)",
                ],
                "response_code" => 200,
                "response_data" => [
                    "current_page" => "integer",
                    "per_page" => "integer",
                    "total" => "integer",
                    "data" => [
                        [
                            "id" => "integer",
                            "name" => "string",
                            "email" => "string",
                            "affiliation" => "string|null",
                            "orcid" => "string|null",
                            "deactivated" => "boolean",
                        ],
                    ],
                ],
            ],
        ]);

        return response()->json($service->getDocs());
    }

        public function listReviewers(Request $request, AdminArticleService $service): JsonResponse
    {
        $perPage = (int)$request->get("per_page", 10);
        $search = $request->get("search");

        $reviewers = $service->listReviewers($perPage, $search);

        return response()->json($reviewers, 200);
    }

    public function AdminlistAllArticles(Request $request, AdminArticleService $service): JsonResponse
{
    $perPage = (int)$request->get("per_page", 5);

    $filters = [
        "status" => $request->get("status"),
        "search" => $request->get("search"),
    ];

    Log::info("AdminlistAllArticles - incoming filters", $filters);

    try {
        $articles = $service->listArticles($perPage, $filters);

        Log::info("AdminlistAllArticles - paginated result", [
            "total" => $articles->total(),
            "per_page" => $articles->perPage(),
            "current_page" => $articles->currentPage(),
            "last_page" => $articles->lastPage(),
        ]);

        return response()->json($articles, 200);
    } catch (Throwable $e) {
        Log::error("AdminlistAllArticles failed", [
            "message" => $e->getMessage(),
            "trace" => $e->getTraceAsString(),
        ]);

        return response()->json([
            "error" => "Failed to fetch articles",
            "message" => $e->getMessage(),
        ], 500);
    }
}

    public function AdminAssignReviewers(Request $request, int $id, AdminArticleService $service): JsonResponse
    {
        $validated = $request->validate([
            "reviewers" => ["required", "array"],
            "reviewers.*" => ["integer"],
        ]);

        try {
            $article = $service->assignReviewers($id, $validated["reviewers"]);

            $article->status_id = ArticleStatus::UNDER_REVIEW->value;
            $article->save();

            event(new ReviewersAssigned($article, $validated["reviewers"]));
        } catch (InvalidArgumentException $e) {
            return response()->json([
                "message" => $e->getMessage(),
            ], 422);
        }

        // Attach latest file if exists
        $latestFile = $article->latestFile();
        if ($latestFile) {
            $article->filename = $latestFile->filename;
            $article->file_type = $latestFile->file_type;
            $article->version_number = $latestFile->version_number;
        }

        return response()->json($article, 200);
    }

    public function makeDecision(Request $request, int $id, AdminArticleService $service): JsonResponse
    {
        $validated = $request->validate([
            "status" => "required|string|in:published,rejected_by_admin",
        ]);

        $response = $service->makeDecision($id, $validated["status"]);

        $statusCode = $response["status"] === "success" ? 200 : 403;

        return response()->json($response, $statusCode);
    }
}
