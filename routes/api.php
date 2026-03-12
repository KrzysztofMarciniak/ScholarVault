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
    // -----------------------
    // Notifications (auth)
    // -----------------------
    // Routes for user notification checks and marking as read
    Route::prefix("notifications")->middleware("auth:sanctum")->group(function (): void {
        Route::get("/check", [v1NotificationController::class, "check"])
            ->name("v1.notifications.check");             // GET  /api/v1/notifications/check
        Route::patch("/read/{id}", [v1NotificationController::class, "markRead"])
            ->name("v1.notifications.mark_read");         // PATCH /api/v1/notifications/read/{id}
        Route::patch("/read-all", [v1NotificationController::class, "markAllRead"])
            ->name("v1.notifications.mark_all_read");    // PATCH /api/v1/notifications/read-all
    });

    // -----------------------
    // Articles (public + role-scoped)
    // -----------------------
    // Main articles namespace: public listing / item show + role-specific endpoints below
    Route::prefix("articles")->group(function (): void {
        // Public help endpoint for articles resource
        Route::get("help", [v1ArticleController::class, "help"])
            ->name("v1.articles.help");                  // GET /api/v1/articles/help

        // ------------------------
        // AUTHOR: actions restricted to Role::AUTHOR
        // ------------------------
        Route::middleware(["auth:sanctum", "roles:" . Role::AUTHOR])->group(function (): void {
            // Submit a new article (author only)
            Route::post("/submit", [v1AuthorArticleController::class, "store"])
                ->name("v1.articles.author.submit");    // POST /api/v1/articles/submit

            // List the author's own articles
            Route::get("/my/list", [v1AuthorArticleController::class, "myArticles"])
                ->name("v1.articles.author.my_list");  // GET /api/v1/articles/my/list

            // View a single article owned by the author
            Route::get("/my/{id}", [v1AuthorArticleController::class, "myArticle"])
                ->name("v1.articles.author.show");     // GET /api/v1/articles/my/{id}

            // Comments on author's own article: list and add
            Route::get("/my/comments/{id}", [v1AuthorArticleController::class, "listComments"])
                ->name("v1.articles.author.comments.list"); // GET /api/v1/articles/my/comments/{id}
            Route::post("/my/comments/{id}", [v1AuthorArticleController::class, "addComment"])
                ->name("v1.articles.author.comments.add");  // POST /api/v1/articles/my/comments/{id}

            // Submit a revision file for an author's article
            Route::post("/my/revision/{id}", [v1AuthorArticleController::class, "submitRevision"])
                ->name("v1.articles.author.revision.submit"); // POST /api/v1/articles/my/revision/{id}
        });

        // ------------------------
        // REVIEWER: actions restricted to Role::REVIEWER
        // ------------------------
        Route::middleware(["auth:sanctum", "roles:" . Role::REVIEWER])->group(function (): void {
            // List articles assigned to the reviewer
            Route::get("/assigned", [v1ReviewerArticleController::class, "assignedArticles"])
                ->name("v1.articles.reviewer.assigned_list"); // GET /api/v1/articles/assigned

            // View assigned article details
            Route::get("/assigned/{id}", [v1ReviewerArticleController::class, "assignedArticle"])
                ->name("v1.articles.reviewer.assigned_show"); // GET /api/v1/articles/assigned/{id}

            // Leave a comment on an assigned article
            Route::post("/assigned/comment/{id}", [v1ReviewerArticleController::class, "leaveComment"])
                ->name("v1.articles.reviewer.comment.leave"); // POST /api/v1/articles/assigned/comment/{id}

            // Submit a review for an assigned article
            Route::post("/assigned/{id}/review", [v1ReviewerArticleController::class, "submitAssignedReview"])
                ->name("v1.articles.reviewer.review.submit"); // POST /api/v1/articles/assigned/{id}/review

            // Make a decision (accept / reject) on an assigned article
            Route::post("/assigned/decide/{id}", [v1ReviewerArticleController::class, "makeDecision"])
                ->name("v1.articles.reviewer.decide");        // POST /api/v1/articles/assigned/decide/{id}
        });

        // ------------------------
        // ADMIN: article administration (Role::ADMINISTRATOR)
        // ------------------------
        Route::middleware(["auth:sanctum", "roles:" . Role::ADMINISTRATOR])->prefix("admin")->group(function (): void {
            // List all articles for admin
            Route::get("/", [v1AdminArticleController::class, "AdminlistAllArticles"])
                ->name("v1.articles.admin.list_all");      // GET /api/v1/articles/admin/

            // List reviewers available to assign
            Route::get("/reviewers", [v1AdminArticleController::class, "listReviewers"])
                ->name("v1.articles.admin.list_reviewers"); // GET /api/v1/articles/admin/reviewers

            // Assign reviewers to an article (patch)
            Route::patch("/reviewers/{id}", [v1AdminArticleController::class, "AdminAssignReviewers"])
                ->name("v1.articles.admin.assign_reviewers"); // PATCH /api/v1/articles/admin/reviewers/{id}

            // Admin decision endpoint (accept / reject)
            Route::patch("/decide/{id}", [v1AdminArticleController::class, "makeDecision"])
                ->name("v1.articles.admin.decide");        // PATCH /api/v1/articles/admin/decide/{id}
        });

        // ------------------------
        // PUBLIC: article index & show
        // ------------------------
        Route::get("/", [v1ArticleController::class, "index"])
            ->name("v1.articles.index");                  // GET /api/v1/articles/
        Route::get("/{id}", [v1ArticleController::class, "show"])
            ->name("v1.articles.show");                   // GET /api/v1/articles/{id}
    });

    // -----------------------
    // Registration
    // -----------------------
    Route::prefix("register")->group(function (): void {
        // Help for registration usage
        Route::get("/help", [v1RegisterController::class, "help"])
            ->name("v1.register.help");                  // GET /api/v1/register/help

        // Register new user (block if already authenticated)
        Route::post("/", [v1RegisterController::class, "register"])
            ->middleware(BlockIfAuthenticated::class)
            ->name("v1.register.register");              // POST /api/v1/register
    });

    // -----------------------
    // Authentication (login/logout)
    // -----------------------
    Route::prefix("login")->group(function (): void {
        // Help for login usage
        Route::get("help", [v1LoginController::class, "help"])
            ->name("v1.login.help");                     // GET /api/v1/login/help

        // Login (blocks authenticated users)
        Route::post("/", [v1LoginController::class, "login"])
            ->name("v1.login.login")                     // POST /api/v1/login
            ->middleware([BlockIfAuthenticated::class]);

        // Logout (requires auth)
        Route::post("/logout", [v1LoginController::class, "logout"])
            ->middleware("auth:sanctum")
            ->name("v1.login.logout");                   // POST /api/v1/login/logout
    });

    // -----------------------
    // Test utilities and middleware tests
    // -----------------------
    Route::prefix("test")->group(function (): void {
        Route::get("help", [v1TestController::class, "help"])
            ->name("v1.test.help");                      // GET /api/v1/test/help
        Route::get("/", [v1TestController::class, "index"])
            ->name("v1.test.index");                     // GET /api/v1/test

        // Sanitization middleware test group
        Route::prefix("sanitization")->group(function (): void {
            Route::get("help", [v1TestMiddlewareSanitization::class, "help"])
                ->name("v1.test.sanitization.help");    // GET /api/v1/test/sanitization/help
            Route::post("/", [v1TestMiddlewareSanitization::class, "index"])
                ->name("v1.test.sanitization.index");   // POST /api/v1/test/sanitization
        });
    });

    // -----------------------
    // Users resource (public + auth + admin)
    // -----------------------
    Route::prefix("users")->group(function (): void {
        // Public help and listing
        Route::get("help", [v1UserController::class, "help"])
            ->name("v1.users.help");                    // GET /api/v1/users/help

        // Public list of active users
        Route::get("/", [v1UserController::class, "AllUsers"])
            ->name("v1.users.index");                   // GET /api/v1/users/

        // Search users (public)
        Route::get("/search", [v1UserController::class, "SearchUsers"])
            ->name("v1.users.search");                  // GET /api/v1/users/search

        // Show user profile (public)
        Route::get("/show/{id}", [v1UserController::class, "show"])
            ->name("v1.users.show");                    // GET /api/v1/users/show/{id}

        // ------------------------
        // Authenticated user actions (self)
        // ------------------------
        Route::middleware("auth:sanctum")->group(function (): void {
            // Change own password
            Route::patch("self/password", [v1UserController::class, "SelfchangePassword"])
                ->name("v1.users.self.change_password"); // PATCH /api/v1/users/self/password

            // Update own profile
            Route::put("self", [v1UserController::class, "AnyUserSelfUpdate"])
                ->name("v1.users.self.update");         // PUT /api/v1/users/self

            // Delete (deactivate) own account
            Route::delete("self", [v1UserController::class, "SelfDeactivate"])
                ->name("v1.users.self.deactivate");     // DELETE /api/v1/users/self

            // Display own info
            Route::get("me", [v1UserController::class, "DisplaySelf"])
                ->name("v1.users.self.me");             // GET /api/v1/users/me
        });

        // ------------------------
        // Admin user management (Role::ADMINISTRATOR)
        // ------------------------
        Route::middleware(["auth:sanctum", "roles:" . Role::ADMINISTRATOR])->group(function (): void {
            // Admin creates a user
            Route::post("/", [v1UserController::class, "AdminCreateUser"])
                ->name("v1.users.admin.create");        // POST /api/v1/users/

            // Admin updates a user
            Route::patch("{id}", [v1UserController::class, "AdminUpdateUser"])
                ->name("v1.users.admin.update");        // PATCH /api/v1/users/{id}

            // Admin deactivates a user
            Route::delete("{id}", [v1UserController::class, "AdminDeactivateUser"])
                ->name("v1.users.admin.deactivate");    // DELETE /api/v1/users/{id}
        });
    });
});
