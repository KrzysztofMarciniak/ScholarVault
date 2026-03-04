<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\UserChangedPassword;
use App\Events\UserModifiedByAdmin;
use App\Events\UserUpdatedSelf;
use App\Listeners\StoreUserChangedPasswordNotification;
use App\Listeners\StoreUserModifiedNotification;
use App\Listeners\StoreUserUpdatedSelfNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event listener mappings.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        UserModifiedByAdmin::class => [
            StoreUserModifiedNotification::class,
        ],
        UserUpdatedSelf::class => [
            StoreUserUpdatedSelfNotification::class,
        ],
        UserChangedPassword::class => [
            StoreUserChangedPasswordNotification::class,
        ],
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
