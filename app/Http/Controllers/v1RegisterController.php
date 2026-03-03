<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class v1RegisterController extends Controller
{
    public function help(): JsonResponse
    {
        return response()->json([
            "message" => "Register API usage instructions",
            "endpoints" => [
                "POST /api/v1/register" => [
                    "description" => "Create a new user. Registration can only assign the AUTHOR role. Email is sanitized to lowercase; password is trimmed.",
                    "required_fields" => [
                        "name" => "string, optional",
                        "email" => "string, valid email",
                        "password" => "string, required",
                        "affiliation" => "string, optional",
                        "orcid" => "16-digit number, optional",
                        "bio" => "string, optional",
                    ],
                    "example_request" => [
                        "name" => "John Doe",
                        "email" => "john@example.com",
                        "password" => "secret",
                        "affiliation" => "University X",
                        "orcid" => "0000123412341234",
                        "bio" => "Short bio here",
                    ],
                ],
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            "name" => ["sometimes", "string"],
            "email" => ["required", "email", "unique:users,email"],
            "password" => ["required", "string", "min:6"],
            "affiliation" => ["sometimes", "string"],
            "orcid" => ["sometimes", "string"],
            "bio" => ["sometimes", "string"],
        ]);

        $data["password"] = Hash::make($data["password"]);
        $data["role_id"] = Role::AUTHOR;
        $user = User::create($data);
        $token = $user->createToken("api-token")->plainTextToken;

        return response()->json([
            "token" => $token,
            "user" => $user,
        ]);
    }
}
