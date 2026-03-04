<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ReviewSubmitted;
use App\Models\Notification;
use App\Models\User;

class StoreReviewSubmittedNotification
{
    /**
     * Handle the event.
     */
    public function handle(ReviewSubmitted $event): void
    {
        $review = $event->review;
        $article = $review->article;
        $reviewer = $review->reviewer;

        $primaryAuthor = $article->authors()->wherePivot('is_primary', 1)->first();

        if ($primaryAuthor) {
            Notification::firstOrCreate(
                [
                    'user_id' => $primaryAuthor->id,
                    'type' => 'article.review.submitted',
                    'data' => json_encode(['article_id' => $article->id, 'review_id' => $review->id]),
                ],
                [
                    'title' => 'Review Submitted',
                    'message' => "Reviewer {$reviewer->name} submitted feedback on your article '{$article->title}'.",
                ]
            );
        }

        $coAuthors = $article->authors()->wherePivot('is_primary', 0)->get();

        foreach ($coAuthors as $coauthor) {
            Notification::firstOrCreate(
                [
                    'user_id' => $coauthor->id,
                    'type' => 'article.review.submitted',
                    'data' => json_encode(['article_id' => $article->id, 'review_id' => $review->id]),
                ],
                [
                    'title' => 'Review Submitted',
                    'message' => "Reviewer {$reviewer->name} submitted feedback on article '{$article->title}'.",
                ]
            );
        }
    }
}
