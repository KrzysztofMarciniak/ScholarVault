<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use Illuminate\Http\JsonResponse;

class v1TestController extends v1Controller
{
    public function help(ApiDocsService $docs): JsonResponse
    {
        $docs->addEndpoint([
            "method" => "GET",
            "path" => "/api/v1/test",
            "description" => "Check if the v1 API test endpoint works.",
            "roles" => [],
            "request_body" => null,
            "query_params" => [],
            "response_code" => 200,
            "available" => true,
            "response_data" => [
                "status" => "success",
                "message" => "v1 API test endpoint works!",
            ],
        ]);

        return response()->json(
            json_decode($docs->toJson(), true),
            200
        );
    }

    public function index(): JsonResponse
    {
        return response()->json([
            "status" => "success",
            "message" => "v1 API test endpoint works!",
        ], 200);
    }
}
