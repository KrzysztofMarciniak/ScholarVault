<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class v1RegisterController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/register",
            description: "Create a new user. Registration can only assign the AUTHOR role. Email is sanitized to lowercase; password is trimmed.",
            roles: ["none"],
            requestBody: [
                "name" => "string, required",
                "email" => "string, valid email",
                "password" => "string, required",
                "affiliation" => "string, optional",
                "orcid" => "16-digit number, optional",
                "bio" => "string, optional",
            ],
            queryParams: [],
            responseCode: 201,
            available: true,
            responseData: [
                "example_request" => [
                    "name" => "John Doe",
                    "email" => "john@example.com",
                    "password" => "secret",
                    "affiliation" => "University X",
                    "orcid" => "0000123412341234",
                    "bio" => "Short bio here",
                ],
            ],
        ));

        return response()->json($docs->getEndpoints());
    }

    public function register(Request $request, RegistrationService $registration): JsonResponse
    {
        $data = $request->validate([
            "name" => ["required", "string", "max:255"],
            "email" => ["required", "email", "unique:users,email"],
            "password" => ["required", "string", "min:8"],
            "affiliation" => ["sometimes", "string", "max:255"],
            "orcid" => ["sometimes", "string", "max:32"],
            "bio" => ["sometimes", "string"],
        ]);

        $result = $registration->register($data);

        return response()->json($result, 201);
    }
}
