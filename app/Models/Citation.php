<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Citation extends Model
{
    use HasFactory;

    protected $fillable = [
        "title",
        "authors",
        "doi",
        "url",
        "published_at",
        "availability_status",
        "on_site_path",
        "article_id",
    ];
    protected $casts = [
        "published_at" => "datetime",
    ];

    /**
     * Get a human-readable label for the availability status.
     */
    public function getAvailabilityLabel(): string
    {
        return match ($this->availability_status) {
            "on_site" => "Available on Site",
            "external_link" => "External Link",
            "doi_only" => "DOI Link",
            default => "Unknown",
        };
    }

    /**
     * Check if citation is available on site.
     */
    public function isOnSite(): bool
    {
        return $this->availability_status === "on_site";
    }

    /**
     * Check if citation has an external link.
     */
    public function hasExternalLink(): bool
    {
        return $this->availability_status === "external_link";
    }

    /**
     * Check if citation only has DOI available.
     */
    public function hasDOIOnly(): bool
    {
        return $this->availability_status === "doi_only";
    }

    /**
     * Scope to get only on-site citations.
     */
    public function scopeOnSite($query)
    {
        return $query->where("availability_status", "on_site");
    }

    /**
     * Scope to get only external link citations.
     */
    public function scopeWithExternalLink($query)
    {
        return $query->where("availability_status", "external_link");
    }

    /**
     * Scope to get only DOI-only citations.
     */
    public function scopeDoiOnly($query)
    {
        return $query->where("availability_status", "doi_only");
    }
    public function delete(): bool
    {
        return parent::delete();
    }
    public function article()
    {
        return $this->belongsTo(\App\Models\Article::class);
    }
}
