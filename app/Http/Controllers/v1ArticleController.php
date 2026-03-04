<?php

declare(strict_types=1);

namespace App\Http\Controllers;
use App\Enums\ArticleStatus;
use App\Events\ArticleSubmitted;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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
                    "description" => "Submit a new article (PDF or TeX file required)",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "request_body" => [
                        "title" => "string|required|max:255",
                        "abstract" => "string|required",
                        "file" => "file|required|mimes:pdf,tex",
                        "keywords" => "array|nullable",
                    ],
                    "response_code" => 201,
                    "response_data" => "Article object",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/my",
                    "description" => "List own articles and statuses (paginated, showing id, title, abstract, doi, status)",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => [
                        "data" => [
                            [
                                "id" => "integer",
                                "title" => "string",
                                "abstract" => "string",
                                "doi" => "string|null",
                                "status" => "string",
                            ],
                        ],
                        "pagination" => [
                            "current_page" => "integer",
                            "per_page" => "integer",
                            "total" => "integer",
                            "last_page" => "integer",
                        ],
                    ],
                ],

                [
                    "method" => "GET",
                    "path" => "/api/v1/articles/my/{id}",
                    "description" => "View details of an article authored by the authenticated user, including co-authors and citations",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => [
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
                                "name" => "string",
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
                    ],
                ],
                [// implement
                    "method" => "POST",
                    "path" => "/api/v1/articles/my/{id}/revision",
                    "description" => "Submit revision after reviewer feedback",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "request_body" => [
                        "file" => "file|required|mimes:pdf,tex",
                        "notes" => "string|nullable",
                    ],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [// implement
                    "method" => "GET",
                    "path" => "/api/v1/articles/my/{id}/comments",
                    "description" => "View reviewer comments",
                    "auth_required" => true,
                    "roles" => ["author"],
                    "response_code" => 200,
                    "response_data" => "Array of Comment objects",
                ],

                // === REVIEWER ENDPOINTS ===
                [// implement
                    "method" => "GET",
                    "path" => "/api/v1/articles/assigned",
                    "description" => "List assigned articles",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "response_code" => 200,
                    "response_data" => "Array of Article objects",
                ],
                [// implement
                    "method" => "GET",
                    "path" => "/api/v1/articles/assigned/{id}",
                    "description" => "View assigned article details",
                    "auth_required" => true,
                    "roles" => ["reviewer"],
                    "response_code" => 200,
                    "response_data" => "Article object",
                ],
                [// implement
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
                ],

                // === ADMIN ENDPOINTS ===
                [
                    "method" => "GET",
                    "path" => "/api/v1/articles",
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
                ],

[
    "method" => "PATCH",
    "path" => "/api/v1/articles/{id}/reviewers",
    "description" => "Replace all reviewers assigned to an article (admin only). Existing reviewers are removed if not included in request.",
    "auth_required" => true,
    "roles" => ["admin"],
    "request_body" => [
        "reviewers" => "array|required",
        "reviewers.*" => "integer|exists:users,id (must have reviewer role)"
    ],
    "behavior" => "sync (overwrite)",
    "response_code" => 200,
    "response_data" => "Updated Article resource with reviewers"
],
                [// implement
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
                [// implement
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

    public function store(Request $request): JsonResponse
    {
        // Validate request (file, title, abstract, optional keywords)
        $data = $request->validate([
            "title" => "required|string|max:255",
            "abstract" => "required|string",
            "file" => "required|file|mimes:pdf,tex",
            "keywords" => "array|nullable",
        ]);

        // Handle file upload
        $file = $request->file("file");
        $filename = $file->store("articles", "public"); // stored in storage/app/public/articles

        // Create article
        $article = Article::create([
            "title" => $data["title"],
            "abstract" => $data["abstract"],
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "keywords" => $data["keywords"] ?? [],
            "status_id" => ArticleStatus::DRAFT->value,
        ]); 
        $article->authors()->attach($request->user()->id, ["is_primary" => 1]);
        event(new ArticleSubmitted($article));

        return response()->json([
            "status" => "success",
            "data" => $article,
        ], 201);
    }

    public function myArticles(Request $request): JsonResponse
    {
        $user = $request->user();

        $articles = Article::whereHas("authors", function ($query) use ($user): void {
            $query->where("user_id", $user->id);
        })
            ->join("article_statuses as s", "articles.status_id", "=", "s.id")
            ->select(
                "articles.id",
                "articles.title",
                "articles.abstract",
                "articles.doi",
                "s.name as status",
            )
            ->paginate(10);

        return response()->json([
            "status" => "success",
            "data" => $articles->items(),
            "pagination" => [
                "current_page" => $articles->currentPage(),
                "per_page" => $articles->perPage(),
                "total" => $articles->total(),
                "last_page" => $articles->lastPage(),
            ],
        ], 200);
    }

    public function myArticle(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $article = Article::with([
            "authors:id,name,orcid",
            "citations:id,title,doi",
            "status:id,name", // eager load status
        ])
            ->whereHas("authors", function ($query) use ($user): void {
                $query->where("user_id", $user->id);
            })
            ->find($id);

        if (!$article) {
            return response()->json([
                "message" => "Article not found or you do not have access.",
            ], 404);
        }

        $response = [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "filename" => $article->filename,
            "file_type" => $article->file_type,
            "keywords" => $article->keywords,
            "status" => $article->status->name,
            "doi" => $article->doi,
            "authors" => $article->authors->map(fn($a) => [
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => $a->pivot->is_primary,
            ]),
            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ]),
        ];

        return response()->json($response, 200);
    }
    public function AdminAssignReviewers(Request $request, int $id)
    {
        // 1. Fetch article
        $article = Article::findOrFail($id);

        $validated = $request->validate([
    'reviewers' => ['required', 'array'],
    'reviewers.*' => [
        'integer',
        function ($attribute, $value, $fail) {
            $user = \App\Models\User::find($value);
            if (!$user || $user->role_id !== \App\Models\Role::REVIEWER) {
                $fail("The user ID {$value} is not a valid reviewer.");
            }
        },
    ],
]);


        // 3. Sync reviewers (overwrite behavior)
        $article->reviewers()->sync($validated['reviewers']);

        // 4. Reload reviewers relation
        $article->load('reviewers');

        // 5. Return updated resource
        return response()->json($article, 200);
    }
public function AdminlistAllArticles(Request $request): JsonResponse
{
    $articles = Article::with([
        "authors" => fn($q) => $q->select([
            "users.id",
            "users.name",
            "users.email",
            "users.role_id",
            "users.affiliation",
            "users.bio",
            "users.deactivated",
            "users.orcid",
        ])->with("role"),
        "citations:id,title,doi",
        "citedBy:id,title,doi",
        "status:id,name",
    ])->paginate(5);

    $articles->getCollection()->transform(function ($article) {
        return [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "filename" => $article->filename,
            "file_type" => $article->file_type,
            "keywords" => $article->keywords,
            "status" => $article->status?->name,
            "doi" => $article->doi,

            "authors" => $article->authors->map(fn($author) => [
                "id" => $author->id,
                "name" => $author->name,
                "email" => $author->email,
                "role_id" => $author->role_id,
                "role_name" => $author->role?->name,
                "affiliation" => $author->affiliation,
                "bio" => $author->bio,
                "deactivated" => (bool) $author->deactivated,
                "orcid" => $author->orcid,
                "is_primary" => (bool) $author->pivot->is_primary,
            ])->values(),

            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),

            "cited_by" => $article->citedBy->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),
        ];
    });

    return response()->json($articles, 200);
}
}
