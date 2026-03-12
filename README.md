# ScholarVault
## Introduction
ScholarVault is a web based platform for publishing and managing scientific articles. It provides user account creation and management, enables authors to submit and revise articles, and allows reviewers to provide feedback to improve submissions. Administrators oversee the process and can make final decisions to publish articles.
### Motivation
There is a clear shortage of open-source, high-performance SPA (Single Page Application) engines specifically tailored for scientific publishing workflows, making ScholarVault a solution that addresses this gap efficiently.
### Technologies
**Backend: Laravel 12 API**
Laravel 12 was selected for its rapid development capabilities, robust ecosystem, built-in authentication and authorization features, and seamless support for RESTful APIs. Its expressive syntax and active community make it ideal for building a secure and maintainable backend for ScholarVault.
**Frontend: SPA with Axios, TailwindCSS, and Font Awesome**
* **Axios** is used for efficient HTTP requests and API integration.
* **TailwindCSS** allows for rapid, utility-first styling with consistent design and easy customization.
* **Font Awesome** provides a comprehensive icon library to improve UI clarity and usability.
This combination ensures a modern, performant, and maintainable frontend that aligns with the backend API for fast and interactive article management.
## Implementation
### Functionality
#### User
#### Article
### Router
### Models
### Controllers
### Services



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
