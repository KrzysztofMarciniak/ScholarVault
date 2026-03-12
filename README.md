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
