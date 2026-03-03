<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Elegant\Sanitizer\Sanitizer;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SanitizeWithSanitizer
{
    public function handle(Request $request, Closure $next): Response
    {
        $input = $request->all();

        $filters = [
            "email" => "trim|lowercase",
            "name" => "trim|escape",
            "password" => "trim",
        ];

        $sanitizer = new Sanitizer($input, $filters);

        $sanitized = $sanitizer->sanitize();

        $request->replace($sanitized);

        return $next($request);
    }
}
