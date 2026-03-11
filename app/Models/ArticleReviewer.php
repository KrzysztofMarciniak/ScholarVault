<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArticleReviewer extends Model
{
    use HasFactory;

    protected $table = "article_reviewer";
    protected $fillable = [
        "article_id",
        "user_id",
    ];
}
