<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\Notification;

class StoreUserChangedPasswordNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(UserChangedPassword $event): void
    {
        Notification::create([
            "user_id" => $event->user->id,
            "type" => "user.changed.password",
            "title" => "Password Changed",
            "message" => "You have successfully changed your password.",
            "data" => [],
        ]);
    }
}
