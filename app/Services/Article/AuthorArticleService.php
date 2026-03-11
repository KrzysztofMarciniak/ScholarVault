<?php

declare(strict_types=1);

namespace App\Services\Article;

use App\Enums\ArticleStatus;
use App\Events\ArticleSubmitted;
use App\Models\Article;
use App\Models\ArticleComment;
use Exception;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Http\UploadedFile as IlluminateUploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;

class AuthorArticleService extends BaseArticleService
{
    public function submitArticle(
        int $authorId,
        string $title,
        string $abstract,
        IlluminateUploadedFile $file,
        ?array $keywords = null,
    ): Article {
        $filename = $file->store("articles", "public");

        $article = Article::create([
            "title" => $title,
            "abstract" => $abstract,
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "keywords" => $keywords ?? [],
            "status_id" => ArticleStatus::SUBMITTED->value,
        ]);

        $article->authors()->attach($authorId, [
            "is_primary" => true,
        ]);

        event(new ArticleSubmitted($article));

        return $article;
    }

    public function listMyArticles(int $authorId, int $perPage = 10): LengthAwarePaginator
    {
        return Article::whereHas("authors", function ($query) use ($authorId): void {
            $query->where("user_id", $authorId);
        })
            ->leftJoin("article_statuses as s", "articles.status_id", "=", "s.id")
            ->select(
                "articles.id",
                "articles.title",
                "articles.abstract",
                "articles.doi",
                "s.name as status",
            )
            ->distinct("articles.id") // ensures duplicates from joins don’t break pagination
            ->paginate($perPage);
    }

    /**
     * Return formatted article array if $authorId is an author of the article,
     * otherwise null.
     */
    public function viewMyArticle(int $authorId, int $articleId): ?array
    {
        $article = Article::with([
            "authors:id,name,orcid",
            "citations:id,title,doi",
            "status:id,name",
        ])
            ->authoredBy($authorId)
            ->find($articleId);

        if (!$article) {
            return null;
        }

        return $article->toAuthorDetailArray();
    }

    public function submitRevision(int $authorId, int $articleId, array $data): array
    {
        return $data;
    }

    /**
     * List comments for an article authored by $authorId.
     *
     * @return Collection
     */
    public function listComments(int $articleId, int $authorId): EloquentCollection
    {
        $article = $this->viewMyArticle($authorId, $articleId);

        if (!$article) {
            return collect(); // empty Eloquent collection
        }

        return ArticleComment::with("user")
            ->where("article_id", $articleId)
            ->orderBy("created_at", "asc")
            ->get();
    }

    /**
     * Add a comment to an article authored by $authorId.
     */
    public function addComment(int $articleId, int $authorId, string $comment): ArticleComment
    {
        // Ensure the user is an author of the article
        $article = $this->viewMyArticle($authorId, $articleId);

        if (!$article) {
            throw new Exception("Unauthorized or article not found.");
        }

        return ArticleComment::create([
            "article_id" => $articleId,
            "user_id" => $authorId,
            "comment" => $comment,
        ]);
    }
}
