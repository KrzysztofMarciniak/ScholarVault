<?php

declare(strict_types=1);

use App\Http\Controllers\v1LoginController;
use App\Http\Controllers\v1TestController;
use App\Http\Controllers\v1TestMiddlewareSanitization;
use Illuminate\Support\Facades\Route;

// --- /api/v1/ ---
Route::prefix("v1")->group(function (): void {
    // --- /api/v1/login ---
    Route::prefix("login")->group(function (): void {
        // Help endpoint
        Route::get("help", [v1LoginController::class, "help"]);

        // Login endpoint
        Route::post("/", [v1LoginController::class, "login"]);

        // Logout endpoint (requires auth)
        Route::post("/logout", [v1LoginController::class, "logout"])
            ->middleware("auth:sanctum");
    });

    // --- /api/v1/test ---
    Route::prefix("test")->group(function (): void {
        Route::get("help", [v1TestController::class, "help"]);
        Route::get("/", [v1TestController::class, "index"]);
        // --- /api/v1/test/sanitization
        Route::prefix("sanitization")->group(function (): void {
            Route::get("help", [v1TestMiddlewareSanitization::class, "help"]);
            Route::post("/", [v1TestMiddlewareSanitization::class, "index"]);
        });
    });

    // --- Protected routes ---
    Route::middleware("auth:sanctum")->group(function (): void {
    });
});
