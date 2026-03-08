<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Models\User;

class UserServiceFactory
{
    public static function make(User $actor): BaseUserService
    {
        if ($actor->isAdministrator()) {
            return new AdminUserService($actor);
        }

        return new AnyUserService($actor);
    }
}
