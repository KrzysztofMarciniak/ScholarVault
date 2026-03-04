<?php

declare(strict_types=1);

namespace App\Http\Controllers;

class v1ArticleController extends Controller
{
    public function help(): JsonResponse
    {
        return response()->json([
            "version" => "v1",
            "endpoints" => [
                // === AUTHOR ENDPOINTS ===
                [
                    "method" => "POST",
                    "path" => "/api/v1/articles",
                    "description" => "Submit a new article",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "request_body" => [
                        "title" => "string|required|max:255",
                        "abstract" => "string|required",
                        "content" => "string|required",
                        "keywords" => "array|nullable",
                    ],
                    "response_code" => 201,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles",
                    "description" => "List own articles and statuses",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/{id}",
                    "description" => "View own article details",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "POST",
                    "path" => "/api/v1/articles/{id}/revision",
                    "description" => "Submit revision after reviewer feedback",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "request_body" => [
                        "content" => "string|required",
                        "revised_at" => "datetime|required",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/{id}/comments",
                    "description" => "View reviewer comments",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Array of Comment objects",
                ],

                // === REVIEWER ENDPOINTS ===
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/assigned",
                    "description" => "List assigned articles",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/{id}",
                    "description" => "View assigned article details",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "POST",
                    "path" => "/api/v1/articles/{id}/review",
                    "description" => "Submit review feedback",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "request_body" => [
                        "recommendation" => "string|required|in:accept,reject,revision_requested",
                        "comments" => "string|required",
                    ],
                    "response_code" => 200,
                    "response_data" => "Review object",
                ],

                // === ADMIN ENDPOINTS ===
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles",
                    "description" => "List all articles",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/articles/{id}/assign-reviewers",
                    "description" => "Assign reviewers to an article",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "request_body" => [
                        "reviewers" => "array|required|of user_ids",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/articles/{id}/decision",
                    "description" => "Make final decision on an article",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "request_body" => [
                        "status" => "string|required|in:accepted,rejected,revision_requested",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/articles/{id}/publish",
                    "description" => "Publish an accepted article",
                    "auth_required" => true,
                    "roles" => ["admin"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
            ],
        ]);
    }
}
