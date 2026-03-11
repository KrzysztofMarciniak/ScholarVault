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
            "title" => "escape|trim|capitalize",
            "abstract" => "escape|trim|capitalize",
            "keywords" => "escape|trim",
            "notes" => "escape|trim",
            "comments" => "escape|trim",
            "recommendation" => "escape|trim",
            "reviewers" => "trim|digit|escape",
            "comment" => "trim|escape|capitalize",
        ];

        $sanitizer = new Sanitizer($input, $filters);
        $sanitized = $sanitizer->sanitize();

        // Apply ORCID formatting
        if (!empty($sanitized["orcid"])) {
            $sanitized["orcid"] = $this->formatOrcid($sanitized["orcid"]);
        }

        $request->replace($sanitized);

        return $next($request);
    }

    /**
     * Format ORCID as XXXX-XXXX-XXXX-XXXX
     */
    private function formatOrcid(?string $orcid): ?string
    {
        if (empty($orcid)) {
            return null;
        }

        if (strlen($orcid) !== 16) {
            return $orcid;
        }

        return substr($orcid, 0, 4) . "-" .
               substr($orcid, 4, 4) . "-" .
               substr($orcid, 8, 4) . "-" .
               substr($orcid, 12, 4);
    }
}
