<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\Notification;

class StoreUserModifiedNotification
{
    /**
     * Create the event listener.
     */
    public function __construct() {}

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        Notification::create([
            "user_id" => $event->modifiedUser->id,
            "type" => "user.modified.by.admin",
            "title" => "Account Updated by Administrator",
            "message" => "Your account information has been updated by an administrator.",
            "data" => [
                "changed_fields" => $event->changedFields,
                "admin_id" => $event->admin->id,
            ],
        ]);
    }
}
