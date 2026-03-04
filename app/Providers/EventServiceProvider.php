<?php

declare(strict_types=1);

namespace App\Providers;

use App\Events\UserModifiedByAdmin;
use App\Listeners\StoreUserModifiedNotification;
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
    ];

    public function boot(): void
    {
        parent::boot();
    }
}
