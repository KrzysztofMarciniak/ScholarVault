<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class Notification extends Model
{
    protected $table = 'notifications';
    protected $fillable = [
        "user_id",
        "type",
        "title",
        "message",
        "data",
        "read_at",
    ];
    protected $casts = [
        "data" => "array",
        "read_at" => "datetime",
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get notifications for a user
     *
     * @param \App\Models\User $user
     * @param bool $onlyUnread
     * @return \Illuminate\Support\Collection
     */
    public static function forUser($user, bool $onlyUnread = false): Collection
    {
        $query = self::where('user_id', $user->id)
            ->orderByDesc('created_at');

        if ($onlyUnread) {
            $query->whereNull('read_at');
        }

        return $query->get(['id','type','title','message','data','read_at','created_at']);
    }

    /**
     * Get count of unread notifications for a user
     *
     * @param \App\Models\User $user
     * @return int
     */
    public static function unreadCount($user): int
    {
        return self::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }
}
