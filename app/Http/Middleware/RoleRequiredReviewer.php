<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleRequiredReviewer
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(["message" => "Unauthenticated."], 401);
        }

        if ($user->role_id !== Role::REVIEWER) {
            return response()->json(["message" => "Forbidden. Reviewer role required."], 403);
        }

        return $next($request);
    }
}
