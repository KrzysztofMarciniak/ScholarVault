<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\ApiDocsService\ApiDocs;
use Illuminate\Http\JsonResponse;

abstract class v1Controller extends Controller
{
    /**
     * Mandatory endpoint usage description.
     */
    abstract public function help(ApiDocs $apiDocs): JsonResponse;
}
