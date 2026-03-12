<?php

declare(strict_types=1);

namespace App\Services\Article;

use Illuminate\Database\Eloquent\Builder;

trait ArticleQueryTrait
{
    protected function applyArticleFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters["author_id"])) {
            $query->whereHas("authors", fn($q) => $q->where("user_id", $filters["author_id"]));
        }

        if (!empty($filters["keyword"])) {
            $query->whereJsonContains("keywords", $filters["keyword"]);
        }

        if (!empty($filters["search"])) {
            $search = $filters["search"];
            $query->where(fn($q) => $q->where("title", "like", "%$search%")
                ->orWhere("abstract", "like", "%$search%"));
        }

        return $query;
    }

    protected function applySort(Builder $query, ?string $sort = null): Builder
    {
        if ($sort === "oldest") {
            $query->orderBy("created_at", "asc");
        } else {
            $query->orderByDesc("created_at");
        }

        return $query;
    }
}
