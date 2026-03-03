<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1TestMiddlewareSanitization extends v1Controller
{
    public function help(): JsonResponse
    {
        return $this->helpResponse([
            "message" => "GET /api/v1/test/sanitization/help → returns usage instructions",
            "POST /api/v1/test/sanitization → requires 'email' and 'password', returns sanitized input. Please do not use your real data.",
            "example_request" => [
                "email" => "user@example.com",
                "password" => "secret",
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            "status" => "success",
            "unsanitized" => $request->getContent(),
            "sanitized" => $request->only(["email", "password"]),
        ]);
    }
}
