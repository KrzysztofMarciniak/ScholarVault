<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ArticleStatus extends Model
{
    public $timestamps = false;
    protected $table = "article_statuses";
    protected $fillable = [
        "name",
    ];

    public function articles()
    {
        return $this->hasMany(Article::class, "status_id");
    }
}
