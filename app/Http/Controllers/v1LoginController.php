<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
use App\Services\AuthService;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class v1LoginController extends v1Controller
{
    public function help(ApiDocs $docs): JsonResponse
    {
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/login",
            description: "Authenticate user with email and password, returns API token. Password is trimmed, email is lowercase.",
            roles: ["none"],
            requestBody: [
                "email" => "string, valid email",
                "password" => "string, required",
            ],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: [
                "token" => "string",
            ],
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/login/logout",
            description: "Revoke current API token, logs user out",
            roles: ["user"],
            requestBody: [],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: [
                "message" => "Logged out successfully",
            ],
        ));

        return response()->json($docs->getEndpoints());
    }

    public function login(Request $request, AuthService $service): JsonResponse
    {
        $data = $request->validate([
            "email" => ["required", "email"],
            "password" => ["required"],
        ]);

        try {
            $result = $service->login($data);
        } catch (AuthenticationException $e) {
            return response()->json(["message" => "Invalid credentials"], 401);
        } catch (RuntimeException $e) {
            return response()->json(["message" => $e->getMessage()], $e->getCode() === 403 ? 403 : 422);
        }

        $user = $result["user"];
        $token = $result["token"];

        return response()->json([
            "token" => $result["token"],
            "user" => $result["user"],
        ]);
    }

    public function logout(Request $request, AuthService $service)
    {
        $service->logout($request->user("sanctum"));

        return response()->json([
            "message" => "Logged out successfully",
        ]);
    }
}
