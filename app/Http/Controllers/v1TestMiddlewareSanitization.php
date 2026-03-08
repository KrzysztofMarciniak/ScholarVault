<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1TestMiddlewareSanitization extends v1Controller
{
    public function help(ApiDocsService $docs): JsonResponse
    {
        $docs->addEndpoints([
            [
                "method" => "POST",
                "path" => "/api/v1/test/sanitization",
                "description" => "Requires 'email' and 'password', returns sanitized request data.",
                "roles" => ["public"],
                "request_body" => [
                    "email" => "string",
                    "password" => "string",
                ],
                "query_params" => [],
                "response_code" => 200,
                "available" => true,
                "response_data" => [
                    "status" => "success",
                    "unsanitized" => "raw request body",
                    "sanitized" => [
                        "email" => "string",
                        "password" => "string",
                    ],
                ],
            ],
        ]);

        return response()->json($docs->getEndpoints(), 200);
    }

    public function index(Request $request): JsonResponse
    {
        return response()->json([
            "status" => "success",
            "unsanitized" => $request->getContent(),
            "sanitized" => $request->only(["email", "password"]),
        ], 200);
    }
}
