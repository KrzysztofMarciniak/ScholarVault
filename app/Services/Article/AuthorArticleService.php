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
    /**
     * Submit a new article.
     */
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

        $article->authors()->attach($authorId, ["is_primary" => true]);

        $article->files()->create([
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "uploaded_by" => $authorId,
            "version_number" => 1,
        ]);

        event(new ArticleSubmitted($article));

        return $article;
    }

    /**
     * List articles authored by the given user.
     */
    public function listMyArticles(int $authorId, int $perPage = 10): LengthAwarePaginator
    {
        return Article::authoredBy($authorId)
            ->with("status:id,name")
            ->withCount(["citations", "citedBy"])
            ->paginate($perPage)
            ->through(fn(Article $article) => [
                "id" => $article->id,
                "title" => $article->title,
                "abstract" => $article->abstract,
                "doi" => $article->doi,
                "status" => $article->status?->name,
                "citations_count" => $article->citations_count ?? 0,
                "cited_by_count" => $article->cited_by_count ?? 0,
            ]);
    }

    /**
     * View detailed article for author.
     */
    public function viewMyArticle(int $authorId, int $articleId): ?array
    {
        $article = Article::with([
            "authors:id,name,orcid",
            "citations:id,title,doi",
            "status:id,name",
            "files.uploader:id,name",
        ])->authoredBy($authorId)->find($articleId);

        if (!$article) {
            return null;
        }

        return [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "doi" => $article->doi,
            "status" => $article->status?->name,
            "authors" => $article->authors->map(fn($a) => [
                "id" => $a->id,
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => (bool)($a->pivot->is_primary ?? false),
            ])->values(),
            "files" => $article->files->map(fn($f) => [
                "id" => $f->id,
                "filename" => $f->filename,
                "file_type" => $f->file_type,
                "version_number" => $f->version_number,
                "uploaded_by" => $f->uploaded_by,
                "uploaded_at" => $f->created_at,
                "notes" => $f->notes,
            ])->values(),
            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values(),
        ];
    }

    /**
     * List comments on an article authored by the user.
     */
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

    /**
     * Add a comment to an article authored by the user.
     */
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

    /**
     * Submit a revision for an authored article.
     */
    public function submitRevision(int $authorId, int $articleId, array $data): array
    {
        $article = Article::authoredBy($authorId)->find($articleId);

        if (!$article) {
            throw new Exception("Unauthorized or article not found.");
        }

        if (in_array($article->status_id, [ArticleStatus::ACCEPTED->value, ArticleStatus::PUBLISHED->value], true)) {
            throw new Exception("Article is finalized (accepted or published). Revisions are not allowed.");
        }

        $file = $data["file"] ?? null;
        $notes = $data["notes"] ?? null;

        if (!$file || !$file->isValid()) {
            throw new Exception("Invalid file uploaded.");
        }

        $filename = $file->store("articles", "public");
        $lastFile = $article->latestFile();
        $nextVersion = $lastFile ? $lastFile->version_number + 1 : 1;

        $revision = $article->files()->create([
            "filename" => $filename,
            "file_type" => $file->getClientOriginalExtension(),
            "uploaded_by" => $authorId,
            "notes" => $notes,
            "version_number" => $nextVersion,
        ]);

        // Update legacy fields
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
