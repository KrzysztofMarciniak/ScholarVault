<?php

declare(strict_types=1);

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
        ];
    }

    protected function transformArticle(Article $article, bool $isAdmin = false, bool $detailed = false): array
    {
        $latestFile = $article->latestFileOfMany;

        $data = [
            "id" => $article->id,
            "title" => $article->title,
            "abstract" => $article->abstract,
            "doi" => $article->doi,
            "keywords" => $article->keywords,
            "status" => $article->status?->name,
            "filename" => $latestFile?->filename ?? $article->filename,
            "file_type" => $latestFile?->file_type ?? $article->file_type,
            "version_number" => $latestFile?->version_number,
            "created_at" => $article->created_at?->toDateTimeString(),

            "authors" => $article->authors->map(fn($a) => [
                "id" => $a->id,
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => (bool)($a->pivot->is_primary ?? false),
            ])->values(),

            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
                "url" => $c->url,
            ])->values(),
        ];

        if ($detailed) {
            $data["updated_at"] = $article->updated_at?->toDateTimeString();

            $data["reviewers"] = $article->reviewers->map(fn($r) => [
                "id" => $r->id,
                "name" => $r->name,
                "email" => $r->email,
                "affiliation" => $r->affiliation,
                "orcid" => $r->orcid,
                "deactivated" => (bool)$r->deactivated,
            ])->values();
        }

        if ($isAdmin) {
            $data["authors"] = $article->authors->map(fn($a) => [
                "id" => $a->id,
                "name" => $a->name,
                "email" => $a->email,
                "role_id" => $a->role_id,
                "role_name" => $a->role?->name,
                "affiliation" => $a->affiliation,
                "bio" => $a->bio,
                "deactivated" => (bool)$a->deactivated,
                "orcid" => $a->orcid,
                "is_primary" => (bool)$a->pivot->is_primary,
            ])->values();
        }

        return $data;
    }

    protected function transformArticlePublic(Article $article): array
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
            "citations" => $article->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
                "url" => $c->url,
            ])->values()->all(),
        ];
    }
}
