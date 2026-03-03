<?php
use App\Http\Controllers\v1TestController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ArticleController;

// --- Versioned API prefix ---
Route::prefix('v1')->group(function () {
    Route::get('test', [v1TestController::class, 'index']);
    // --- Protected routes ---
    Route::middleware('auth:sanctum')->group(function () {
//        Route::get('users', [UserController::class, 'index']); // list users
    });

});
