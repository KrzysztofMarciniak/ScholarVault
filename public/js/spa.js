import { getCurrentUser, setCurrentUser, updateUserMenu } from './user_store.js';
import { renderLoginForm } from './login.js';
import { renderRegisterForm } from './register.js';
import { logout } from './logout.js';
import { initThemeSwitcher } from './theme.js';
import { initUserMenu } from './user_menu.js';
import { renderSidebar } from './sidebar.js';
import { renderSelfUpdate } from './self_update.js';
import { renderDeleteSelf } from './self_delete.js';
import { renderChangePassword } from './self_password.js';
const app = document.getElementById("app");

initUserMenu();

function getAuth() {
    const token = localStorage.getItem("api_token");
    const user = JSON.parse(localStorage.getItem("current_user") || "null");
    return { token, user };
}

function ensureAxiosHeader(token) {
    if (typeof axios !== 'undefined') {
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }
}
export function renderMenu(renderCallback) {
  const { token, user } = getAuth();
  ensureAxiosHeader(token);

  const menu = document.getElementById("menuList");
  if (!menu) return;

  menu.innerHTML = "";

  if (user) {
    // --- User Info ---
    const userInfoLi = document.createElement("li");
    userInfoLi.id = "menuUserInfo";
    userInfoLi.textContent = `${user.name} (${user.role || "User"})`;
    menu.appendChild(userInfoLi);
    // --- Update Profile ---
    const profileLi = document.createElement("li");
    const profileBtn = document.createElement("button");
    profileBtn.textContent = "Update Profile";
    profileBtn.className = "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700";
    profileBtn.onclick = () => {
      renderSelfUpdate(user, (updatedUser) => {
        user = updatedUser;
        userLi.textContent = `${user.name} (${user.role || "User"})`;
      });
    };
    profileLi.appendChild(profileBtn);
    menu.appendChild(profileLi);

    // --- Update Password ---
    const passwordLi = document.createElement("li");
    const passwordBtn = document.createElement("button");
    passwordBtn.innerHTML = `<span class="text-blue-600 dark:text-blue-400">Update Password</span>`;
    passwordBtn.className = "w-full text-left px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition";
    passwordBtn.onclick = () => {
      const content = document.getElementById("content");
      if (!content) return;

      content.innerHTML = "";
      renderChangePassword(() => {
        // Optional callback after password change
        console.log("Password updated successfully");
      });
    };
    passwordLi.appendChild(passwordBtn);
    menu.appendChild(passwordLi);

    // --- Deactivate Account ---
    const deleteLi = document.createElement("li");
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = `<span class="text-red-500">Deactivate Account</span>`;
    deleteBtn.className = "w-full text-left px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition";
    deleteBtn.onclick = () => {
      const content = document.getElementById("content");
      if (!content) return;

      content.innerHTML = "";
      renderDeleteSelf(() => {
        // User deleted, clear session and re-render app
        localStorage.removeItem("current_user");
        localStorage.removeItem("api_token");
        renderCallback();
      });
    };
    deleteLi.appendChild(deleteBtn);
    menu.appendChild(deleteLi);

    // --- Logout ---
    const logoutLi = document.createElement("li");
    const logoutBtn = document.createElement("button");
    logoutBtn.textContent = "Logout";
    logoutBtn.className = "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700";
    logoutBtn.onclick = async () => await logout(renderCallback);
    logoutLi.appendChild(logoutBtn);
    menu.appendChild(logoutLi);

  } else {
    // --- Login ---
    const loginLi = document.createElement("li");
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Login";
    loginBtn.className = "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700";
    loginBtn.onclick = () => renderLoginForm(renderCallback);
    loginLi.appendChild(loginBtn);

    // --- Register ---
    const registerLi = document.createElement("li");
    const registerBtn = document.createElement("button");
    registerBtn.textContent = "Register";
    registerBtn.className = "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700";
    registerBtn.onclick = () => renderRegisterForm(renderCallback);
    registerLi.appendChild(registerBtn);

    menu.appendChild(loginLi);
    menu.appendChild(registerLi);
  }
}

export function render() {
    app.innerHTML = "";

    const content = document.createElement("div");
    content.id = "content";
    content.style.padding = "1rem";

    const { user } = getAuth();
    if (user) {
        content.classList.add("ml-56");
    }

    app.appendChild(content);

    renderMenu(render);

    renderSidebar({
        adminDashboard: () => console.log("Rendering Admin Dashboard..."),
        adminUsers: () => console.log("Rendering Admin Users..."),
        adminArticles: () => console.log("Rendering Admin Articles..."),
        myArticles: () => console.log("Rendering Author Articles..."),
        submitArticle: () => console.log("Rendering Submit Article..."),
        assignedReviews: () => console.log("Rendering Assigned Reviews..."),
        reviewHistory: () => console.log("Rendering Review History...")
    });
}

window.render = render;

render();
initThemeSwitcher();
