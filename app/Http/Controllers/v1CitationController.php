<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Citation;
use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\CitationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1CitationController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/citations/{id}",
            description: "Retrieve a specific citation by ID",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "id" => "integer|required (ID of the citation to retrieve)",
            ],
            responseCode: 200,
            available: true,
            responseData: [
                "id" => "integer",
                "title" => "string",
                "authors" => "string|null",
                "doi" => "string|null",
                "url" => "string|null",
                "published_at" => "date|null",
                "availability_status" => "string",
                "on_site_path" => "string|null",
                "article_id" => "integer",
                "created_at" => "datetime",
                "updated_at" => "datetime",
            ],
        ));
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/citations",
            description: "List all citations (paginated)",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "page" => "integer (default 1)",
                "per_page" => "integer (max 25, default 15)",
                "search" => "string (search by title or authors)",
                "article_id" => "integer (filter by article)",
                "availability_status" => "string (on_site, external_link, doi_only)",
                "sort_by" => "string (default created_at)",
                "sort_direction" => "string (asc or desc, default desc)",
            ],
            responseCode: 200,
            available: true,
            responseData: "Paginated citation list",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/citations/{id}",
            description: "Retrieve a specific citation",
            roles: ["none"],
            requestBody: [],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "Citation object",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/citations",
            description: "Create a new citation (author on own article, reviewer or admin on any)",
            roles: ["author", "reviewer", "administrator"],
            requestBody: [
                "title" => "string|required|max:255",
                "authors" => "string|nullable",
                "doi" => "string|nullable|max:255",
                "url" => "string|nullable|url",
                "published_at" => "date|nullable",
                "availability_status" => "string|required|in:on_site,external_link,doi_only",
                "on_site_path" => "string|nullable",
                "article_id" => "integer|required|exists:articles,id",
            ],
            queryParams: [],
            responseCode: 201,
            available: true,
            responseData: "Citation object",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "PATCH",
            path: "/api/v1/citations/{id}",
            description: "Update a citation (author on own article, reviewer or admin on any)",
            roles: ["author", "reviewer", "administrator"],
            requestBody: [
                "title" => "string|sometimes|max:255",
                "authors" => "string|sometimes|nullable",
                "doi" => "string|sometimes|nullable|max:255",
                "url" => "string|sometimes|nullable|url",
                "published_at" => "date|sometimes|nullable",
                "availability_status" => "string|sometimes|in:on_site,external_link,doi_only",
                "on_site_path" => "string|sometimes|nullable",
            ],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "Updated citation object",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "DELETE",
            path: "/api/v1/citations/{id}",
            description: "Delete a citation (author on own article, reviewer or admin on any)",
            roles: ["author", "reviewer", "administrator"],
            requestBody: [],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "Success message",
        ));

        return response()->json($docs->getEndpoints());
    }

    public function index(Request $request, CitationService $service): JsonResponse
    {
        $filters = [
            "per_page" => $request->query("per_page", 15),
            "page" => $request->query("page", 1),
            "search" => $request->query("search"),
            "availability_status" => $request->query("availability_status"),
            "article_id" => $request->query("article_id"),
            "sort_by" => $request->query("sort_by", "created_at"),
            "sort_direction" => $request->query("sort_direction", "desc"),
        ];

        $citations = $service->listCitations($filters);

        return response()->json($citations);
    }

    public function store(Request $request, CitationService $service): JsonResponse
    {
        $user = $request->user("sanctum");

        if (!$user->isAdministrator() && !$user->isReviewer() && !$user->isAuthor()) {
            return response()->json([
                "status" => "error",
                "message" => "Unauthorized to create citations",
            ], 403);
        }

        $data = $request->validate([
            "title" => "required|string|max:255",
            "authors" => "nullable|string",
            "doi" => "nullable|string|max:255",
            "url" => "nullable|url",
            "published_at" => "nullable|date",
            "availability_status" => "required|in:on_site,external_link,doi_only",
            "on_site_path" => "nullable|string",
            "article_id" => "required|integer|exists:articles,id",
        ]);

        // If author creating citation for own article, verify ownership
        if ($user->isAuthor()) {
            $article = Article::find($data["article_id"]);

            if (!$article || !$article->authors()->where("user_id", $user->id)->exists()) {
                return response()->json([
                    "status" => "error",
                    "message" => "You can only add citations to your own articles",
                ], 403);
            }
        }

        $citation = $service->createCitation($data);

        return response()->json([
            "status" => "success",
            "data" => $citation,
        ], 201);
    }

    public function show(int $id, CitationService $service): JsonResponse
    {
        $citation = $service->getCitation($id);

        if (!$citation) {
            return response()->json([
                "status" => "error",
                "message" => "Citation not found",
            ], 404);
        }

        return response()->json($citation);
    }

    public function update(Request $request, int $id, CitationService $service): JsonResponse
    {
        $user = $request->user("sanctum");
        $citation = Citation::findOrFail($id);

        // Admin and reviewer can edit any citation
        if (!$user->isAdministrator() && !$user->isReviewer()) {
            // Author can only edit citations on their own articles
            if ($user->isAuthor()) {
                $hasArticle = $citation->article()
                    ->whereHas("authors", function ($q) use ($user): void {
                        $q->where("user_id", $user->id);
                    })
                    ->exists();

                if (!$hasArticle) {
                    return response()->json([
                        "status" => "error",
                        "message" => "You can only edit citations on your own articles",
                    ], 403);
                }
            } else {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthorized to update citations",
                ], 403);
            }
        }

        $data = $request->validate([
            "title" => "sometimes|string|max:255",
            "authors" => "sometimes|nullable|string",
            "doi" => "sometimes|nullable|string|max:255",
            "url" => "sometimes|nullable|url",
            "published_at" => "sometimes|nullable|date",
            "availability_status" => "sometimes|in:on_site,external_link,doi_only",
            "on_site_path" => "sometimes|nullable|string",
        ]);

        $updated = $service->updateCitation($citation->id, $data);

        return response()->json([
            "status" => "success",
            "data" => $updated,
        ]);
    }

    public function destroy(Request $request, int $id, CitationService $service): JsonResponse
    {
        $user = $request->user("sanctum");
        $citation = Citation::findOrFail($id);

        if (!$user->isAdministrator() && !$user->isReviewer()) {
            if ($user->isAuthor()) {
                $hasArticle = $citation->article()
                    ->whereHas("authors", function ($q) use ($user): void {
                        $q->where("user_id", $user->id);
                    })
                    ->exists();

                if (!$hasArticle) {
                    return response()->json([
                        "status" => "error",
                        "message" => "You can only delete citations on your own articles",
                    ], 403);
                }
            } else {
                return response()->json([
                    "status" => "error",
                    "message" => "Unauthorized to delete citations",
                ], 403);
            }
        }

        $deleted = $service->deleteCitation($id);

        if (!$deleted) {
            return response()->json([
                "status" => "error",
                "message" => "Citation not found",
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "message" => "Citation deleted",
        ]);
    }
}
