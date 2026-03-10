<?php

declare(strict_types=1);

namespace App\Services\Article;

abstract class BaseArticleService
{
    public function formatArticle(array $article): array
    {
        return $article;
    }
}
