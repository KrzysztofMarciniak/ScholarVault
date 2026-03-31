<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\Article\AnyArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1ArticleController extends Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        // List paginated articles
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles",
            description: "Retrieve a paginated list of published articles with optional filters",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "page" => "integer (default 1)",
                "per_page" => "integer (max 25, default 15)",
                "search" => "string (search by title or abstract)",
                "keyword" => "string (filter by keyword)",
                "author_id" => "integer (filter by author ID)",
                "sort" => "string (sort order, e.g., created_at, title)",
            ],
            responseCode: 200,
            available: true,
            responseData: [
                "current_page" => "integer",
                "per_page" => "integer",
                "total" => "integer",
                "last_page" => "integer",
                "data" => "array of article objects",
            ],
        ));

        // Retrieve a single article
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/{id}",
            description: "Retrieve a single article by its ID",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "id" => "integer (ID of the article)",
            ],
            responseCode: 200,
            available: true,
            responseData: [
                "status" => "success",
                "data" => "article object",
            ],
        ));

        return response()->json($docs->getEndpoints());
    }

    /**
     * List paginated articles.
     */
    public function index(Request $request, AnyArticleService $service): JsonResponse
    {
        $filters = $request->only(["page", "per_page", "search", "keyword", "author_id", "sort"]);

        $filters["status_id"] = ArticleStatus::PUBLISHED->value;

        $result = $service->listArticles($filters);

        return response()->json($result, 200);
    }

    /**
     * Get a single article by ID.
     */
    public function show(Request $request, $id, AnyArticleService $service): JsonResponse
    {
        $article = $service->getArticle((int)$id);

        if ($article === null) {
            return response()->json([
                "status" => "error",
                "message" => "Article not found",
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "data" => $article,
        ], 200);
    }
}
