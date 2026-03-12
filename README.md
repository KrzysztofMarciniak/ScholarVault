# ScholarVault
## Introduction
ScholarVault is a web based platform for publishing and managing scientific articles. It provides user account creation and management, enables authors to submit and revise articles, and allows reviewers to provide feedback to improve submissions. Administrators oversee the process and can make final decisions to publish articles.
### Motivation
There is a clear shortage of open-source, high-performance SPA (Single Page Application) engines specifically tailored for scientific publishing workflows, making ScholarVault a solution that addresses this gap efficiently.
### Technologies
**Backend: Laravel 12 API**
Laravel 12 was selected for its rapid development capabilities, robust ecosystem, built-in authentication and authorization features, and seamless support for RESTful APIs. Its expressive syntax and active community make it ideal for building a secure and maintainable backend for ScholarVault.
**Libraries used:**
* [blumilksoftware/codestyle](https://github.com/blumilksoftware/codestyle) : Enforces consistent code style and formatting across the project.
* [elegantweb/sanitizer](https://github.com/elegantweb/sanitizer) : Provides input sanitization to enhance security and prevent malicious data injection.
**Frontend: SPA with Axios, TailwindCSS, and Font Awesome**
* **Axios** is used for efficient HTTP requests and API integration.
* **TailwindCSS** allows for rapid, utility-first styling with consistent design and easy customization.
* **Font Awesome** provides a comprehensive icon library to improve UI clarity and usability.
This combination ensures a modern, performant, and maintainable frontend that aligns with the backend API for fast and interactive article management.
## Implementation
The typical workflow begins with an author registering on the platform and submitting a new article. The author can then collaborate with assigned reviewers (Administrator assigns them), addressing feedback and submitting revisions as needed. Once the review process is complete (accepted), administrators make the final decision to either publish or reject the article, ensuring quality and compliance with platform standards.
### Functionality
Home Page
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/5b05206a-ffa7-4ea5-9bb6-a81cd029b7b5" />
#### User
Notifications:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4c8a74ba-0403-4087-9182-f7bc9491368d" />

Login Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e22d8b8d-fedd-451f-a78a-ae1581b520a9" />

Registarion Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a0b0932a-b861-4281-8062-1eef4eed1e1a" />

Update Profile Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8a2da307-c6ee-464e-87cc-2995101cbfb5" />
Change Password Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/66582348-6fab-4843-bbcd-d715ddd5fdf2" />
Deactivate Account Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/04a25ba0-fe91-4eba-8c76-62addd0ef094" />
All Users Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7356cc4c-a855-4120-97a7-d7d2ad6a5bfe" />
User Search Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f9abc38f-fd96-4a2c-b4df-1b10f6847372" />
User Creation Page (Admin version has less requirements):
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/14d9ed21-5b77-4e4c-a34a-e237637a9fc4" />
Admin Controls User Controls Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/49053260-8a75-435b-b515-2958359e7e44" />

#### Article
Published Article Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/f715c02f-a7e0-4f2c-b7ed-0db76d4e5bb1" />

### Author
Submit Article Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/488a68c2-4bf9-422c-b506-ae9d64a25926" />
My Articles Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3b157249-0fc7-4789-bf29-ef4dfb49f374" />
My Article Details Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fcba6e8f-6c48-4ace-8175-e4c432687b74" />
Comment Page and before revision:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/37c4a844-e6f5-4bd7-9a71-5db67d859696" />
After revision:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c1cf28b4-e24f-4774-a749-4e155fae3f9d" />
### Admin
All Articles Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/13f75f0a-de41-417d-87d7-d03b47c06afe" />
Assign Reviewer Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8574c785-4def-4cde-a3f1-9f36f9acc54e" />
Publish Accepted Article Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ba36655a-b60c-440d-adda-209edefee350" />


### Reviewer
All Assigned Articles Page:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7d542aca-8b49-4b84-af46-0ceaec64a02e" />
Assigned Article Details:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/8262be85-471b-4848-a4ad-ebe46538398d" />



### Router
#### `api.php` (API routes `/api/v1/...`)

* **Prefix:** `/api/v1`
* **Purpose:** Handles all RESTful API endpoints for authentication, users, articles, notifications, and testing utilities.

##### **Notifications**

* `/notifications/check` - GET, check new notifications
* `/notifications/read/{id}` - PATCH, mark single notification read
* `/notifications/read-all` - PATCH, mark all notifications read
* **Middleware:** `auth:sanctum`

##### **Articles**

* **Public:** `/articles/` - list and show articles
* **Author (Role::AUTHOR):**

  * Submit: `/articles/submit` - POST
  * List own articles: `/articles/my/list` - GET
  * View own article: `/articles/my/{id}` - GET
  * Comments (list/add): `/articles/my/comments/{id}` - GET/POST
  * Submit revision: `/articles/my/revision/{id}` - POST
* **Reviewer (Role::REVIEWER):**

  * Assigned articles: `/articles/assigned` - GET
  * View assigned article: `/articles/assigned/{id}` - GET
  * Comment/review: `/articles/assigned/comment/{id}` and `/articles/assigned/{id}/review` - POST
  * Make decision: `/articles/assigned/decide/{id}` - POST
* **Admin (Role::ADMINISTRATOR):**

  * List all articles: `/articles/admin/` - GET
  * List reviewers: `/articles/admin/reviewers` - GET
  * Assign reviewers: `/articles/admin/reviewers/{id}` - PATCH
  * Accept/reject: `/articles/admin/decide/{id}` - PATCH

##### **Registration & Authentication**

* `/register/` - POST, blocked if authenticated
* `/login/` - POST, blocked if authenticated
* `/login/logout` - POST, requires auth
* `/register/help` & `/login/help` - GET

##### **Users**

* Public: list, search, show
* Authenticated self: update, password change, deactivate, profile info
* Admin: create, update, deactivate

##### **Testing Utilities**

* `/test/` - GET index
* `/test/sanitization` - POST test middleware

#### `web.php` (SPA entry point)

* **Purpose:** Serves the SPA page at `/`
* **Route:** `Route::get("/", fn() => view("spa"));`
* **Note:** All client-side routing handled by the SPA; API calls go through `/api/v1/...`.

#### Conclusion

1. **API-first design:** All data operations via `/api/v1` with proper role-based access.
2. **SPA serving:** Single route for front-end with client-side routing.
3. **Scalability:** Role-specific middleware isolates permissions cleanly.
4. **Maintainability:** Clear endpoint grouping (`author`, `reviewer`, `admin`).


### **Models Overview**

#### 1. `Article`

* **Relationships:**

  * `status()` → `ArticleStatus` (belongsTo)
  * `reviewers()` → `User` (many-to-many via `article_reviewer`)
  * `authors()` → `User` (many-to-many via `article_user`)
  * `citations()` → `Article` (self-referencing many-to-many)
  * `citedBy()` → `Article` (inverse self-referencing many-to-many)
  * `comments()` → `ArticleComment` (hasMany)
  * `files()` → `ArticleFile` (hasMany, ordered by version)

* **Scopes & Helpers:**

  * `scopeAuthoredBy($authorId)` - filter articles by author
  * `latestFile()` / `latestFileOfMany()` - retrieve most recent uploaded file
  * `toAuthorDetailArray()` - array representation for author view, includes authors, citations, files

#### 2. `ArticleComment`

* **Relationships:**

  * `article()` → `Article` (belongsTo)
  * `user()` → `User` (belongsTo)
* **Purpose:** Stores comments for articles

#### 3. `ArticleFile`

* **Relationships:**

  * `article()` → `Article` (belongsTo)
  * `uploader()` → `User` (belongsTo via `uploaded_by`)
* **Purpose:** Stores uploaded files and revisions for articles

#### 4. `ArticleReviewer`

* **Purpose:** Pivot table `article_reviewer` linking `Article` ↔ `User`

#### 5. `ArticleStatus`

* **Relationships:**

  * `articles()` → `Article` (hasMany)
* **Purpose:** Defines statuses like “submitted”, “under review”, “accepted”, “rejected”

#### 6. `Notification`

* **Relationships:**

  * `user()` → `User` (belongsTo)
* **Helpers:**

  * `forUser($user, $onlyUnread)` - fetch notifications for a user
  * `unreadCount($user)` - count unread notifications

#### 7. `Review`

* **Relationships:**

  * `article()` → `Article` (belongsTo)
  * `reviewer()` → `User` (belongsTo via `reviewer_id`)
* **Purpose:** Stores reviewer comments per article

#### 8. `Role`

* **Constants:** `AUTHOR=1`, `REVIEWER=2`, `ADMINISTRATOR=3`
* **Relationships:** `users()` → `User` (hasMany)

#### 9. `User`

* **Relationships:**

  * `role()` → `Role` (belongsTo)
  * `articles()` → `Article` (hasMany via `author_id`)
  * `reviews()` → `Review` (hasMany via `reviewer_id`)
* **Mutators & Accessors:**

  * `setPasswordAttribute()` - auto-hash
  * `getDisplayNameAttribute()` - fallback to email
* **Helpers:**

  * `isAuthor()`, `isReviewer()`, `isAdministrator()`
  * `activate()`, `deactivate()`, `canBeDeactivated()`
  * `assignRole($roleId)`
* **Scopes:** `active()`, `search()`, `withRoleName()`
* **Array Representations:** `toListArray()`, `toSearchArray()`, `toProfileArray()`

#### Conclusion

1. **Author-Reviewer-Admin workflow** is supported via pivot tables (`article_user`, `article_reviewer`) and the `Role` model.
2. **Articles have versioned files**; latest is easily accessible (`latestFile()`).
3. **Notifications** are scoped to users and track read/unread.
4. **User deactivation logic** is robust: admins cannot deactivate the last active admin.
5. **Self-contained helpers** allow conversion to array representations suitable for API responses.

### Controllers Overview

#### 1. `Controller` (abstract)

* Base abstract class for all controllers.
* No methods or properties.

#### 2. `v1Controller` (abstract)

* Extends `Controller`.
* **Purpose:** Base for versioned API controllers.
* **Abstract method:** `help(ApiDocsService $apiDocs): JsonResponse` - every v1 controller must provide API usage instructions.

#### 3. `v1TestController`

- Extends `v1Controller`.
- **Functions:**

  ##### `index() : JsonResponse`
  - Returns a basic success message confirming that the API is working.
  - **Purpose:** Provides a quick check to verify that version 1 of the API is functioning.
    
#### 4. `v1TestMiddlewareSanitization`

- Extends `v1Controller`.
- **Functions:**

  #### `index(Request $request) : JsonResponse`
  - Returns both the raw request body and the sanitized subset containing only `email` and `password`.
  - **Purpose:** Tests the request sanitization middleware by showing what comes raw from the client and what remains after sanitation.


#### 5. `v1LoginController`
- Extends `Controller`.
- **Functions:**
  #### `login(Request $request, AuthService $service) : JsonResponse`
  - Validates the request for `email` and `password`.
  - Uses `AuthService` to authenticate the user.
  - Returns JSON with `token` and `user` data if successful.
  - Handles exceptions:
    - `AuthenticationException` → 401 Unauthorized
    - `RuntimeException` → 403 Forbidden (if code = 403) or 422 Unprocessable
  - **Purpose:** Authenticates a user and provides an API token for further requests.

  #### `logout(Request $request, AuthService $service) : JsonResponse`
  - Revokes the current API token for the authenticated user.
  - Returns a success message in JSON.
  - **Purpose:** Logs out the user and invalidates their current API session.

#### 6. `v1RegisterController`
- Extends `Controller`.
- **Functions:**

  ##### `register(Request $request, RegistrationService $registration) : JsonResponse`
  - Validates the incoming request for user registration:
    - `name`: required string, max 255
    - `email`: required, valid email, unique
    - `password`: required, string, min 8
    - Optional: `affiliation`, `orcid`, `bio`
  - Calls `RegistrationService` to create a new user (AUTHOR role only).
  - Returns a JSON response with the created user data and HTTP status 201.
  - **Purpose:** Handles new user registration, ensuring proper validation and role assignment.

#### 7. `v1NotificationController`

- Extends `Controller`.
- **Functions:**

  ##### `check(Request $request) : JsonResponse`
  - Retrieves the authenticated user via Sanctum.
  - Returns JSON containing:
    - `notifications`: list of notifications for the user
    - `unread_count`: number of unread notifications
  - If the user is not authenticated, returns empty notifications and unread count with HTTP 401.
  - **Purpose:** Allows a user to fetch all their notifications and see how many are unread.

  ##### `markRead(Request $request, int $id) : JsonResponse`
  - Retrieves the authenticated user.
  - Finds the notification with the given `id` for that user.
  - Marks the notification as read if it isn’t already (`read_at = now()`).
  - Returns JSON with a success message and the notification ID.
  - Handles errors:
    - 401 if unauthenticated
    - 404 if notification not found
  - **Purpose:** Marks a specific notification as read for the current user.

  ##### `markAllRead(Request $request) : JsonResponse`
  - Retrieves the authenticated user.
  - Marks all unread notifications for the user as read.
  - Returns JSON with a message and the number of notifications updated.
  - Returns 401 if the user is not authenticated.
  - **Purpose:** Provides a convenient way for a user to mark all their notifications as read at once.

#### 8. `v1UserController`

- Extends `v1Controller`.
- **Functions:**

  ##### `AdminCreateUser(Request $request, AdminUserService $service) : JsonResponse`
  - Validates admin-provided data for creating a new user.
  - Calls `AdminUserService` to create the user with the specified role and optional profile fields.
  - Returns JSON with the created user and HTTP status 201.
  - **Purpose:** Allows administrators to create new users.

  ##### `AllUsers(Request $request) : JsonResponse`
  - Fetches all active users, paginated with optional `per_page` query parameter (max 100).
  - Includes role names.
  - **Purpose:** Provides a paginated list of all active users for viewing.

  ##### `AdminUpdateUser(Request $request, int $id, AdminUserService $service) : JsonResponse`
  - Validates optional update fields for the specified user.
  - Calls `AdminUserService` to update the user partially (PATCH semantics).
  - Returns JSON with the updated user data.
  - **Purpose:** Allows administrators to update any user's profile or role.

  ##### `AnyUserSelfUpdate(Request $request, AnyUserService $service) : JsonResponse`
  - Validates fields for the authenticated user's profile update.
  - Calls `AnyUserService` to update the current user.
  - Returns JSON with updated user data.
  - **Purpose:** Allows users to update their own profile information.

  ##### `AdminDeactivateUser(int $id, AnyUserService $service) : JsonResponse`
  - Finds the user by ID and checks if they can be deactivated.
  - Calls `AnyUserService` to deactivate the user.
  - Returns JSON with a success or error message.
  - **Purpose:** Allows administrators to deactivate any user.

  ##### `SelfDeactivate(Request $request, AnyUserService $service) : JsonResponse`
  - Deactivates the currently authenticated user.
  - Handles runtime exceptions and returns error if deactivation fails.
  - **Purpose:** Enables users to deactivate their own accounts.

  ##### `SearchUsers(Request $request) : JsonResponse`
  - Validates a search query (`q`) and optional `per_page`.
  - Searches users by name, email, or affiliation.
  - Admins can see deactivated users and roles; regular users see active users only.
  - Returns paginated search results.
  - **Purpose:** Provides a user search feature for both admins and regular users.

  ##### `SelfChangePassword(Request $request, AnyUserService $service) : JsonResponse`
  - Validates `current_password` and `new_password` (with confirmation).
  - Checks that `current_password` matches stored hash.
  - Calls `AnyUserService` to update the password.
  - Returns JSON success or error messages.
  - **Purpose:** Allows users to securely change their own password.

  ##### `DisplaySelf(Request $request) : JsonResponse`
  - Returns the authenticated user's profile in array form.
  - **Purpose:** Fetch the current user's own profile.

  ##### `show(Request $request, int $id) : JsonResponse`
  - Returns the specified user's profile in array form.
  - **Purpose:** Allows retrieval of any user's profile by ID (admin-only or according to permissions).
  
#### 9. `v1ArticleController`

- Extends `Controller`.
- **Functions:**

  ##### `index(Request $request, AnyArticleService $service) : JsonResponse`
  - Accepts optional filters via query: `page`, `per_page`, `search`, `keyword`, `author_id`, `sort`.
  - Automatically filters articles to `status_id = PUBLISHED`.
  - Calls `AnyArticleService::listArticles($filters)` to fetch paginated articles.
  - Returns JSON with paginated results including article metadata, authors, and citation counts.
  - **Purpose:** Provides a paginated list of all published articles with optional search and filtering.

  ##### `show(Request $request, int $id, AnyArticleService $service) : JsonResponse`
  - Retrieves a single article by its ID via `AnyArticleService::getArticle($id)`.
  - Returns JSON with full article details: title, abstract, DOI, keywords, file info, authors, reviewers, citations, and timestamps.
  - Returns 404 if the article does not exist.
  - **Purpose:** Provides detailed information for a single published article.

#### 10. `v1AuthorArticleController`

* Extends `v1Controller`.
* **Functions:**

  ##### `store(Request $request, AuthorArticleService $service) : JsonResponse`

  * Validates `title`, `abstract`, `file` (PDF/TeX), and optional `keywords`.
  * Calls `AuthorArticleService::submitArticle()` with current user ID and request data.
  * Returns JSON with the newly created article.
  * **Purpose:** Submits a new article as an author.

  ##### `myArticles(Request $request, AuthorArticleService $service) : JsonResponse`

  * Fetches paginated list of articles authored by the current user.
  * Maps results to `id`, `title`, `abstract`, `doi`, and `status`.
  * Returns JSON with article list and pagination info.
  * **Purpose:** Lists all authored articles with status and metadata.

  ##### `myArticle(Request $request, int $id, AuthorArticleService $service) : JsonResponse`

  * Fetches a single authored article by ID.
  * Includes latest file info (`filename`, `file_type`, `version_number`) if present.
  * Returns 404 if article not found or not owned by user.
  * **Purpose:** Shows detailed information for one authored article.

  ##### `listComments(Request $request, int $id, AuthorArticleService $commentsService) : JsonResponse`

  * Retrieves comments for a specific article that the author owns.
  * Maps each comment to `id`, `user`, `comment`, `created_at`.
  * **Purpose:** Shows discussion between authors and reviewers.

  ##### `addComment(Request $request, int $id, AuthorArticleService $commentsService) : JsonResponse`

  * Validates `comment` field.
  * Adds a new comment to the article discussion via `AuthorArticleService`.
  * Returns JSON with `id`, `user`, `comment`, `created_at`.
  * **Purpose:** Allows author to post a comment on their article discussion thread.

  ##### `submitRevision(Request $request, int $id, AuthorArticleService $service) : JsonResponse`

  * Validates `file` (PDF/TeX) and optional `notes`.
  * Submits a revision for an existing article via `AuthorArticleService`.
  * Returns JSON with the updated article/revision info.
  * **Purpose:** Handles revision uploads after reviewer feedback.

#### 11. `v1AdminArticleController`

* Extends `v1Controller`.
* **Functions:**

  ##### `listReviewers(Request $request, AdminArticleService $service) : JsonResponse`

  * Retrieves a paginated list of reviewers with optional search.
  * Returns JSON with reviewer details.
  * **Purpose:** Allows admin to browse all reviewers.

  ##### `AdminlistAllArticles(Request $request, AdminArticleService $service) : JsonResponse`

  * Retrieves all articles with optional status and search filters, paginated (default 5 per page).
  * Logs incoming filters and paginated results.
  * Returns JSON with full article data including authors and citations.
  * **Purpose:** Allows admin to view all articles with full metadata.

  ##### `AdminAssignReviewers(Request $request, int $id, AdminArticleService $service) : JsonResponse`

  * Validates an array of reviewer IDs.
  * Calls `AdminArticleService::assignReviewers()` to assign reviewers to an article.
  * Updates article status to `UNDER_REVIEW` and fires `ReviewersAssigned` event.
  * Attaches latest file info (`filename`, `file_type`, `version_number`) if present.
  * Returns JSON with updated article object.
  * **Purpose:** Assigns reviewers to an article and updates its review status.

  ##### `makeDecision(Request $request, int $id, AdminArticleService $service) : JsonResponse`

  * Validates `status` field to be either `published` or `rejected_by_admin`.
  * Calls `AdminArticleService::makeDecision()` to finalize article decision.
  * Returns JSON with success or error message and appropriate HTTP status code.
  * **Purpose:** Allows admin to publish or reject an article.

#### 12. `v1ReviewerArticleController`

* Extends `v1Controller`.
* **Functions:**

  ##### `assignedArticles(Request $request, ReviewerArticleService $service) : JsonResponse`

  * Retrieves paginated list of articles assigned to the current reviewer (default 10 per page).
  * Returns JSON with article data.
  * **Purpose:** Allows a reviewer to see all articles they are assigned to.

  ##### `assignedArticle(Request $request, int $id, ReviewerArticleService $service) : JsonResponse`

  * Fetches a single assigned article by ID for the current reviewer.
  * Includes latest file info (`filename`, `file_type`, `version_number`) if available.
  * Returns 404 if article not assigned to the reviewer.
  * **Purpose:** Provides detailed view of an assigned article for review.

  ##### `leaveComment(Request $request, int $id, ReviewerArticleService $service) : JsonResponse`

  * Validates `comment` field (required, max 5000 characters).
  * Creates a new `ArticleComment` for the assigned article.
  * Returns JSON with comment details.
  * **Purpose:** Allows reviewer to post a comment on an assigned article.

  ##### `submitAssignedReview(Request $request, int $id, ReviewerArticleService $service) : JsonResponse`

  * Submits a full review for an assigned article via `ReviewerArticleService`.
  * Returns JSON with review result or metadata.
  * **Purpose:** Allows reviewer to submit evaluation/review of their assigned article.

  ##### `makeDecision(Request $request, int $id) : JsonResponse`

  * Validates `decision` field (`accepted` or `rejected`).
  * Checks if the reviewer is assigned to the article.
  * Prevents invalid status changes (e.g., rejecting already accepted articles).
  * Updates `status_id` on the `Article` model accordingly.
  * Returns JSON with `status`, `article_id`, and `new_status`.
  * **Purpose:** Lets reviewers record their acceptance or rejection decision on assigned articles.

  ##### `help(ApiDocsService $apiDocs) : JsonResponse`

  * Registers API documentation endpoints relevant for reviewer usage.
  * Returns JSON with structured endpoint definitions.
  * **Purpose:** Provides programmatic help/documentation for reviewer article endpoints.

#### Conclusion
The v1 controller architecture establishes a clear separation of responsibilities across public, author, reviewer, and administrator workflows. Controllers remain thin, delegating business logic such as article state transitions, reviewer assignments, and file handling to dedicated service classes. Role based middleware and ownership checks enforce security consistently, while standardized response formats ensure predictable API behavior for clients. By combining validation, authorization, structured error handling, and event driven notifications, this design achieves maintainability, testability, and scalability, providing a robust foundation for a scientific article publishing system.

### Services
#### User
The user service layer provides role-aware, centralized business logic for all user-related operations, separating administrative actions from regular self-service workflows.

**Components:**

1. **BaseUserService** - Abstract class defining the uniform interface:

   * `create(array $data): User`
   * `update(User $user, array $data): User`

2. **AdminUserService** - For administrator actors:

   * Can create users (`createFromAdmin`) and update any user (`updateFromAdmin`).
   * Tracks modified fields via `getDirtyKeys()` and fires `UserModifiedByAdmin` events for audit purposes.

3. **AnyUserService** - For non-administrators:

   * Prevents creation of users (throws exception).
   * Allows updating own profile, changing password (`changePassword`), and self-deactivation (`deactivate`).
   * Fires `UserUpdatedSelf` and `UserChangedPassword` events for tracking.
   * Ensures deactivation is idempotent and revokes all API tokens.

4. **UserServiceFactory** - Returns the correct service instance based on actor role:

   * Administrator → `AdminUserService`
   * Regular user → `AnyUserService`

**Design Highlights:**

* **Role separation:** Admins have full user management capabilities, where regular users are limited to self-service.
* **Controller simplification:** Controllers delegate business rules to services, remaining thin.
* **Auditability & security:** Dirty-field tracking and role enforcement prevent unauthorized modifications.

#### Authentication & Registration

The authentication and registration services handle user login, logout, and new account creation, centralizing security and session management logic.

**Components:**

1. **AuthService** - Manages login and logout for existing users:

   * **Login (`login(array $credentials): array`)**

     * Verifies credentials via `Auth::attempt`.
     * Rejects login if the account is deactivated (throws 403).
     * Returns a fresh API token and normalized user profile (`toProfileArray`).
   * **Logout (`logout(User $user): void`)**

     * Deletes the current API token for the authenticated user.

2. **RegistrationService** - Handles new user registration:

   * Registers new users with a default `AUTHOR` role.
   * Uses database transactions to ensure atomic creation.
   * Generates a new API token upon registration.
   * Returns normalized user profile and token for immediate use.

**Design Highlights:**

* **Security:** Centralized credential verification and token management.
* **Role assignment:** New users are automatically assigned the `AUTHOR` role, ensuring predictable privileges.
* **Transactional safety:** User creation is wrapped in a DB transaction to prevent partial writes.
* **Consistency:** Responses follow the `{ token, user }` shape for API clients.

#### Article Management

The article services encapsulate all business logic for handling articles in different roles: authors, reviewers, administrators, and public users. They centralize file handling, status transitions, commenting, and filtering to maintain consistency across controllers.

**Components:**

1. **BaseArticleService** - Abstract base providing shared traits:

   * **ArticleTransformTrait** - Maps articles to standardized list/detail arrays including authors, files, citations, and reviewer info.
   * **ArticleQueryTrait** - Handles filtering (`author_id`, `keyword`, `search`) and sorting (`oldest`, newest first).
   * Provides `paginateQuery` for consistent pagination.

2. **AnyArticleService** - Public-facing read-only operations:

   * `listArticles(array $filters)` - Returns paginated published articles with optional search, keyword, author filters.
   * `getArticle(int $id)` - Returns a single article detail or null if not found.
   * Only includes articles with `ArticleStatus::PUBLISHED`.

3. **AuthorArticleService** - Author-facing operations:

   * `submitArticle(...)` - Handles new article submissions with file storage, primary author assignment, versioning, and triggers `ArticleSubmitted` event.
   * `listMyArticles(int $authorId)` - Returns paginated authored articles.
   * `viewMyArticle(int $authorId, int $articleId)` - Returns detailed article with files, citations, and authors.
   * `listComments` / `addComment` - Manage author-visible comments.
   * `submitRevision` - Handles file revisions while preventing edits to finalized articles (`ACCEPTED` or `PUBLISHED`).

4. **ReviewerArticleService** - Reviewer-facing operations:
 
   * `assignedArticles(User $user)` - Paginated list of articles assigned to the reviewer.
   * `assignedArticle(User $user, int $id)` - Detailed view including comments.
   * `submitReview` - Create/update a `Review` with validation.
   * `submitReviewDecision` - Reviewer can mark article `ACCEPTED` or `REJECTED`.
   * Maps articles differently for list vs. detail view, normalizing latest file data, comments, and associated authors.

5. **AdminArticleService** - Administrator operations:

   * `listArticles(int $perPage, array $filters)` - Full paginated article view with filters (`status`, `search`).
   * `listReviewers(int $perPage, ?string $search)` - Lists reviewers with optional search.
   * `assignReviewers(int $articleId, array $reviewerIds)` - Assigns reviewers, validating roles.
   * `makeDecision(int $articleId, string $status)` - Admin-level decision to `publish` or `reject_by_admin`.
   * Provides transformations for detailed admin views including authors, citations, and reviewers.

6. **ArticleCommentService** - Centralized comment logic (for both authors and reviewers):

   * `addComment` / `listComments` - Adds or retrieves comments only if user is author or assigned reviewer.
   * `deleteComment` - Reviewer-only deletion.
   * Internal checks enforce role-based access to comments.

**Design Highlights:**

* **Role-based encapsulation:** Services isolate logic per role (author, reviewer, admin, public).
* **File versioning:** Author submissions and revisions store versioned files.
* **Event-driven:** Actions like `ArticleSubmitted` and `ReviewSubmitted` trigger events for downstream processing.
* **Filtering & pagination:** Uniform query filters and pagination via traits ensure consistent results across endpoints.
* **Validation & access control:** All operations validate user permissions before mutating data.

---
### Stack

Built with:
- **OpenBSD**  
  https://www.openbsd.org/  
  <img src="readme_logos/openbsd_logo.svg" alt="OpenBSD Logo" width="50"/>
- **Doom Emacs**  
  https://github.com/doomemacs/doomemacs  
  <img src="readme_logos/doom_emacs_logo.png" alt="Doom Emacs Logo" width="50"/>

### dev

``` sh
chmod +x;
./start.sh
```
