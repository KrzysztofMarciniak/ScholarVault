<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

abstract class v1Controller extends Controller
{
    /**
     * Mandatory endpoint usage description.
     */
    abstract public function help(): JsonResponse;
}
