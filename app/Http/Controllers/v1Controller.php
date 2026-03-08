<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService;
use Illuminate\Http\JsonResponse;

abstract class v1Controller extends Controller
{
    /**
     * Mandatory endpoint usage description.
     */
    abstract public function help(ApiDocsService $apiDocs): JsonResponse;
}
