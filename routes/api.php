<?php

declare(strict_types=1);
use App\Http\Controllers\v1ArticleController;
use App\Http\Controllers\v1LoginController;
use App\Http\Controllers\v1RegisterController;
use App\Http\Controllers\v1TestController;
use App\Http\Controllers\v1TestMiddlewareSanitization;
use App\Http\Controllers\v1UserController;
use App\Http\Middleware\BlockIfAuthenticated;
use App\Models\Role;
use Illuminate\Support\Facades\Route;

// --- /api/v1/ ---
Route::prefix("v1")->group(function (): void {
    // --- /api/v1/articles ---
    Route::prefix("articles")->group(function (): void {
        // Help endpoint
        Route::get("help", [v1ArticleController::class, "help"]);

        // =========================
        // AUTHOR ROUTES
        // =========================
        Route::middleware(["auth:sanctum", "roles:" . Role::AUTHOR])->group(function (): void {
            // Submit article
            Route::post("/", [v1ArticleController::class, "store"]);

            // List own articles
            Route::get("/my", [v1ArticleController::class, "myArticles"]);

            // View own article
            Route::get("/my/{id}", [v1ArticleController::class, "myArticle"]);
            // Submit revision

            // View comments
        });

        // =========================
        // REVIEWER ROUTES
        // =========================
        Route::middleware(["auth:sanctum", "roles:" . Role::REVIEWER])->group(function (): void {
            // List assigned
            Route::get("/assigned", [v1ArticleController::class, "assignedArticles"]);
            // View assigned article
            Route::get("/assigned/{id}", [v1ArticleController::class, "assignedArticle"]);
            // Submit review
            Route::post("/assigned/{id}/review", [v1ArticleController::class, "submitAssignedReview"]);
        });

        // =========================
        // ADMIN ROUTES
        // =========================
        Route::middleware(["auth:sanctum", "roles:" . Role::ADMINISTRATOR])->group(function (): void {
            // List all
            Route::get("/", [v1ArticleController::class, "AdminlistAllArticles"]);
            // Assign reviewers
            Route::patch("/{id}/reviewers", [v1ArticleController::class, "AdminAssignReviewers"]);
            // Make decision

            // Publish article
        });
    });

    // --- /api/v1/register ---
    Route::prefix("register")->group(function (): void {
        Route::get("/help", [v1RegisterController::class, "help"]);
        Route::post("/", [v1RegisterController::class, "register"])
            ->middleware(BlockIfAuthenticated::class);
    });
    // --- /api/v1/login ---
    Route::prefix("login")->group(function (): void {
        // Help endpoint
        Route::get("help", [v1LoginController::class, "help"]);

        // Login endpoint
        Route::post("", [v1LoginController::class, "login"])->middleware([BlockIfAuthenticated::class]);

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

    // --- /api/v1/users ---
    Route::prefix("users")->group(function (): void {
        // Help endpoint
        Route::get("help", [v1UserController::class, "help"]);

        // Public list (active users only)
        Route::get("/", [v1UserController::class, "index"]);

        // Search endpoint
        Route::get("/search", [v1UserController::class, "search"]);

        //display users info
        Route::get('/show/{id}', [v1UserController::class, 'show']);

        // Protected routes (require authentication)
        Route::middleware("auth:sanctum")->group(function (): void {
            // Change own password
            Route::patch("self/password", [v1UserController::class, "changePassword"]);

            // Update own profile
            Route::put("self", [v1UserController::class, "updateSelf"]);

            // Delete own account
            Route::delete("self", [v1UserController::class, "deleteSelf"]);

            // Display own info
            Route::get('/me', [v1UserController::class, 'me']);
        });

        // Admin routes
        Route::middleware(["auth:sanctum", "roles:" . Role::ADMINISTRATOR])->group(function (): void {
            // Create user
            Route::post("/", [v1UserController::class, "store"]);

            // Update user
            Route::patch("{id}", [v1UserController::class, "update"]);

            // Deactivate user
            Route::delete("{id}", [v1UserController::class, "destroy"]);
        });
    });

    // --- Protected routes ---
    Route::middleware("auth:sanctum")->group(function (): void {
    });
});
