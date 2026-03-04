<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Events\ArticleSubmitted;
use App\Models\Notification;
use App\Models\Role;
use App\Models\User;

class StoreArticleSubmissionNotification
{
    public function handle(ArticleSubmitted $event): void
    {
        $article = $event->article;

        // Primary author
        $primaryAuthor = $article->authors()
            ->wherePivot("is_primary", 1)
            ->first();

        if ($primaryAuthor) {
            Notification::firstOrCreate(
                [
                    "user_id" => $primaryAuthor->id,
                    "type" => "article.submitted",
                    "data" => json_encode(["article_id" => $article->id]),
                ],
                [
                    "title" => "Article Submitted",
                    "message" => "Your article '{$article->title}' has been submitted successfully.",
                ],
            );
        }

        // Co-authors (excluding primary)
        $coAuthors = $article->authors()
            ->wherePivot("is_primary", 0)
            ->get();

        foreach ($coAuthors as $coauthor) {
            Notification::firstOrCreate(
                [
                    "user_id" => $coauthor->id,
                    "type" => "article.submitted",
                    "data" => json_encode(["article_id" => $article->id]),
                ],
                [
                    "title" => "Article Submitted",
                    "message" => "Article '{$article->title}' was submitted by {$primaryAuthor?->name}.",
                ],
            );
        }

        // Admins
        User::where("role_id", Role::ADMINISTRATOR)
            ->get()
            ->each(function ($admin) use ($article, $primaryAuthor): void {
                Notification::firstOrCreate(
                    [
                        "user_id" => $admin->id,
                        "type" => "article.submitted",
                        "data" => json_encode(["article_id" => $article->id]),
                    ],
                    [
                        "title" => "New Article Submitted",
                        "message" => "Article '{$article->title}' was submitted by {$primaryAuthor?->name}.",
                    ],
                );
            });
    }
}
