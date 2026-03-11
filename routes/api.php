<?php

declare(strict_types=1);
use App\Http\Controllers\v1AdminArticleController;
use App\Http\Controllers\v1ArticleController;
use App\Http\Controllers\v1AuthorArticleController;
use App\Http\Controllers\v1LoginController;
use App\Http\Controllers\v1NotificationController;
use App\Http\Controllers\v1RegisterController;
use App\Http\Controllers\v1ReviewerArticleController;
use App\Http\Controllers\v1TestController;
use App\Http\Controllers\v1TestMiddlewareSanitization;
use App\Http\Controllers\v1UserController;
use App\Http\Middleware\BlockIfAuthenticated;
use App\Models\Role;
use Illuminate\Support\Facades\Route;

// --- /api/v1/ ---
Route::prefix("v1")->group(function (): void {
    // api/v1/notifications
    Route::prefix("notifications")->middleware("auth:sanctum")->group(function (): void {
        Route::get("/check", [v1NotificationController::class, "check"]);
        Route::patch("/read/{id}", [v1NotificationController::class, "markRead"]);
        Route::patch("/read-all", [v1NotificationController::class, "markAllRead"]);
    });
    // --- /api/v1/articles ---
    Route::prefix("articles")->group(function (): void {
        // Help endpoint
        Route::get("help", [v1ArticleController::class, "help"]);
        // =========================
        // AUTHOR ROUTES
        // =========================
        Route::middleware(["auth:sanctum", "roles:" . Role::AUTHOR])->group(function (): void {
            // Submit article
            Route::post("/submit", [v1AuthorArticleController::class, "store"]);

            // List own articles
            Route::get("/my/list", [v1AuthorArticleController::class, "myArticles"]);

            // View own article
            Route::get("/my/{id}", [v1AuthorArticleController::class, "myArticle"]);
            // Submit revision

            // View comments
        });

        // =========================
        // REVIEWER ROUTES
        // =========================
        Route::middleware(["auth:sanctum", "roles:" . Role::REVIEWER])->group(function (): void {
            // List assigned
            Route::get("/assigned", [v1ReviewerArticleController::class, "assignedArticles"]);
            // View assigned article
            Route::get("/assigned/{id}", [v1ReviewerArticleController::class, "assignedArticle"]);
            // Leave comment
            Route::post("/assigned/comment/{id}", [v1ReviewerArticleController::class, "leaveComment"]);
            // Submit review
            Route::post("/assigned/{id}/review", [v1ReviewerArticleController::class, "submitAssignedReview"]);
            // decide if accepted or rejected
            Route::post("/assigned/decide/{id}", [v1ReviewerArticleController::class, "makeDecision"]);
        });

        // =========================
        // ADMIN ROUTES
        // =========================
        Route::middleware(["auth:sanctum", "roles:" . Role::ADMINISTRATOR])->prefix("admin")->group(function (): void {
            Route::get("/", [v1AdminArticleController::class, "AdminlistAllArticles"]);
            Route::get("/reviewers", [v1AdminArticleController::class, "listReviewers"]);
            Route::patch("/reviewers/{id}", [v1AdminArticleController::class, "AdminAssignReviewers"]);
            Route::patch("/decide/{id}", [v1AdminArticleController::class, "makeDecision"]);
        });
        Route::get("/", [v1ArticleController::class, "index"]);
        Route::get("/{id}", [v1ArticleController::class, "show"]);
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
        Route::post("/", [v1LoginController::class, "login"])
            ->name("login")
            ->middleware([BlockIfAuthenticated::class]);

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
        Route::get("/", [v1UserController::class, "AllUsers"]);

        // Search endpoint
        Route::get("/search", [v1UserController::class, "SearchUsers"]);

        // display users info
        Route::get("/show/{id}", [v1UserController::class, "show"]);

        Route::middleware("auth:sanctum")->group(function (): void {
            // Change own password
            Route::patch("self/password", [v1UserController::class, "SelfchangePassword"]);

            // Update own profile
            Route::put("self", [v1UserController::class, "AnyUserSelfUpdate"]);

            // Delete own account
            Route::delete("self", [v1UserController::class, "SelfDeactivate"]);

            // Display own info
            Route::get("me", [v1UserController::class, "DisplaySelf"]);
        });

        // Admin routes
        Route::middleware(["auth:sanctum", "roles:" . Role::ADMINISTRATOR])->group(function (): void {
            // Create user
            Route::post("/", [v1UserController::class, "AdminCreateUser"]);

            // Update user
            Route::patch("{id}", [v1UserController::class, "AdminUpdateUser"]);

            // Deactivate user
            Route::delete("{id}", [v1UserController::class, "AdminDeactivateUser"]);
        });
    });
});
