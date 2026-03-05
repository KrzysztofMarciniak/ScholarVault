<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FormatOrcid
{
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $data = $response->getData(true);
            $data = $this->formatOrcidRecursive($data);
            $response->setData($data);
        }

        return $response;
    }

    private function formatOrcidRecursive(array $data): array
    {
        foreach ($data as $key => $value) {
            if ($key === 'orcid' && is_string($value) && strlen($value) === 16) {
                $data[$key] = preg_replace('/(\d{4})(?=\d)/', '$1-', $value);
            } elseif (is_array($value)) {
                $data[$key] = $this->formatOrcidRecursive($value);
            }
        }

        return $data;
    }
}
