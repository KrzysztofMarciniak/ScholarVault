<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\ApiDocsService\ApiDocs;
use App\Services\ApiDocsService\EndpointDTO;
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
    public function help(ApiDocs $docs): JsonResponse
    {
        // List all users
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/users",
            description: "List all active users (paginated)",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "per_page" => "integer (default 15, max 100)",
            ],
            responseCode: 200,
            available: true,
            responseData: "Paginated list of users",
        ));

        // Search users
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/users/search",
            description: "Search users by name or email",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "q" => "string (search query, min length 2)",
                "per_page" => "integer (optional, default 15, max 100)",
            ],
            responseCode: 200,
            available: true,
            responseData: "List of users matching query",
        ));

        // Show user profile
        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/users/show/{id}",
            description: "Retrieve public profile of a specific user",
            roles: ["none"],
            requestBody: [],
            queryParams: [
                "id" => "integer (ID of the user)",
            ],
            responseCode: 200,
            available: true,
            responseData: "User profile object",
        ));

        // Self actions (authenticated)
        $docs->addEndpoint(new EndpointDTO(
            method: "PATCH",
            path: "/api/v1/users/self/password",
            description: "Change own password",
            roles: ["authenticated"],
            requestBody: [
                "current_password" => "string",
                "new_password" => "string",
                "new_password_confirmation" => "string",
            ],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "Success message",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "PUT",
            path: "/api/v1/users/self",
            description: "Update own profile",
            roles: ["authenticated"],
            requestBody: [
                "name" => "string|optional",
                "email" => "string|optional",
                "affiliation" => "string|optional",
                "orcid" => "string|optional",
                "bio" => "string|optional",
            ],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "Updated user profile object",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "DELETE",
            path: "/api/v1/users/self",
            description: "Deactivate own account",
            roles: ["authenticated"],
            requestBody: [],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "Success message",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "GET",
            path: "/api/v1/users/me",
            description: "Retrieve own profile",
            roles: ["authenticated"],
            requestBody: [],
            queryParams: [],
            responseCode: 200,
            available: true,
            responseData: "User profile object",
        ));

        // Admin actions
        $docs->addEndpoint(new EndpointDTO(
            method: "POST",
            path: "/api/v1/users",
            description: "Create a new user (admin only)",
            roles: ["administrator"],
            requestBody: [
                "name" => "string|optional",
                "email" => "string|required",
                "password" => "string|required",
                "role_id" => "integer|required",
                "affiliation" => "string|optional",
                "orcid" => "string|optional",
                "bio" => "string|optional",
            ],
            queryParams: [],
            responseCode: 201,
            available: true,
            responseData: "Created user object",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "PATCH",
            path: "/api/v1/users/{id}",
            description: "Update any user (admin only)",
            roles: ["administrator"],
            requestBody: [
                "name" => "string|optional",
                "email" => "string|optional",
                "password" => "string|optional",
                "role_id" => "integer|optional",
                "affiliation" => "string|optional",
                "orcid" => "string|optional",
                "bio" => "string|optional",
            ],
            queryParams: [
                "id" => "integer (ID of the user)",
            ],
            responseCode: 200,
            available: true,
            responseData: "Updated user object",
        ));

        $docs->addEndpoint(new EndpointDTO(
            method: "DELETE",
            path: "/api/v1/users/{id}",
            description: "Deactivate any user (admin only)",
            roles: ["administrator"],
            requestBody: [],
            queryParams: [
                "id" => "integer (ID of the user)",
            ],
            responseCode: 200,
            available: true,
            responseData: "Success message",
        ));

        return response()->json($docs->getEndpoints());
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
