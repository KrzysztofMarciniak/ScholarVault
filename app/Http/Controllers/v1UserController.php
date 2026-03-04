<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Events\UserChangedPassword;
use App\Events\UserModifiedByAdmin;
use App\Events\UserUpdatedSelf;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class v1UserController extends v1Controller
{
    public function help(): JsonResponse
    {
        return response()->json([
            "endpoints" => [
                [
                    "method" => "POST",
                    "path" => "/api/v1/users",
                    "description" => "Create a new user (admin only)",
                    "auth_required" => true,
                    "admin_only" => true,
                    "request_body" => [
                        "name" => "string|nullable|max:255",
                        "email" => "string|required|email|unique",
                        "password" => "string|required|min:6",
                        "role_id" => "integer|required|exists:roles",
                        "affiliation" => "string|nullable|max:255",
                        "orcid" => "string|nullable|max:32",
                        "bio" => "string|nullable",
                    ],
                    "response_code" => 201,
                    "response_data" => "User object",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/users",
                    "description" => "List all active users (paginated)",
                    "auth_required" => false,
                    "admin_only" => false,
                    "query_params" => [
                        "per_page" => "integer (max 100, default 15)",
                    ],
                    "response_code" => 200,
                    "response_data" => "Paginated user list with roles",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/users/search",
                    "description" => "Search users by name, email, or affiliation (paginated)",
                    "auth_required" => false,
                    "admin_only" => false,
                    "query_params" => [
                        "q" => "string|required|min:2 (search query)",
                        "per_page" => "integer (max 100, default 15)",
                    ],
                    "response_code" => 200,
                    "response_data" => "Paginated search results",
                ],
                [
                    "method" => "GET",
                    "path" => "/api/v1/users/search?admin=1",
                    "description" => "Search users with extra admin information (admin only)",
                    "auth_required" => true,
                    "admin_only" => true,
                    "query_params" => [
                        "q" => "string|required|min:2",
                        "per_page" => "integer (max 100, default 15)",
                        "admin" => "flag to include extra info",
                    ],
                    "extra_fields" => ["created_at", "updated_at", "deactivated"],
                    "response_code" => 200,
                    "response_data" => "Results with admin fields",
                ],
                [
                    "method" => "PUT",
                    "path" => "/api/v1/users/self",
                    "description" => "Update your own profile (authenticated users)",
                    "auth_required" => true,
                    "admin_only" => false,
                    "request_body" => [
                        "name" => "string|nullable|max:255",
                        "email" => "string|email|unique (except own)",
                        "affiliation" => "string|nullable|max:255",
                        "orcid" => "string|nullable|max:32",
                        "bio" => "string|nullable",
                    ],
                    "response_code" => 200,
                    "response_data" => "Updated user object",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/users/{id}",
                    "description" => "Update any user (admin only)",
                    "auth_required" => true,
                    "admin_only" => true,
                    "path_params" => [
                        "id" => "integer (user ID)",
                    ],
                    "request_body" => [
                        "name" => "string|nullable|max:255",
                        "email" => "string|email|unique (except target user)",
                        "password" => "string|min:6",
                        "role_id" => "integer|exists:roles",
                        "affiliation" => "string|nullable|max:255",
                        "orcid" => "string|nullable|max:32",
                        "bio" => "string|nullable",
                    ],
                    "response_code" => 200,
                    "response_data" => "Updated user object",
                ],
                [
                    "method" => "DELETE",
                    "path" => "/api/v1/users/{id}",
                    "description" => "Deactivate a user (admin only)",
                    "auth_required" => true,
                    "admin_only" => true,
                    "path_params" => [
                        "id" => "integer (user ID)",
                    ],
                    "warnings" => ["Cannot deactivate last active administrator"],
                    "side_effects" => ["Revokes all active tokens"],
                    "response_code" => 200,
                    "response_data" => "Success message",
                ],
                [
                    "method" => "DELETE",
                    "path" => "/api/v1/users/self",
                    "description" => "Deactivate your own account (authenticated users)",
                    "auth_required" => true,
                    "admin_only" => false,
                    "warnings" => ["Action cannot be undone without admin help"],
                    "side_effects" => ["Revokes all your active tokens"],
                    "response_code" => 200,
                    "response_data" => "Success message",
                ],
                [
                    "method" => "PATCH",
                    "path" => "/api/v1/users/self/password",
                    "description" => "Change your own password (authenticated users)",
                    "auth_required" => true,
                    "admin_only" => false,
                    "request_body" => [
                        "current_password" => "string|required",
                        "new_password" => "string|required|min:6",
                        "password_confirmation" => "string|same:new_password",
                    ],
                    "response_code" => 200,
                    "response_data" => "Success message",
                ],
            ],
            "error_responses" => [
                [
                    "code" => 400,
                    "message" => "Bad Request",
                    "description" => "Validation failed",
                ],
                [
                    "code" => 401,
                    "message" => "Unauthorized",
                    "description" => "Not authenticated or invalid token",
                ],
                [
                    "code" => 403,
                    "message" => "Forbidden",
                    "description" => "Insufficient permissions (not admin)",
                ],
                [
                    "code" => 404,
                    "message" => "Not Found",
                    "description" => "User does not exist",
                ],
                [
                    "code" => 422,
                    "message" => "Unprocessable Entity",
                    "description" => "Business logic error",
                ],
            ],
        ]);
    }

    // Admin create
    public function store(Request $request): JsonResponse
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

        $data["password"] = Hash::make($data["password"]);

        $user = User::create($data);

        return response()->json([
            "status" => "success",
            "user" => $user,
        ], 201);
    }

    // List (paginated) active users
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int)$request->query("per_page", 15), 100);

        $users = User::where("deactivated", false)
            ->with("role")
            ->paginate($perPage);

        return response()->json($users);
    }

    // Admin partial update (PATCH semantics)
    public function update(Request $request, int $id): JsonResponse
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

        if (array_key_exists("password", $data) && $data["password"] !== null) {
            $data["password"] = Hash::make($data["password"]);
        }

        $user->fill($data);

        $dirty = $user->getDirty();

        $user->save();

        if (!empty($dirty)) {
            event(new UserModifiedByAdmin(
                $request->user(),
                $user,
                array_keys($dirty),
            ));
        }

        return response()->json([
            "status" => "success",
            "data" => $user,
        ]);
    }

    public function updateSelf(Request $request): JsonResponse
    {
        $user = $request->user();

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

        $user->fill($data);

        $dirty = $user->getDirty();
        $user->save();

        if (!empty($dirty)) {
            event(new UserUpdatedSelf($user, array_keys($dirty)));
        }

        return response()->json([
            "status" => "success",
            "data" => $user,
        ]);
    }

    // Admin deactivate
    public function destroy(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->role_id === Role::ADMINISTRATOR) {
            $adminCount = User::where("role_id", Role::ADMINISTRATOR)
                ->where("deactivated", false)
                ->count();

            if ($adminCount <= 1) {
                return response()->json([
                    "status" => "error",
                    "message" => "Cannot deactivate the last active administrator.",
                ], 422);
            }
        }

        $user->update(["deactivated" => true]);

        $user->tokens()->delete();

        return response()->json([
            "status" => "success",
            "message" => "User deactivated.",
        ]);
    }

    public function deleteSelf(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update(["deactivated" => true]);
        $user->tokens()->delete();

        return response()->json([
            "status" => "success",
            "message" => "Your account has been deactivated.",
        ]);
    }

    // Search (paginated)
    public function search(Request $request): JsonResponse
    {
        $data = $request->validate([
            "q" => "required|string|min:2",
        ]);

        $query = $data["q"];
        $perPage = min((int)$request->query("per_page", 15), 100);
        $isAdmin = $request->query("admin") !== null
            && $request->user()?->role_id === Role::ADMINISTRATOR;
        $users = User::where("deactivated", false)
            ->where(function ($qBuilder) use ($query): void {
                $qBuilder->where("name", "like", "%{$query}%")
                    ->orWhere("email", "like", "%{$query}%")
                    ->orWhere("affiliation", "like", "%{$query}%");
            })
            ->with("role")
            ->paginate($perPage);

        if ($isAdmin) {
            $users->getCollection()->transform(fn($user) => array_merge($user->toArray(), [
                "created_at" => $user->created_at,
                "updated_at" => $user->updated_at,
                "deactivated" => $user->deactivated,
            ]));
        }

        return response()->json($users);
    }

    // Change own password
    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            "current_password" => "required|string",
            "new_password" => "required|string|min:6",
            "password_confirmation" => "required|string|same:new_password",
        ]);

        if (!Hash::check($data["current_password"], $user->password)) {
            return response()->json([
                "status" => "error",
                "message" => "Current password is incorrect.",
            ], 422);
        }

        $user->update([
            "password" => Hash::make($data["new_password"]),
        ]);

        event(new UserChangedPassword($user));

        return response()->json([
            "status" => "success",
            "message" => "Password changed successfully.",
        ]);
    }
}
