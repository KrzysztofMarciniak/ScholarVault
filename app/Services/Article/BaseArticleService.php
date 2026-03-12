<?php

namespace App\Services\Article;

use App\Models\Article;
use Illuminate\Pagination\LengthAwarePaginator;

abstract class BaseArticleService
{
    use ArticleTransformTrait;
    use ArticleQueryTrait;

    protected function paginateQuery($query, int $perPage = 10, int $page = 1): LengthAwarePaginator
    {
        return $query->paginate($perPage, ["*"], "page", $page);
    }
}
