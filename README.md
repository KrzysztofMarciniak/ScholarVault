# Project
Scientific publishing web engine built with Laravel.
---
## Stack
Built with:
- **Laravel 12**  
  https://laravel.com/docs/12.x/releases  
  <img src="readme_logos/laravel_logo.png" alt="Laravel Logo" width="50"/>
- **OpenBSD**  
  https://www.openbsd.org/  
  <img src="readme_logos/openbsd_logo.svg" alt="OpenBSD Logo" width="50"/>
- **Doom Emacs**  
  https://github.com/doomemacs/doomemacs  
  <img src="readme_logos/doom_emacs_logo.png" alt="Doom Emacs Logo" width="50"/>
---
## API Conventions
API version `v1` exposes a **built-in help endpoint for every route**.
### Pattern

```
GET /api/v1/{endpoint}/help
```
To obtain documentation for:
/api/v1/test
```
GET /api/v1/test/help
```

The endpoint returns JSON describing:

- method
- parameters
- authentication requirements
- description


## Libraries used:

[blumilksoftware/codestyle](https://github.com/blumilksoftware/codestyle)
[elegantweb/sanitizer](https://github.com/elegantweb/sanitizer)

### dev

``` sh
chmod +x;
./start.sh
```

### Screenshots:
---

# Interface

## Main Interface

![Main Interface](screenshots/main.png)

---

## Users

User listing view.

![Users](screenshots/users.png)

---

## User Search

Search interface for locating users.

![Search Users](screenshots/search_users.png)

---

## Admin User Management

Administrative panel for managing users.

Capabilities include:

- updating user information
- role management
- account deactivation

![Admin Manage Users](screenshots/admin_manage_users.png)

---
