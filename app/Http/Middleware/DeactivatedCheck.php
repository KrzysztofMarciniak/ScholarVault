<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DeactivatedCheck
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user("sanctum");

        if ($user?->deactivated) {
            return response()->json([
                "status" => "error",
                "message" => "Your account has been deactivated.",
            ], 403);
        }

        return $next($request);
    }
}
