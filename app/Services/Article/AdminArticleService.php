<?php

declare(strict_types=1);

namespace App\Services\Article;

use App\Models\Article;
use App\Enums\ArticleStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use InvalidArgumentException;

class AdminArticleService extends BaseArticleService
{
    public function listReviewers(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $query = User::query()
            ->where("role_id", Role::REVIEWER);

        if (!empty($search)) {
            $query->where(function ($q) use ($search): void {
                $q->where("name", "like", "%$search%")
                    ->orWhere("email", "like", "%$search%");
            });
        }

        $reviewers = $query->paginate($perPage);

        $reviewers->getCollection()->transform(fn($user) => [
            "id" => $user->id,
            "name" => $user->name,
            "email" => $user->email,
            "affiliation" => $user->affiliation,
            "orcid" => $user->orcid,
            "deactivated" => (bool)$user->deactivated,
        ]);

        return $reviewers;
    }

    public function listArticles(int $perPage = 5, array $filters = []): LengthAwarePaginator
    {
        $query = Article::with([
            "authors" => fn($q) => $q->select([
                "users.id",
                "users.name",
                "users.email",
                "users.role_id",
                "users.affiliation",
                "users.bio",
                "users.deactivated",
                "users.orcid",
            ])->with("role"),
            "citations:id,title,doi",
            "citedBy:id,title,doi",
            "status:id,name",
            "reviewers:id,name,email,affiliation,orcid,deactivated", // <-- add reviewers
        ]);

        if (!empty($filters["status"])) {
            $query->where("status_id", $filters["status"]);
        }

        if (!empty($filters["search"])) {
            $search = $filters["search"];
            $query->where(
                fn($q) => $q->where("title", "like", "%$search%")
                    ->orWhere("abstract", "like", "%$search%"),
            );
        }

        $articles = $query->paginate($perPage);

        $articles->getCollection()->transform(fn($article) => [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "filename" => $article->filename,
            "file_type" => $article->file_type,
            "keywords" => $article->keywords,
            "status" => $article->status?->name,
            "doi" => $article->doi,

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

            "reviewers" => $article->reviewers->map(fn($r) => [
                "id" => $r->id,
                "name" => $r->name,
                "email" => $r->email,
                "affiliation" => $r->affiliation,
                "orcid" => $r->orcid,
                "deactivated" => (bool)$r->deactivated,
            ])->values(),
        ]);

        return $articles;
    }

    public function assignReviewers(int $articleId, array $reviewerIds): Article
    {
        $article = Article::findOrFail($articleId);

        foreach ($reviewerIds as $id) {
            $user = User::find($id);

            if (!$user || $user->role_id !== Role::REVIEWER) {
                throw new InvalidArgumentException("User {$id} is not a valid reviewer.");
            }
        }

        $article->reviewers()->syncWithoutDetaching($reviewerIds);

        $article->load("reviewers");

        return $article;
    }

    public function makeDecision(int $articleId, string $status): array
    {
        $article = Article::find($articleId);

        if (!$article) {
            return [
                'status' => 'error',
                'message' => 'Article not found',
            ];
        }

        $status = strtolower($status);
        if (!in_array($status, ['published', 'rejected_by_admin'], true)) {
            return [
                'status' => 'error',
                'message' => 'Invalid status. Only "published" or "rejected_by_admin" allowed.',
            ];
        }

        $newStatus = match($status) {
            'published' => ArticleStatus::PUBLISHED->value,
            'rejected_by_admin' => ArticleStatus::REJECTED_BY_ADMIN->value,
        };

        // Prevent illegal transitions
        if ($article->status_id === ArticleStatus::REJECTED->value && $newStatus === ArticleStatus::PUBLISHED->value) {
            return [
                'status' => 'error',
                'message' => 'Cannot publish a rejected article.',
            ];
        }

        if ($article->status_id === ArticleStatus::PUBLISHED->value && $newStatus === ArticleStatus::REJECTED_BY_ADMIN->value) {
            return [
                'status' => 'error',
                'message' => 'Cannot reject an already published article.',
            ];
        }

        $article->status_id = $newStatus;
        $article->save();

        return [
            'status' => 'success',
            'article_id' => $article->id,
            'new_status' => $article->status_id,
        ];
    }


}
