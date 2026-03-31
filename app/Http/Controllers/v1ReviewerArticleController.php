<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\ArticleComment;
use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\Article\ReviewerArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1ReviewerArticleController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        // List articles assigned to the reviewer
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/assigned",
            description: "List articles assigned to the authenticated reviewer.",
            roles: ["reviewer"],
            queryParams: [
                "per_page" => "integer, optional, default 10",
            ],
            responseCode: 200,
            responseData: "paginated array of articles with basic info",
        ));

        // View a single assigned article
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/assigned/{id}",
            description: "View details of a single article assigned to the reviewer.",
            roles: ["reviewer"],
            queryParams: [
                "id" => "integer, article ID",
            ],
            responseCode: 200,
            responseData: "article object including latest file, authors, citations, and comments",
        ));

        // Leave a comment on an assigned article
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/articles/assigned/comment/{id}",
            description: "Add a comment on an assigned article.",
            roles: ["reviewer"],
            requestBody: [
                "comment" => "string, required, max 5000 characters",
            ],
            responseCode: 201,
            responseData: [
                "id" => "comment ID",
                "article_id" => "article ID",
                "user_id" => "comment author ID",
                "comment" => "comment text",
                "created_at" => "timestamp",
            ],
        ));

        // Submit a review for an assigned article
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/articles/assigned/{id}/review",
            description: "Submit a review for an assigned article.",
            roles: ["reviewer"],
            requestBody: [
                "recommendation" => "string, required, one of accept, reject, revision_requested",
                "comments" => "string, required, max 5000 characters",
            ],
            responseCode: 200,
            responseData: "review object including reviewer info",
        ));

        // Make a decision on an assigned article
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/articles/assigned/decide/{id}",
            description: "Submit a final decision (accept/reject) on an assigned article.",
            roles: ["reviewer"],
            requestBody: [
                "decision" => "string, required, either accepted or rejected",
            ],
            responseCode: 200,
            responseData: [
                "status" => "success",
                "article_id" => "ID of the article",
                "new_status" => "new status ID",
            ],
        ));

        return response()->json($docs->getEndpoints());
    }

    public function assignedArticles(Request $request, ReviewerArticleService $service): JsonResponse
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

        $articleId = $article["id"] ?? null;

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

        // Override top-level filename/file_type with latest file
        $latestFile = $article["files"][0] ?? null;

        if ($latestFile) {
            $article["filename"] = $latestFile["filename"];
            $article["file_type"] = $latestFile["file_type"];
            $article["version_number"] = $latestFile["version_number"];
        }

        return response()->json($article, 200);
    }

    public function submitAssignedReview(Request $request, int $id, ReviewerArticleService $service): JsonResponse
    {
        $user = $request->user();
        $review = $service->submitReview($user, $id, $request->all());

        return response()->json($review, 200);
    }

    public function makeDecision(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            "decision" => "required|string|in:accepted,rejected",
        ]);

        $userId = $request->user()->id;
        $decision = $data["decision"];

        $article = Article::with("reviewers")->findOrFail($id);

        if (!$article->reviewers->contains($userId)) {
            return response()->json([
                "message" => "You are not assigned to review this article.",
            ], 403);
        }

        $currentStatus = $article->status_id;

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
