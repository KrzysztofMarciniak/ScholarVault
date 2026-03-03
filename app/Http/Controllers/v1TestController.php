<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;

class v1TestController extends v1Controller
{
    public function help(): JsonResponse
    {
        return $this->helpResponse([
            "Help: Hit this endpoint with GET, to check if it works.",
        ]);
    }

    public function index()
    {
        return response()->json([
            "status" => "success",
            "message" => "v1 API test endpoint works!",
        ]);
    }
}
