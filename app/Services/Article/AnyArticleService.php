<?php

declare(strict_types=1);

namespace App\Services\Article;

use App\Enums\ArticleStatus;
use App\Models\Article;

class AnyArticleService extends BaseArticleService
{
    /**
     * Return a list of articles with optional filters.
     */
    public function listArticles(array $filters = []): array
    {
        $query = Article::query()
            ->where("status_id", ArticleStatus::PUBLISHED->value);

        if (!empty($filters["author_id"])) {
            $query->whereHas("authors", fn($q) => $q->where("user_id", $filters["author_id"]));
        }

        if (!empty($filters["keyword"])) {
            $query->whereJsonContains("keywords", $filters["keyword"]);
        }

        if (!empty($filters["search"])) {
            $search = (string)$filters["search"];
            $query->where(
                fn($q) => $q
                    ->where("title", "like", "%{$search}%")
                    ->orWhere("abstract", "like", "%{$search}%"),
            );
        }

        if (!empty($filters["sort"])) {
            $direction = $filters["sort"] === "oldest" ? "asc" : "desc";
            $query->orderBy("created_at", $direction);
        } else {
            $query->orderByDesc("created_at");
        }

        $perPage = (int)($filters["per_page"] ?? 15);
        $perPage = $perPage <= 0 ? 15 : min($perPage, 25);
        $page = (int)($filters["page"] ?? 1);
        $page = $page <= 0 ? 1 : $page;

        $paginator = $query
            ->with("status:id,name")
            ->with("authors:id,name,orcid")
            ->withCount(["citations", "citedBy"])
            ->paginate($perPage, ["*"], "page", $page);

        $data = array_map(fn($article) => $this->mapListItem($article), $paginator->items());

        return [
            "current_page" => $paginator->currentPage(),
            "per_page" => $paginator->perPage(),
            "total" => $paginator->total(),
            "last_page" => $paginator->lastPage(),
            "data" => $data,
        ];
    }

    /**
     * Retrieve a single article by ID.
     */
    public function getArticle(int $id): ?array
    {
        $article = Article::with([
            "authors:id,name,orcid",
            "status:id,name",
            "citations:id,title,doi",
            "citedBy:id,title,doi",
        ])->find($id);

        if (!$article) {
            return null;
        }

        return $this->mapDetail($article);
    }

    /**
     * Map a paginator item to a list-friendly array.
     */
    protected function mapListItem(Article $article): array
    {
        return [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "doi" => $article->doi,
            "keywords" => $article->keywords,
            "file_type" => $article->file_type,
            "created_at" => $article->created_at?->toDateTimeString(),
            "authors" => $article->authors->map(fn($a) => [
                "id" => $a->id,
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => (bool)($a->pivot->is_primary ?? false),
            ])->values()->all(),
            "citations_count" => $article->citations_count ?? 0,
            "cited_by_count" => $article->cited_by_count ?? 0,
        ];
    }

    /**
     * Map a full article to the detail array used by public endpoint.
     */
    protected function mapDetail(Article $article): array
    {
        return [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "filename" => $article->filename,
            "file_type" => $article->file_type,
            "keywords" => $article->keywords,
            "status" => $article->status?->name,
            "created_at" => $article->created_at?->toDateTimeString(),
            "updated_at" => $article->updated_at?->toDateTimeString(),
            "doi" => $article->doi,
            "authors" => $article->authors->map(fn($a) => [
                "id" => $a->id,
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => (bool)($a->pivot->is_primary ?? false),
            ])->values()->all(),
            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values()->all(),
            "cited_by" => $article->citedBy->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values()->all(),
            "citations_count" => $article->citations->count(),
            "cited_by_count" => $article->citedBy->count(),
        ];
    }
}
