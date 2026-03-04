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
        return $this->belongsToMany(User::class, "article_user")
            ->withTimestamps()
            ->where("role_id", Role::REVIEWER);
    }

    // Multiple authors
    public function authors()
    {
        return $this->belongsToMany(User::class, "article_user")
            ->withPivot("is_primary")
            ->withTimestamps();
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
}
