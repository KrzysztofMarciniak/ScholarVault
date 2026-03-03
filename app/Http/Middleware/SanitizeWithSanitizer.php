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
            "name" => "capitalize|trim|escape",
            "password" => "trim",
            "affiliation" => "trim|escape",
            "orcid" => "trim|escape|digit",
            "bio" => "trim|escape",
        ];

        $sanitizer = new Sanitizer($input, $filters);
        $sanitized = $sanitizer->sanitize();

        // Apply ORCID formatting
        if (!empty($sanitized['orcid'])) {
            $sanitized['orcid'] = $this->formatOrcid($sanitized['orcid']);
        }

        $request->replace($sanitized);

        return $next($request);
    }

    /**
     * Format ORCID as XXXX-XXXX-XXXX-XXXX
     */
    private function formatOrcid(string $orcid): string
    {
        // Remove all non-digit characters
        $digits = preg_replace('/\D/', '', $orcid);

        // Only format if exactly 16 digits
        if (strlen($digits) !== 16) {
            return $orcid; // leave as-is if invalid length
        }

        return substr($digits, 0, 4) . '-' .
               substr($digits, 4, 4) . '-' .
               substr($digits, 8, 4) . '-' .
               substr($digits, 12, 4);
    }
}
