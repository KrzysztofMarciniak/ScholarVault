<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Support\Facades\Auth;
use App\Models\User;
use RuntimeException;

class AuthService
{
    public function login(array $credentials): array
    {
        if (!Auth::attempt($credentials)) {
            throw new RuntimeException("Invalid credentials");
        }

        /** @var User $user */
        $user = Auth::user()->load("role");

        if ($user->deactivated) {
            Auth::logout();
            throw new RuntimeException("User account is deactivated", 403);
        }

        $token = $user->createToken("api-token")->plainTextToken;

        return [
            "token" => $token,
            "user" => $user->toProfileArray(),
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }
}
