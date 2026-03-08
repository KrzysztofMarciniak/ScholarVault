<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Events\UserModifiedByAdmin;
use App\Models\User;

class AdminUserService extends BaseUserService
{
    public function create(array $data): User
    {
        $user = User::createFromAdmin($data);

        return $user;
    }

    public function update(User $user, array $data): User
    {
        $user->updateFromAdmin($data);

        $dirtyKeys = $user->getDirtyKeys();

        if (!empty($dirtyKeys)) {
            event(new UserModifiedByAdmin($this->actor, $user, $dirtyKeys));
        }

        return $user;
    }
}
