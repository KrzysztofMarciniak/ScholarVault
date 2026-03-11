<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\ArticleComment;
use App\Services\ApiDocsService;
use App\Services\Article\ReviewerArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1ReviewerArticleController extends v1Controller
{
    public function assignedArticles(Request $request, ReviewerArticleService $service)
    {
        $user = $request->user();
        $articles = $service->assignedArticles($user, 10);

        return response()->json($articles, 200);
    }

    public function leaveComment(Request $request, int $id, ReviewerArticleService $service): JsonResponse
    {
        $user = $request->user();

        $article = $service->assignedArticle($user, $id);

        if (!$article) {
            return response()->json([
                "message" => "Article not found or not assigned to you.",
            ], 404);
        }

        $data = $request->validate([
            "comment" => ["required", "string", "max:5000"],
        ]);

        // Determine article ID safely
        $articleId = is_array($article) ? ($article["id"] ?? null) : $article->id;

        if (!$articleId) {
            return response()->json([
                "message" => "Invalid article data.",
            ], 500);
        }

        $comment = ArticleComment::create([
            "article_id" => $articleId,
            "user_id" => $user->id,
            "comment" => $data["comment"],
        ]);

        return response()->json($comment, 201);
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
                            "doi" => "string|null",
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
                    ],
                ],
                "available" => true,
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
                "query_params" => [],
            ],
            [
                "method" => "PATCH",
                "path" => "/api/v1/articles/decision/{id}",
                "description" => "Make final decision on an article",
                "auth_required" => true,
                "roles" => ["admin"],
                "request_body" => [
                    "status" => "string|required|in:accepted,rejected",
                ],
                "response_code" => 200,
                "response_data" => "Article object",
                "available" => true,
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
                "available" => true,
                "request_body" => [],
            ],
            [
                "method" => "POST",
                "path" => "/api/v1/articles/assgined/comment/{id}",
                "description" => "Leave a reviewer comment on an assigned article.",
                "auth_required" => true,
                "roles" => ["reviewer"],
                "request_body" => [
                    "comment" => "string|required|max:5000",
                ],
                "response_code" => 201,
                "response_data" => [
                    "id" => "integer",
                    "article_id" => "integer",
                    "user_id" => "integer",
                    "comment" => "string",
                    "created_at" => "timestamp",
                ],
                "available" => true,
                "query_params" => [],
            ],
        ]);

        return response()->json($apiDocs->getDocs());
    }
public function makeDecision(Request $request, int $id): JsonResponse
{
    $data = $request->validate([
        "decision" => "required|string|in:accepted,rejected",
    ]);

    $userId = $request->user()->id;
    $decision = $data["decision"];

    // Fetch article by ID from URL
    $article = Article::with('reviewers')->findOrFail($id);

    // Verify reviewer assignment via article_reviewer pivot
    $assigned = $article->reviewers->contains($userId);

    if (!$assigned) {
        return response()->json([
            "message" => "You are not assigned to review this article.",
        ], 403);
    }

    $currentStatus = $article->status_id;

    // Prevent illegal status transitions
    if ($currentStatus === ArticleStatus::ACCEPTED->value && $decision === "rejected") {
        return response()->json([
            "message" => "Cannot reject an already accepted article.",
        ], 403);
    }

    if (
        in_array($currentStatus, [
            ArticleStatus::REJECTED->value,
            ArticleStatus::REJECTED_BY_ADMIN->value,
        ], true) && $decision === "accepted"
    ) {
        return response()->json([
            "message" => "Cannot accept an already rejected article.",
        ], 403);
    }

    // Apply new status
    $article->status_id = $decision === "accepted"
        ? ArticleStatus::ACCEPTED->value
        : ArticleStatus::REJECTED->value;

    $article->save();

    return response()->json([
        "status" => "success",
        "article_id" => $article->id,
        "new_status" => $article->status_id,
    ]);
}

    }
