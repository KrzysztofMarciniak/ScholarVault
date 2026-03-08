<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Models\User;

abstract class BaseUserService
{
    public function __construct(
        protected User $actor,
    ) {}

    abstract public function create(array $data): User;

    abstract public function update(User $user, array $data): User;
}
