<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash;
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
    | Casts
    |--------------------------------------------------------------------------
    */
    protected $casts = [
        "email_verified_at" => "datetime",
        "password" => "hashed",
        "deactivated" => "boolean",
    ];

    /*
    |--------------------------------------------------------------------------
    | Model Helpers / Actions
    |--------------------------------------------------------------------------
    */

    public static function createFromAdmin(array $attrs): self
    {
        return self::create($attrs); // password will auto-hash
    }

    public static function searchUsers(string $query, bool $includeDeactivated = false, bool $withRole = false)
    {
        $q = self::query()->search($query);

        if (!$includeDeactivated) {
            $q->active();
        }

        if ($withRole) {
            $q->withRoleName();
        }

        return $q->paginate(15);
    }

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
    | Mutators
    |--------------------------------------------------------------------------
    */
    public function setPasswordAttribute(?string $password): void
    {
        if ($password === null) {
            return;
        }
        $this->attributes["password"] = Hash::needsRehash($password) ? Hash::make($password) : $password;
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

    public function isAdministrator(): bool
    {
        return $this->role_id === Role::ADMINISTRATOR;
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */
    public function scopeActive($query)
    {
        return $query->where("deactivated", false);
    }

    public function scopeSearch($query, string $q)
    {
        $like = "%{$q}%";

        return $query->where(function ($qb) use ($like): void {
            $qb->where("name", "like", $like)
                ->orWhere("email", "like", $like)
                ->orWhere("affiliation", "like", $like);
        });
    }

    public function scopeWithRoleName($query)
    {
        return $query->with(["role:id,name"]);
    }

    public function updateFromAdmin(array $attrs): self
    {
        $this->fill($attrs)->save();

        return $this;
    }

    public function updateProfile(array $attrs): self
    {
        $this->fill($attrs)->save();

        return $this;
    }

    public function changePassword(string $newPassword): self
    {
        $this->password = $newPassword; // uses mutator
        $this->save();

        return $this;
    }

    public function verifyPassword(string $plain): bool
    {
        return Hash::check($plain, $this->password);
    }

    public function deactivate(): self
    {
        $this->deactivated = true;
        $this->save();

        return $this;
    }

    public function activate(): self
    {
        $this->deactivated = false;
        $this->save();

        return $this;
    }

    public function canBeDeactivated(): bool
    {
        if (!$this->isAdministrator()) {
            return true;
        }

        $activeAdmins = self::where("role_id", Role::ADMINISTRATOR)
            ->where("deactivated", false)
            ->count();

        return $activeAdmins > 1;
    }

    public function assignRole(int $roleId): self
    {
        $this->role_id = $roleId;
        $this->save();

        return $this;
    }

    public function revokeAllTokens(): void
    {
        $this->tokens()->delete();
    }

    public function getDirtyKeys(): array
    {
        return array_keys($this->getDirty());
    }

    /*
    |--------------------------------------------------------------------------
    | Convenience Accessors
    |--------------------------------------------------------------------------
    */
    public function getDisplayNameAttribute(): string
    {
        return $this->name ?: $this->email;
    }

    public function loadRoleMinimal(): self
    {
        $this->load(["role:id,name"]);

        return $this;
    }

    public function toListArray(): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "orcid" => $this->orcid,
            "role" => $this->role?->name,
        ];
    }

    public function toSearchArray(bool $includeRole = false): array
    {
        $base = [
            "id" => $this->id,
            "name" => $this->name,
            "orcid" => $this->orcid,
        ];

        if ($includeRole) {
            $base["email"] = $this->email;
            $base["role"] = $this->role?->name;
            $base["deactivated"] = $this->deactivated;
        }

        return $base;
    }

    public function toProfileArray(): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "email" => $this->email,
            "role_id" => $this->role_id,
            "role" => $this->role?->name,
            "affiliation" => $this->affiliation,
            "orcid" => $this->orcid,
            "bio" => $this->bio,
            "deactivated" => $this->deactivated,
        ];
    }
}
