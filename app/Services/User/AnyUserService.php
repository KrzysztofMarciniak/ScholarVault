<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Events\UserChangedPassword;
use App\Events\UserUpdatedSelf;
use App\Models\User;
use RuntimeException;

class AnyUserService extends BaseUserService
{
    public function create(array $data): User
    {
        throw new RuntimeException("Regular users cannot create users.");
    }

    public function update(User $user, array $data): User
    {
        $user->fill($data);

        $dirtyKeys = array_keys($user->getDirty());

        if (!empty($dirtyKeys)) {
            $user->save();
            event(new UserUpdatedSelf($user, $dirtyKeys));
        }

        return $user;
    }

    public function changePassword(User $user, string $newPassword): User
    {
        $user->changePassword($newPassword);
        event(new UserChangedPassword($user));

        return $user;
    }

    public function deactivate(User $user): User
    {
        if ($user->deactivated) {
            throw new RuntimeException("Account not found or already deactivated.");
        }

        $user->deactivate();
        $user->revokeAllTokens();

        return $user;
    }
}
