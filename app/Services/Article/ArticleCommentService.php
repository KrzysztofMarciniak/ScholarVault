<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Article;
use App\Models\ArticleComment;
use Exception;
use Illuminate\Database\Eloquent\Collection;

class ArticleCommentService
{
    /**
     * Add a comment to an article by a user (author or reviewer).
     */
    public function addComment(int $articleId, int $userId, string $commentText): ArticleComment
    {
        $article = Article::with("authors", "reviewers")->findOrFail($articleId);

        if (!$this->userCanComment($article, $userId)) {
            throw new Exception("User cannot comment on this article.");
        }

        return $article->comments()->create([
            "user_id" => $userId,
            "comment" => $commentText,
        ]);
    }

    /**
     * List all comments of an article visible to the user.
     */
    public function listComments(int $articleId, int $userId): Collection
    {
        $article = Article::with("comments.user", "authors", "reviewers")->findOrFail($articleId);

        if (!$this->userCanComment($article, $userId)) {
            throw new Exception("User cannot view comments for this article.");
        }

        return $article->comments;
    }

    /**
     * Delete a comment (reviewer only).
     */
    public function deleteComment(int $commentId, int $userId): void
    {
        $comment = ArticleComment::with("article.reviewers")->findOrFail($commentId);

        if (!$this->userIsReviewer($comment->article, $userId)) {
            throw new Exception("Only reviewers can delete comments.");
        }

        $comment->delete();
    }

    /**
     * Check if a user can comment (author or reviewer).
     */
    protected function userCanComment(Article $article, int $userId): bool
    {
        return $this->userIsAuthor($article, $userId) || $this->userIsReviewer($article, $userId);
    }

    protected function userIsAuthor(Article $article, int $userId): bool
    {
        return $article->authors->pluck("id")->contains($userId);
    }

    protected function userIsReviewer(Article $article, int $userId): bool
    {
        return $article->reviewers->pluck("id")->contains($userId);
    }
}
