<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleRequiredAdministrator
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth("sanctum")->user();

        if (!$user) {
            return response()->json(["message" => "Unauthenticated."], 401);
        }

        if ($user->role_id !== Role::ADMINISTRATOR) {
            return response()->json(["message" => "Forbidden. Administrator role required."], 403);
        }

        return $next($request);
    }
}
