<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        "title",
        "abstract",
        "filename",
        "file_type",
        "keywords",
        "status_id",
        "doi",
    ];
    protected $casts = [
        "keywords" => "array",
    ];

    // Relationship to article status
    public function status()
    {
        return $this->belongsTo(ArticleStatus::class, "status_id");
    }

    public function reviewers()
    {
        return $this->belongsToMany(User::class, "article_reviewer")
            ->withTimestamps();
    }

    public function authors()
    {
        return $this->belongsToMany(User::class, "article_user");
    }

    // Articles this article cites
    public function citations()
    {
        return $this->belongsToMany(
            self::class,
            "article_citation",
            "article_id",       // this article
            "cited_article_id", // the referenced article
        )->withTimestamps();
    }

    // Articles that cite this article
    public function citedBy()
    {
        return $this->belongsToMany(
            self::class,
            "article_citation",
            "cited_article_id", // this article
            "article_id",       // citing article
        )->withTimestamps();
    }

    public function scopeAuthoredBy($query, int $authorId)
    {
        return $query->whereHas("authors", function ($q) use ($authorId): void {
            $q->where("user_id", $authorId);
        });
    }

    /**
     * Return array shaped for author single-article view.
     */
    public function toAuthorDetailArray(): array
    {
        return [
            "id" => $this->id,
            "title" => $this->title,
            "abstract" => $this->abstract,
            "filename" => $this->filename,
            "file_type" => $this->file_type,
            "keywords" => $this->keywords,
            "status" => $this->status?->name,
            "doi" => $this->doi,
            "authors" => $this->authors->map(fn($a) => [
                "name" => $a->name,
                "orcid" => $a->orcid,
                "is_primary" => (bool)($a->pivot->is_primary ?? false),
            ])->values()->all(),
            "citations" => $this->citations->map(fn($c) => [
                "id" => $c->id,
                "title" => $c->title,
                "doi" => $c->doi,
            ])->values()->all(),
        ];
    }

    public function comments()
    {
        return $this->hasMany(ArticleComment::class)
            ->latest();
    }
}
