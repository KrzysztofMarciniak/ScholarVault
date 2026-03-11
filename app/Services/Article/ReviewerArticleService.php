<?php

declare(strict_types=1);

namespace App\Services\Article;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class ReviewerArticleService extends BaseArticleService
{
    public function assignedArticles(User $user, int $perPage = 10): LengthAwarePaginator
    {
        $articles = Article::whereHas("reviewers", fn($q) => $q->where("users.id", $user->id))
            ->with(["authors", "status", "citations", "citedBy"])
            ->orderByDesc("created_at")
            ->paginate($perPage);

        $articles->getCollection()->transform(fn($article) => [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "filename" => $article->filename,
            "file_type" => $article->file_type,
            "keywords" => $article->keywords,
            "doi" => $article->doi,
            "status" => $article->status?->name,

            "authors" => $article->authors->map(fn($author) => [
                "id" => $author->id,
                "name" => $author->name,
                "email" => $author->email,
                "role_id" => $author->role_id,
                "role_name" => $author->role?->name,
                "affiliation" => $author->affiliation,
                "bio" => $author->bio,
                "deactivated" => (bool)$author->deactivated,
                "orcid" => $author->orcid,
                "is_primary" => (bool)$author->pivot->is_primary,
            ])->values(),

            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),

            "cited_by" => $article->citedBy->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),
        ]);

        return $articles;
    }

    public function assignedArticle(User $user, int $id): ?array
    {
        $article = Article::with([
            "authors",
            "status",
            "citations",
            "citedBy",
            "comments.user",
        ])
            ->whereHas("reviewers", fn($q) => $q->where("users.id", $user->id))
            ->find($id);

        if (!$article) {
            return null;
        }

        return [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "filename" => $article->filename,
            "file_type" => $article->file_type,
            "keywords" => $article->keywords,
            "doi" => $article->doi,
            "status" => $article->status?->name,

            "authors" => $article->authors->map(fn($author) => [
                "id" => $author->id,
                "name" => $author->name,
                "email" => $author->email,
                "role_id" => $author->role_id,
                "role_name" => $author->role?->name,
                "affiliation" => $author->affiliation,
                "bio" => $author->bio,
                "deactivated" => (bool)$author->deactivated,
                "orcid" => $author->orcid,
                "is_primary" => (bool)$author->pivot->is_primary,
            ])->values(),

            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),

            "cited_by" => $article->citedBy->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),

            "comments" => $article->comments->map(fn($comment) => [
                "id" => $comment->id,
                "comment" => $comment->comment,
                "created_at" => $comment->created_at,
                "user" => [
                    "id" => $comment->user->id,
                    "name" => $comment->user->name,
                    "email" => $comment->user->email,
                ],
            ])->values(),
        ];
    }

    public function submitReview(User $user, int $articleId, array $data): Review
    {
        $article = Article::with("reviewers")->findOrFail($articleId);

        // Check reviewer assignment
        if (!$article->reviewers->contains($user->id)) {
            abort(403, "You are not assigned to review this article.");
        }

        // Validate data (could also be done externally)
        $validated = validator($data, [
            "recommendation" => "required|string|in:accept,reject,revision_requested",
            "comments" => "required|string|max:5000",
        ])->validate();

        // Create or update review
        $review = Review::updateOrCreate(
            [
                "article_id" => $article->id,
                "reviewer_id" => $user->id,
            ],
            $validated,
        );

        event(new ReviewSubmitted($review));

        return $review->load("reviewer");
    }

    public function submitReviewDecision(int $reviewerId, int $articleId, string $decision): Article
    {
        $article = Article::with("reviewers")->findOrFail($articleId);

        // upewnij się, że recenzent jest przypisany
        if (!$article->reviewers->contains($reviewerId)) {
            throw new InvalidArgumentException("You are not assigned to review this article.");
        }

        $status = match($decision) {
            "accepted" => ArticleStatus::ACCEPTED,
            "rejected" => ArticleStatus::REJECTED,
            default => throw new InvalidArgumentException("Invalid decision"),
        };

        $article->status_id = $status->value;
        $article->save();

        return $article->load(["authors", "status", "citations", "citedBy", "comments.user"]);
    }
}
