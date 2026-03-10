<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Article;
use App\Enums\ArticleStatus;
use App\Services\Article\AnyArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1ArticleController extends Controller
{
    public function help(ApiDocsService $apiDocs): JsonResponse
    {
        $apiDocs->addEndpoints([
            [
                "method" => "GET",
                "path" => "/api/v1/articles/{id}",
                "description" => "Retrieve detailed information about a specific published article",
                "auth_required" => false,
                "path_params" => [
                    "id" => "integer|required|article id",
                ],
                "response_code" => 200,
                "response_data" => [
                    "id" => "integer",
                    "title" => "string",
                    "abstract" => "string",
                    "doi" => "string|null",
                    "keywords" => "array",
                    "file_type" => "string",
                    "filename" => "string",
                    "status" => [
                        "id" => "integer",
                        "name" => "string",
                    ],
                    "created_at" => "datetime",
                    "updated_at" => "datetime",
                    "authors" => [
                        [
                            "id" => "integer",
                            "name" => "string",
                            "orcid" => "string|null",
                            "is_primary" => "boolean",
                        ],
                    ],
                    "reviewers" => [
                        [
                            "id" => "integer",
                            "name" => "string",
                            "orcid" => "string|null",
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
                    "citations_count" => "integer",
                    "cited_by_count" => "integer",
                ],
                "available" => true,
                "roles" => [],
                "request_body" => [],
                "query_params" => [],
            ],
            [
                "method" => "GET",
                "path" => "/api/v1/articles",
                "description" => "Retrieve paginated list of published articles",
                "auth_required" => false,
                "query_params" => [
                    "page" => "integer|optional|default:1",
                    "per_page" => "integer|optional|max:25|default:15",
                    "search" => "string|optional|search in title and abstract",
                    "keyword" => "string|optional|filter by keyword",
                    "author_id" => "integer|optional|filter by author",
                    "sort" => "string|optional|values: newest, oldest",
                ],
                "response_code" => 200,
                "response_data" => [
                    "current_page" => "integer",
                    "per_page" => "integer",
                    "total" => "integer",
                    "last_page" => "integer",
                    "data" => [
                        [
                            "id" => "integer",
                            "title" => "string",
                            "abstract" => "string",
                            "doi" => "string|null",
                            "keywords" => "array",
                            "file_type" => "string",
                            "created_at" => "datetime",
                            "authors" => [
                                [
                                    "id" => "integer",
                                    "name" => "string",
                                    "orcid" => "string|null",
                                    "is_primary" => "boolean",
                                ],
                            ],
                            "citations_count" => "integer",
                        ],
                    ],
                ],
                "available" => true,
                "roles" => [],
                "request_body" => [],
                "query_params" => [
                    "page" => "integer|optional|default:1",
                    "per_page" => "integer|optional|max:25|default:15",
                    "search" => "string|optional|search in title and abstract",
                    "keyword" => "string|optional|filter by keyword",
                    "author_id" => "integer|optional|filter by author",
                    "sort" => "string|optional|values: newest, oldest",
                ],
            ],
        ]);

        return response()->json([
            "status" => "success",
            "endpoints" => $apiDocs->getEndpoints(),
        ]);
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
