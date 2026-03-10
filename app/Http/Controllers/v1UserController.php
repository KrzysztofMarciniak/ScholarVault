<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ApiDocsService;
use App\Services\User\AdminUserService;
use App\Services\User\AnyUserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use RuntimeException;

class v1UserController extends v1Controller
{
    public function help(ApiDocsService $apiDocs): JsonResponse
    {
        $apiDocs->addEndpoints([
            [
                "method" => "POST",
                "path" => "/api/v1/users",
                "description" => "Create a new user (admin only)",
                "roles" => ["administrator"],
                "request_body" => [
                    "name" => "string|nullable|max:255",
                    "email" => "string|required|email|unique",
                    "password" => "string|required|min:6",
                    "role_id" => "integer|required|exists:roles",
                    "affiliation" => "string|nullable|max:255",
                    "orcid" => "string|nullable|max:32",
                    "bio" => "string|nullable",
                ],
                "query_params" => null,
                "response_code" => 201,
                "available" => true,
                "response_data" => "User object",
            ],

            [
                "method" => "GET",
                "path" => "/api/v1/users",
                "description" => "List all active users (paginated)",
                "roles" => ["none"],
                "request_body" => null,
                "query_params" => [
                    "per_page" => "integer (max 100, default 15)",
                ],
                "response_code" => 200,
                "available" => true,
                "response_data" => "Paginated user list with roles",
            ],

            [
                "method" => "GET",
                "path" => "/api/v1/users/search",
                "description" => "Search users by name, email, or affiliation (paginated)",
                "roles" => ["none"],
                "request_body" => null,
                "query_params" => [
                    "q" => "string|required|min:2 (search query)",
                    "per_page" => "integer (max 100, default 15)",
                ],
                "response_code" => 200,
                "available" => true,
                "response_data" => "Paginated search results",
            ],

            [
                "method" => "PUT",
                "path" => "/api/v1/users/self",
                "description" => "Update your own profile (authenticated users)",
                "roles" => ["none"],
                "request_body" => [
                    "name" => "string|nullable|max:255",
                    "email" => "string|email|unique (except own)",
                    "affiliation" => "string|nullable|max:255",
                    "orcid" => "string|nullable|max:32",
                    "bio" => "string|nullable",
                ],
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => "Updated user object",
            ],

            [
                "method" => "GET",
                "path" => "/api/v1/users/{id}",
                "description" => "Retrieve a specific user's full information",
                "roles" => ["administrator"],
                "request_body" => null,
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => [
                    "id" => "integer",
                    "name" => "string",
                    "email" => "string",
                    "role" => "string",
                    "affiliation" => "string|null",
                    "orcid" => "string|null",
                    "bio" => "string|null",
                ],
            ],

            [
                "method" => "GET",
                "path" => "/api/v1/users/me",
                "description" => "Retrieve current authenticated user's information",
                "roles" => ["none"],
                "request_body" => null,
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => [
                    "id" => "integer",
                    "name" => "string",
                    "email" => "string",
                    "role" => "string",
                    "affiliation" => "string|null",
                    "orcid" => "string|null",
                    "bio" => "string|null",
                ],
            ],

            [
                "method" => "PATCH",
                "path" => "/api/v1/users/{id}",
                "description" => "Update any user (admin only)",
                "roles" => ["administrator"],
                "request_body" => [
                    "name" => "string|nullable|max:255",
                    "email" => "string|email|unique (except target user)",
                    "password" => "string|min:6",
                    "role_id" => "integer|exists:roles",
                    "affiliation" => "string|nullable|max:255",
                    "orcid" => "string|nullable|max:32",
                    "bio" => "string|nullable",
                ],
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => "Updated user object",
            ],

            [
                "method" => "DELETE",
                "path" => "/api/v1/users/{id}",
                "description" => "Deactivate a user (admin only)",
                "roles" => ["administrator"],
                "request_body" => null,
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => "Success message",
            ],

            [
                "method" => "DELETE",
                "path" => "/api/v1/users/self",
                "description" => "Deactivate your own account (authenticated users)",
                "roles" => ["none"],
                "request_body" => null,
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => "Success message",
            ],

            [
                "method" => "PATCH",
                "path" => "/api/v1/users/self/password",
                "description" => "Change your own password (authenticated users)",
                "roles" => ["none"],
                "request_body" => [
                    "current_password" => "string|required",
                    "new_password" => "string|required|min:6",
                    "password_confirmation" => "string|same:new_password",
                ],
                "query_params" => null,
                "response_code" => 200,
                "available" => true,
                "response_data" => "Success message",
            ],
        ]);

        $errorResponses = [
            ["code" => 400, "message" => "Bad Request", "description" => "Validation failed"],
            ["code" => 401, "message" => "Unauthorized", "description" => "Not authenticated or invalid token"],
            ["code" => 403, "message" => "Forbidden", "description" => "Insufficient permissions (not admin)"],
            ["code" => 404, "message" => "Not Found", "description" => "User does not exist"],
            ["code" => 422, "message" => "Unprocessable Entity", "description" => "Business logic error"],
        ];

        return response()->json([
            "endpoints" => $apiDocs->getEndpoints(),
            "error_responses" => $errorResponses,
        ]);
    }

    // create user as admin
    public function AdminCreateUser(Request $request, AdminUserService $service): JsonResponse
    {
        $data = $request->validate([
            "name" => ["nullable", "string"],
            "email" => ["required", "email", "unique:users,email"],
            "password" => ["required", "string"],
            "role_id" => ["required", "exists:roles,id"],
            "affiliation" => ["nullable", "string"],
            "orcid" => ["nullable", "string"],
            "bio" => ["nullable", "string"],
        ]);

        $user = $service->create($data);

        return response()->json([
            "status" => "success",
            "user" => $user,
        ], 201);
    }

    public function AllUsers(Request $request): JsonResponse
    {
        $perPage = min((int)$request->query("per_page", 15), 100);

        $users = User::active()
            ->withRoleName()
            ->select(["id", "name", "orcid", "role_id"])
            ->paginate($perPage)
            ->through(fn($u) => $u->toListArray());

        return response()->json($users);
    }

    // Admin partial update (PATCH semantics)
    public function AdminUpdateUser(Request $request, int $id, AdminUserService $service): JsonResponse
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            "name" => "sometimes|nullable|string",
            "email" => [
                "sometimes",
                "email",
                Rule::unique("users")->ignore($user->id),
            ],
            "password" => "sometimes|string|min:6",
            "role_id" => "sometimes|exists:roles,id",
            "affiliation" => "sometimes|nullable|string",
            "orcid" => "sometimes|nullable|string",
            "bio" => "sometimes|nullable|string",
        ]);

        $updatedUser = $service->update($user, $data);

        return response()->json([
            "status" => "success",
            "data" => $updatedUser,
        ]);
    }

    public function AnyUserSelfUpdate(Request $request, AnyUserService $service): JsonResponse
    {
        $user = $request->user("sanctum");
        $data = $request->validate([
            "name" => "sometimes|nullable|string|max:255",
            "email" => [
                "sometimes",
                "email",
                Rule::unique("users")->ignore($user->id),
            ],
            "affiliation" => "sometimes|nullable|string|max:255",
            "orcid" => "sometimes|nullable|string|max:32",
            "bio" => "sometimes|nullable|string",
        ]);

        $updated = $service->update($user, $data);

        return response()->json([
            "status" => "success",
            "data" => $updated,
        ]);
    }

    public function AdminDeactivateUser(int $id, AnyUserService $service): JsonResponse
    {
        $user = User::find($id);

        if (!$user || $user->deactivated || !$user->canBeDeactivated()) {
            return response()->json([
                "status" => "error",
                "message" => "User not found or cannot be deactivated.",
            ], 404);
        }

        $service->deactivate($user);

        return response()->json([
            "status" => "success",
            "message" => "User deactivated.",
        ]);
    }

    public function SelfDeactivate(Request $request, AnyUserService $service): JsonResponse
    {
        $user = $request->user("sanctum");

        try {
            $service->deactivate($user);
        } catch (RuntimeException $e) {
            return response()->json([
                "status" => "error",
                "message" => $e->getMessage(),
            ], 404);
        }

        return response()->json([
            "status" => "success",
            "message" => "Your account has been deactivated.",
        ]);
    }

    public function SearchUsers(Request $request): JsonResponse
    {
        $data = $request->validate([
            "q" => "required|string|min:2",
            "per_page" => "sometimes|integer|max:100",
        ]);

        $user = $request->user("sanctum");
        $isAdmin = $user?->isAdministrator() ?? false;

        $perPage = $data["per_page"] ?? 15;

        $users = User::searchUsers($data["q"], $includeDeactivated = $isAdmin, $withRole = $isAdmin)
            ->through(fn($u) => $u->toSearchArray($isAdmin));

        return response()->json($users);
    }

    public function SelfChangePassword(Request $request, AnyUserService $service): JsonResponse
    {
        $user = $request->user("sanctum");

        $rules = [
            "current_password" => "required|string",
            "new_password" => "required|string|min:6|confirmed",
        ];

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                "status" => "error",
                "errors" => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        if (!Hash::check($data["current_password"], $user->password)) {
            return response()->json([
                "status" => "error",
                "message" => "Current password is incorrect.",
            ], 422);
        }

        $service->changePassword($user, $data["new_password"]);

        return response()->json([
            "status" => "success",
            "message" => "Password changed successfully.",
        ]);
    }

    public function DisplaySelf(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->toProfileArray(),
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json(
            $user->toProfileArray(),
        );
    }
}
