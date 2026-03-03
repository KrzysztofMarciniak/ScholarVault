<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BlockIfAuthenticated
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            return response()->json([
                "message" => "Already logged in users cannot access this endpoint.",
            ], 403);
        }

        return $next($request);
    }
}
