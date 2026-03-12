<?php

namespace App\Services\Article;

use App\Models\Article;

trait ArticleTransformTrait
{
    protected function transformArticleList(Article $article): array
    {
        $latestFile = $article->latestFileOfMany ?? null;

        return [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "doi" => $article->doi,
            "keywords" => $article->keywords,
            "file_type" => $latestFile?->file_type ?? $article->file_type,
            "filename" => $latestFile?->filename ?? $article->filename,
            "version_number" => $latestFile?->version_number,
            "created_at" => $article->created_at?->toDateTimeString(),
            "authors" => $article->authors->map(fn($a) => [
                "id" => $a->id,
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => (bool)($a->pivot->is_primary ?? false),
            ])->values()->all(),
            "citations_count" => $article->citations_count ?? $article->citations->count(),
            "cited_by_count" => $article->cited_by_count ?? $article->citedBy->count(),
        ];
    }

    protected function transformArticleDetail(Article $article): array
    {
        $latestFile = $article->latestFileOfMany ?? null;

        return [
            ...$this->transformArticleList($article),
            "status" => $article->status?->name,
            "updated_at" => $article->updated_at?->toDateTimeString(),
            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values()->all(),
            "cited_by" => $article->citedBy->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values()->all(),
            "reviewers" => $article->reviewers->map(fn($r) => [
                "id" => $r->id,
                "name" => $r->name,
                "email" => $r->email,
                "affiliation" => $r->affiliation,
                "orcid" => $r->orcid,
                "deactivated" => (bool)$r->deactivated,
            ])->values()->all(),
        ];
    }
}
