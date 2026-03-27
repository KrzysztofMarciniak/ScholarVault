<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    public function status()
    {
        return $this->belongsTo(ArticleStatus::class, "status_id");
    }

    public function reviewers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, "article_reviewer")
            ->withTimestamps();
    }

    public function authors(): BelongsToMany
    {
        return $this->belongsToMany(User::class, "article_user");
    }

    public function citations(): HasMany
    {
        return $this->hasMany(Citation::class, "article_id");
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ArticleComment::class)->latest();
    }

    public function files(): HasMany
    {
        return $this->hasMany(ArticleFile::class)->orderByDesc("version_number");
    }

    public function latestFile(): ?ArticleFile
    {
        return $this->files()->first();
    }

    public function latestFileOfMany(): HasOne
    {
        return $this->hasOne(ArticleFile::class)->latestOfMany("version_number");
    }

    public function scopeAuthoredBy($query, int $authorId)
    {
        return $query->whereHas("authors", fn($q) => $q->where("user_id", $authorId));
    }

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
                "url" => $c->url,
            ])->values()->all(),
            "files" => $this->files->map(fn($f) => [
                "id" => $f->id,
                "filename" => $f->filename,
                "file_type" => $f->file_type,
                "version_number" => $f->version_number,
                "uploaded_by" => $f->uploader?->name,
                "created_at" => $f->created_at,
            ])->values()->all(),
        ];
    }
}
