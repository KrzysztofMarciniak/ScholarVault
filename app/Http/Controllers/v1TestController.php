<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use Illuminate\Http\JsonResponse;

class v1TestController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/test",
            description: "Check if the v1 API test endpoint works.",
            roles: [],
            requestBody: [],
            queryParams: [],
            responseCode: 200,
            responseData: [
                "status" => "success",
                "message" => "v1 API test endpoint works!",
            ],
            available: true,
        ));

        return response()->json($docs->getEndpoints(), 200);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            "status" => "success",
            "message" => "v1 API test endpoint works!",
        ], 200);
    }
}
