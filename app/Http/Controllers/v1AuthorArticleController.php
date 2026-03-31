<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\Article\AuthorArticleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1AuthorArticleController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        // Submit a new article
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/articles/submit",
            description: "Submit a new article (author only). Requires title, abstract, file, optional keywords.",
            roles: ["author"],
            requestBody: [
                "title" => "string, required",
                "abstract" => "string, required",
                "file" => "pdf or tex, required",
                "keywords" => "array of strings, optional",
            ],
            responseCode: 201,
            responseData: [
                "status" => "success",
                "data" => "article object",
            ],
        ));

        // List the author's articles
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/my/list",
            description: "Retrieve paginated list of the authenticated author's own articles.",
            roles: ["author"],
            queryParams: [
                "per_page" => "integer, optional, default 10",
            ],
            responseCode: 200,
            responseData: [
                "status" => "success",
                "data" => "array of articles",
                "pagination" => "pagination info",
            ],
        ));

        // View a single article owned by the author
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/my/{id}",
            description: "View a single article authored by the authenticated user.",
            roles: ["author"],
            queryParams: [
                "id" => "integer, ID of the article",
            ],
            responseCode: 200,
            responseData: "article object",
        ));

        // List comments on author's article
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/articles/my/comments/{id}",
            description: "List comments on an article owned by the authenticated author.",
            roles: ["author"],
            queryParams: [
                "id" => "integer, article ID",
            ],
            responseCode: 200,
            responseData: "array of comment objects",
        ));

        // Add comment to author's article
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/articles/my/comments/{id}",
            description: "Add a comment to an article owned by the authenticated author.",
            roles: ["author"],
            requestBody: [
                "comment" => "string, required, max 5000 characters",
            ],
            responseCode: 201,
            responseData: [
                "id" => "comment ID",
                "user" => "comment author name",
                "comment" => "comment text",
                "created_at" => "timestamp",
            ],
        ));

        // Submit a revision for author's article
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/articles/my/revision/{id}",
            description: "Submit a revision file for an article authored by the authenticated user.",
            roles: ["author"],
            requestBody: [
                "file" => "pdf or tex, required",
                "notes" => "string, optional",
            ],
            responseCode: 200,
            responseData: [
                "status" => "success",
                "data" => "revision object",
            ],
        ));

        return response()->json($docs->getEndpoints());
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

        $data = $articles->getCollection()->map(fn($article) => [
            "id" => $article["id"] ?? null,
            "title" => $article["title"] ?? null,
            "abstract" => $article["abstract"] ?? null,
            "doi" => $article["doi"] ?? null,
            "status" => $article["status"] ?? null,
        ])->values();

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

        $latestFile = $article["files"][0] ?? null;

        if ($latestFile) {
            $article["filename"] = $latestFile["filename"];
            $article["file_type"] = $latestFile["file_type"];
            $article["version_number"] = $latestFile["version_number"];
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

    public function submitRevision(
        Request $request,
        int $id,
        AuthorArticleService $service,
    ): JsonResponse {
        $request->validate([
            "file" => "required|file|mimes:pdf,tex",
            "notes" => "nullable|string",
        ]);

        $file = $request->file("file");
        $notes = $request->input("notes");

        $revision = $service->submitRevision(
            $request->user()->id,
            $id,
            [
                "file" => $file,
                "notes" => $notes,
            ],
        );

        return response()->json([
            "status" => "success",
            "data" => $revision,
        ], 200);
    }
}
