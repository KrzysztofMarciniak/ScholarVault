<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1TestMiddlewareSanitization extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/test/sanitization",
            description: "Requires 'email' and 'password', returns sanitized request data.",
            roles: ["public"],
            requestBody: [
                "email" => "string",
                "password" => "string",
            ],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: [
                "status" => "success",
                "unsanitized" => "raw request body",
                "sanitized" => [
                    "email" => "string",
                    "password" => "string",
                ],
            ],
        ));

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
