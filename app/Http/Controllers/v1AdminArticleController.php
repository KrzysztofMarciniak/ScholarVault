<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Events\ReviewersAssigned;
use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\Article\AdminArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Log;
use Throwable;

class v1AdminArticleController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        // List all articles (admin)
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/admin/",
            description: "List all articles with optional filtering and pagination.",
            roles: ["administrator"],
            queryParams: [
                "per_page" => "integer, optional, default 5",
                "status" => "integer, optional, filter by status ID",
                "search" => "string, optional, search by title or abstract",
            ],
            responseCode: 200,
            responseData: "paginated array of articles including authors, reviewers, citations, status, and latest file info",
        ));

        // List reviewers (admin)
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/admin/reviewers",
            description: "List all reviewers with optional search and pagination.",
            roles: ["administrator"],
            queryParams: [
                "per_page" => "integer, optional, default 10",
                "search" => "string, optional, search by name or email",
            ],
            responseCode: 200,
            responseData: "paginated array of reviewers with basic info",
        ));

        // Assign reviewers to an article (admin)
        $docs->addEndpoint(new EndpointDTO(
            method: "PATCH",
            path: "/api/v1/articles/admin/reviewers/{id}",
            description: "Assign reviewers to a specific article. Updates article status to 'under review'.",
            roles: ["administrator"],
            requestBody: [
                "reviewers" => "array of integer user IDs, required",
            ],
            responseCode: 200,
            responseData: "article object including assigned reviewers and latest file info",
        ));

        // Make decision on an article (admin)
        $docs->addEndpoint(new EndpointDTO(
            method: "PATCH",
            path: "/api/v1/articles/admin/decide/{id}",
            description: "Admin decision endpoint to publish or reject an article.",
            roles: ["administrator"],
            requestBody: [
                "status" => 'string, required, either "published" or "rejected_by_admin"',
            ],
            responseCode: 200,
            responseData: [
                "status" => "success or error",
                "article_id" => "ID of the article",
                "new_status" => "new status ID",
                "message" => "optional error message if failed",
            ],
        ));

        return response()->json($docs->getEndpoints());
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
