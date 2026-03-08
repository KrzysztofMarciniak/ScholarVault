<?php

declare(strict_types=1);

namespace App\Http\Controllers;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\AuthenticationException;

use App\Services\ApiDocsService;
class v1LoginController extends Controller
{

public function help(ApiDocsService $docs): JsonResponse
{
    $docs->addEndpoints([
        [
            "method" => "POST",
            "path" => "/api/v1/login",
            "description" => "Authenticate user with email and password, returns API token. Password is trimmed, email is lowercase.",
            "roles" => ["guest"],
            "request_body" => [
                "email" => "string, valid email",
                "password" => "string, required",
            ],
            "query_params" => [],
            "response_code" => 200,
            "available" => true,
            "response_data" => [
                "token" => "string",
            ],
        ],
        [
            "method" => "POST",
            "path" => "/api/v1/login/logout",
            "description" => "Revoke current API token, logs user out",
            "roles" => ["user"],
            "request_body" => [],
            "query_params" => [],
            "response_code" => 200,
            "available" => true,
            "response_data" => [
                "message" => "Logged out successfully",
            ],
        ],
    ]);

    return response()->json([
        "message" => "Login API usage instructions",
        "endpoints" => $docs->getEndpoints(),
    ]);
}

public function login(Request $request, AuthService $service): JsonResponse
{
    $data = $request->validate([
        'email' => ['required', 'email'],
        'password' => ['required'],
    ]);

    try {
        $result = $service->login($data);
    } catch (AuthenticationException $e) {
        return response()->json(['message' => 'Invalid credentials'], 401);
    } catch (\RuntimeException $e) {
        return response()->json(['message' => $e->getMessage()], $e->getCode() === 403 ? 403 : 422);
    }

    $user = $result['user'];
    $token = $result['token'];

return response()->json([
    "token" => $result["token"],
    "user" => $result["user"],
]);
}

    public function logout(Request $request, AuthService $service)
    {
    $service->logout($request->user('sanctum'));
    return response()->json([
        "message" => "Logged out successfully",
    ]);
   }
}
