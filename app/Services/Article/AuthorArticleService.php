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

        // create article
        $article = Article::create([
            "title" => $title,
            "abstract" => $abstract,
            "filename" => $filename, // legacy, optional
            "file_type" => $file->getClientOriginalExtension(), // legacy, optional
            "keywords" => $keywords ?? [],
            "status_id" => ArticleStatus::SUBMITTED->value,
        ]);

        // attach author
        $article->authors()->attach($authorId, ["is_primary" => true]);

        // create first file (version 1)
        $article->files()->create([
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "uploaded_by" => $authorId,
            "notes" => null,
            "version_number" => 1,
        ]);

        event(new ArticleSubmitted($article));

        return $article;
    }

    public function listMyArticles(int $authorId, int $perPage = 10): LengthAwarePaginator
    {
        return Article::whereHas("authors", fn($q) => $q->where("user_id", $authorId))
            ->leftJoin("article_statuses as s", "articles.status_id", "=", "s.id")
            ->select(
                "articles.id",
                "articles.title",
                "articles.abstract",
                "articles.doi",
                "s.name as status",
            )
            ->distinct("articles.id")
            ->paginate($perPage);
    }

    public function viewMyArticle(int $authorId, int $articleId): ?array
    {
        $article = Article::with([
            "authors:id,name,orcid",
            "citations:id,title,doi",
            "status:id,name",
            "files.uploader:id,name",
        ])
        ->authoredBy($authorId)
        ->find($articleId);

        return $article?->toAuthorDetailArray();
    }

    public function listComments(int $articleId, int $authorId): EloquentCollection
    {
        if (!$this->viewMyArticle($authorId, $articleId)) {
            return collect();
        }

        return ArticleComment::with("user")
            ->where("article_id", $articleId)
            ->orderBy("created_at", "asc")
            ->get();
    }

    public function addComment(int $articleId, int $authorId, string $comment): ArticleComment
    {
        if (!$this->viewMyArticle($authorId, $articleId)) {
            throw new Exception("Unauthorized or article not found.");
        }

        return ArticleComment::create([
            "article_id" => $articleId,
            "user_id" => $authorId,
            "comment" => $comment,
        ]);
    }

    public function submitRevision(int $authorId, int $articleId, array $data): array
    {
        $article = Article::authoredBy($authorId)->find($articleId);

        if (!$article) {
            throw new Exception("Unauthorized or article not found.");
        }

        // block revisions on finalized articles
        if (in_array($article->status_id, [
            ArticleStatus::ACCEPTED->value,
            ArticleStatus::PUBLISHED->value,
        ], true)) {
            throw new Exception("Article is finalized (accepted or published). Revisions are not allowed.");
        }

        /** @var IlluminateUploadedFile $file */
        $file = $data["file"] ?? null;
        $notes = $data["notes"] ?? null;

        if (!$file || !$file->isValid()) {
            throw new Exception("Invalid file uploaded.");
        }

        $filename = $file->store("articles", "public");

        $lastFile = $article->latestFile();
        $nextVersion = $lastFile ? ($lastFile->version_number + 1) : 1;

        $revision = $article->files()->create([
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "uploaded_by" => $authorId,
            "notes" => $notes,
            "version_number" => $nextVersion,
        ]);

        // optional: update legacy fields
        $article->filename = $revision->filename;
        $article->file_type = $revision->file_type;
        $article->save();

        return [
            "id" => $revision->id,
            "article_id" => $article->id,
            "filename" => $revision->filename,
            "file_type" => $revision->file_type,
            "version_number" => $revision->version_number,
            "notes" => $revision->notes,
            "uploaded_at" => $revision->created_at,
        ];
    }
}
