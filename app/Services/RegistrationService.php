<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RegistrationService
{
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            $data["role_id"] = Role::AUTHOR;

            /** @var User $user */
            $user = User::create($data);

            $token = $user->createToken("api-token")->plainTextToken;

            return [
                "token" => $token,
                "user" => $user->toProfileArray(),
            ];
        });
    }
}
