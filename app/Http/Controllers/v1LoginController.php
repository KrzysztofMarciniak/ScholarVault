<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class v1LoginController extends Controller
{
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

        $user = $request->user();

        $token = $user->createToken("api-token")->plainTextToken;

        return response()->json([
            // 200
            "token" => $token,
            "user" => $user,
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
