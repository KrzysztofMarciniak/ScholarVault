<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ReviewersAssigned;
use App\Models\Notification;
use App\Models\User;

class StoreReviewersAssignedNotification
{
    public function handle(ReviewersAssigned $event): void
    {
        $article = $event->article;

        $primaryAuthor = $article->authors()
            ->wherePivot("is_primary", 1)
            ->first();

        if ($primaryAuthor) {
            Notification::firstOrCreate(
                [
                    "user_id" => $primaryAuthor->id,
                    "type" => "article.reviewers.assigned",
                    "data" => json_encode(["article_id" => $article->id]),
                ],
                [
                    "title" => "Reviewers Assigned",
                    "message" => "Reviewers have been assigned to your article '{$article->title}'.",
                ],
            );
        }

        $coAuthors = $article->authors()
            ->wherePivot("is_primary", 0)
            ->get();

        foreach ($coAuthors as $coauthor) {
            Notification::firstOrCreate(
                [
                    "user_id" => $coauthor->id,
                    "type" => "article.reviewers.assigned",
                    "data" => json_encode(["article_id" => $article->id]),
                ],
                [
                    "title" => "Reviewers Assigned",
                    "message" => "Reviewers have been assigned to the article '{$article->title}' (primary author: {$primaryAuthor?->name}).",
                ],
            );
        }

        $reviewers = User::whereIn("id", $event->reviewerIds)->get();

        foreach ($reviewers as $reviewer) {
            Notification::firstOrCreate(
                [
                    "user_id" => $reviewer->id,
                    "type" => "article.reviewers.assigned",
                    "data" => json_encode(["article_id" => $article->id]),
                ],
                [
                    "title" => "You Are Assigned as Reviewer",
                    "message" => "You have been assigned to review the article '{$article->title}'.",
                ],
            );
        }
    }
}
