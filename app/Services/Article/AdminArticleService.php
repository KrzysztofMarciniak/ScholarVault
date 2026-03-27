<?php

declare(strict_types=1);

namespace App\Services\Article;

use App\Enums\ArticleStatus;
use App\Models\Article;
use App\Models\Role;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use InvalidArgumentException;

class AdminArticleService extends BaseArticleService
{

    public function listArticles(int $perPage = 5, array $filters = []): LengthAwarePaginator
    {
        $query = Article::with([
            "authors.role",
            "citations:id,title,doi,article_id",
            "status:id,name",
            "reviewers:id,name,email,affiliation,orcid,deactivated",
            "latestFileOfMany",
        ]);

        $query = $this->applyArticleFilters($query, $filters);

        $paginator = $query->paginate($perPage);

        return $paginator->through(fn(Article $article) => $this->transformArticle($article));
    }

    public function listReviewers(int $perPage = 10, ?string $search = null): LengthAwarePaginator
    {
        $query = User::query()->where("role_id", Role::REVIEWER);

        if ($search) {
            $query->where(
                fn($q) => $q
                    ->where("name", "like", "%$search%")
                    ->orWhere("email", "like", "%$search%"),
            );
        }

        return $query->paginate($perPage)
            ->through(fn($user) => [
                "id" => $user->id,
                "name" => $user->name,
                "email" => $user->email,
                "affiliation" => $user->affiliation,
                "orcid" => $user->orcid,
                "deactivated" => (bool)$user->deactivated,
            ]);
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

        return $article->load("reviewers");
    }

    public function makeDecision(int $articleId, string $status): array
    {
        $article = Article::find($articleId);

        if (!$article) {
            return ["status" => "error", "message" => "Article not found"];
        }

        $status = strtolower($status);

        if (!in_array($status, ["published", "rejected_by_admin"], true)) {
            return ["status" => "error", "message" => 'Invalid status. Only "published" or "rejected_by_admin" allowed.'];
        }

        $newStatus = match ($status) {
            "published" => ArticleStatus::PUBLISHED->value,
            "rejected_by_admin" => ArticleStatus::REJECTED_BY_ADMIN->value,
        };

        if (
            ($article->status_id === ArticleStatus::REJECTED->value && $newStatus === ArticleStatus::PUBLISHED->value) ||
            ($article->status_id === ArticleStatus::PUBLISHED->value && $newStatus === ArticleStatus::REJECTED_BY_ADMIN->value)
        ) {
            return ["status" => "error", "message" => "Invalid status transition."];
        }

        $article->status_id = $newStatus;
        $article->save();

        return [
            "status" => "success",
            "article_id" => $article->id,
            "new_status" => $article->status_id,
        ];
    }

    protected function applyArticleFilters(Builder $query, array $filters): Builder
    {
        if (!empty($filters["status"])) {
            $query->where("status_id", $filters["status"]);
        }

        if (!empty($filters["search"])) {
            $search = $filters["search"];
            $query->where(function (Builder $q) use ($search): void {
                $q->where("title", "like", "%$search%")
                    ->orWhere("abstract", "like", "%$search%");
            });
        }

        $query->orderByDesc("created_at");

        return $query;
    }
}
