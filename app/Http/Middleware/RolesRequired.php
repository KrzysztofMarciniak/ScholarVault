<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RolesRequired
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = auth("sanctum")->user();

        if (!$user) {
            return response()->json(["message" => "Unauthenticated."], 401);
        }

        $roles = array_map("intval", $roles);

        $role = Role::find($user->role_id);

        if (!$role || !in_array($user->role_id, $roles, true)) {
            return response()->json([
                "message" => "Forbidden. Insufficient role.",
                "role_id" => $user->role_id,
                "role_name" => $role?->name ?? "UNKNOWN",
            ], 403);
        }

        return $next($request);
    }
}
