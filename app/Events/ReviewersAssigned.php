<?php

declare(strict_types=1);

namespace App\Events;

use App\Models\Article;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReviewersAssigned
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Article $article,
        public array $reviewerIds,
    ) {}
}
