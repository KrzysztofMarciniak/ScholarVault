<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArticleFile extends Model
{
    protected $fillable = [
        "article_id",
        "uploaded_by",
        "filename",
        "file_type",
        "version_number",
    ];

    /**
     * The article this file belongs to.
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }

    /**
     * The user who uploaded this file.
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, "uploaded_by");
    }
}
