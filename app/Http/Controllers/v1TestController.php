<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class v1TestController extends Controller
{
    /**
     * Display a test response.
     */
    public function index()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'v1 API test endpoint works!',
        ]);
    }
}
