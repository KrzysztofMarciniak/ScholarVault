<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;
    use HasFactory;
    use Notifiable;

    /*
    |--------------------------------------------------------------------------
    | Mass Assignable
    |--------------------------------------------------------------------------
    */

    protected $fillable = [
        "name", // nullable
        "email",
        "password",
        "role_id",
        "affiliation", // nullable
        "orcid", // nullable
        "bio", // nullable
        "deactivated",
    ];

    /*
    |--------------------------------------------------------------------------
    | Hidden Attributes
    |--------------------------------------------------------------------------
    */

    protected $hidden = [
        "password",
        "remember_token",
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function articles()
    {
        return $this->hasMany(Article::class, "author_id");
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, "reviewer_id");
    }

    /*
    |--------------------------------------------------------------------------
    | Role Helpers
    |--------------------------------------------------------------------------
    */

    public function isAuthor(): bool
    {
        return $this->role_id === Role::AUTHOR;
    }

    public function isReviewer(): bool
    {
        return $this->role_id === Role::REVIEWER;
    }

    public function isAdmin(): bool
    {
        return $this->role_id === Role::ADMINISTRATOR;
    }

    /*
    |--------------------------------------------------------------------------
    | Casts
    |--------------------------------------------------------------------------
    */

    protected function casts(): array
    {
        return [
            "email_verified_at" => "datetime",
            "password" => "hashed",
        ];
    }
}
