<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class v1LoginController extends Controller
{
    public function help(): JsonResponse
    {
        return response()->json([
            "message" => "Login API usage instructions",
            "endpoints" => [
                "POST /api/v1/login" => [
                    "description" => "Authenticate user with email and password, returns API token. Be mindful that we utlize trim sanitization on password, and we sanitize email to be lowercase.",
                    "required_fields" => [
                        "email" => "string, valid email",
                        "password" => "string, required",
                    ],
                    "example_request" => [
                        "email" => "user@example.com",
                        "password" => "secret",
                    ],
                ],
                "POST /api/v1/login/logout" => [
                    "description" => "Revoke current API token, logs user out",
                    "headers" => ["Authorization: Bearer <token>"],
                ],
            ],
        ]);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            "email" => ["required", "email"],
            "password" => ["required"],
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json([
                "message" => "Invalid credentials",
            ], 401);
        }

        $user = $request->user()->load("role");

        if ($user->deactivated) {
            Auth::logout();

            return response()->json([
                "message" => "User account is deactivated",
            ], 403);
        }

        $token = $user->createToken("api-token")->plainTextToken;

        return response()->json([
            "token" => $token,
            "user" => [
                "id" => $user->id,
                "name" => $user->name,
                "email" => $user->email,
                "role" => $user->role?->name,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            "message" => "Logged out successfully",
        ]);
    }
}
