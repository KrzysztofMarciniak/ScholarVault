<?php

declare(strict_types=1);

namespace App\Services\Article;

use App\Enums\ArticleStatus;
use App\Models\Article;

class AnyArticleService extends BaseArticleService
{

    /**
     * Return a paginated list of published articles with optional filters.
     */
    public function listArticles(array $filters = []): array
    {
        $query = Article::query()->where("status_id", ArticleStatus::PUBLISHED->value)
            ->with(["status:id,name", "authors:id,name,orcid", "citations"]);
        $query = $this->applyArticleFilters($query, $filters);
        $query = $this->applySort($query, $filters["sort"] ?? null);
        $perPage = (int)($filters["per_page"] ?? 15);
        $perPage = $perPage <= 0 ? 15 : min($perPage, 25);
        $page = (int)($filters["page"] ?? 1);
        $page = max($page, 1);
        $paginator = $this->paginateQuery($query, $perPage, $page);
        $data = $paginator->getCollection()
            ->map(fn($article) => $this->transformArticlePublic($article))
            ->all();

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
            "citations",
        ])->find($id);

        if (!$article) {
            return null;
        }

        return $this->transformArticlePublic($article);
    }
}
