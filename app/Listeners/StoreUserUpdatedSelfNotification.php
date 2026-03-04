<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\Notification;

class StoreUserUpdatedSelfNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(UserUpdatedSelf $event): void
    {
        Notification::create([
            "user_id" => $event->user->id,
            "type" => "user.updated.self",
            "title" => "Profile Updated",
            "message" => "You have successfully updated your profile.",
            "data" => [
                "changed_fields" => $event->changedFields,
            ],
        ]);
    }
}
