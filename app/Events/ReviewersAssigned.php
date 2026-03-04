<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Article;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewersAssigned
{
    use Dispatchable, SerializesModels;

    public Article $article;
    public array $reviewerIds;

    public function __construct(Article $article, array $reviewerIds)
    {
        $this->article = $article;
        $this->reviewerIds = $reviewerIds;
    }
}
