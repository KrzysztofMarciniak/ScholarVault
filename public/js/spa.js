import { getCurrentUser, setCurrentUser, updateUserMenu } from './user_store.js';
import { renderLoginForm } from './login.js';
import { renderRegisterForm } from './register.js';
import { logout } from './logout.js';
import { initThemeSwitcher } from './theme.js';
import { initUserMenu } from './user_menu.js';
import { renderSidebar } from './sidebar.js';
import { initNotificationsModal } from "./notifications_ui.js";
import { renderSelfUpdate } from './self_update.js';
import { renderDeleteSelf } from './self_delete.js';
import { renderChangePassword } from './self_password.js';
import { createContentContainer } from './layout.js';
import { renderHome } from "./home.js";
const app = document.getElementById("app");

initUserMenu();
initNotificationsModal();
/* ------ Helpers ------ */
function createMenuButton(menu, label, className, handler, html = false) {
  const li = document.createElement("li");
  const btn = document.createElement("button");

  if (html) btn.innerHTML = label;
  else btn.textContent = label;

  btn.className = className;
  btn.onclick = handler;

  li.appendChild(btn);
  menu.appendChild(li);
  return li;
}

function getAuth() {
  const token = localStorage.getItem("api_token");
  const user = JSON.parse(localStorage.getItem("current_user") || "null");
  return { token, user };
}

function ensureAxiosHeader(token) {
  if (typeof axios !== 'undefined') {
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  }
}

/* ------ Menu configs ------ */

const loggedMenu = (user, renderCallback) => [
  {
    label: "Update Profile",
    className: "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
    action: () => {
      renderSelfUpdate(user, updatedUser => {
        setCurrentUser(updatedUser);
        updateUserMenu(updatedUser);
        const userInfoEl = document.getElementById("menuUserInfo");
        if (userInfoEl) userInfoEl.textContent = `${updatedUser.name} (${updatedUser.role || "User"})`;
        renderCallback();
      });
    }
  },

  {
    label: `<span class="text-blue-600 dark:text-blue-400">Update Password</span>`,
    html: true,
    className: "w-full text-left px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition",
    action: () => {
      const content = createContentContainer({ clearApp: false, padded: true, margin: "1rem", border: "1px solid #ccc", extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900" });
      content.innerHTML = "";
      renderChangePassword(() => console.log("Password updated"));
    }
  },

  {
    label: `<span class="text-red-500">Deactivate Account</span>`,
    html: true,
    className: "w-full text-left px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition",
    action: () => {
      const content = createContentContainer({ clearApp: false, padded: true, margin: "1rem", border: "1px solid #ccc", extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900" });
      content.innerHTML = "";
      renderDeleteSelf(() => {
        localStorage.removeItem("current_user");
        localStorage.removeItem("api_token");
        updateUserMenu(null);
        renderCallback();
      });
    }
  },

  {
    label: "Logout",
    className: "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
    action: async () => {
      await logout(renderCallback);
      localStorage.removeItem("current_user");
      localStorage.removeItem("api_token");
      ensureAxiosHeader(null);
      updateUserMenu(null);
      renderCallback();
    }
  }
];

const guestMenu = (renderCallback) => [
  {
    label: "Login",
    className: "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
    action: () => renderLoginForm(renderCallback)
  },
  {
    label: "Register",
    className: "w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700",
    action: () => renderRegisterForm(renderCallback)
  }
];

/* ------ Render helpers ------ */

function renderMenuItems(menuEl, user, renderCallback) {
  if (!menuEl) return;

  menuEl.innerHTML = "";

  if (user) {
    const userInfoLi = document.createElement("li");
    userInfoLi.id = "menuUserInfo";
    userInfoLi.textContent = `${user.name} (${user.role || "User"})`;
    menuEl.appendChild(userInfoLi);

    // divider
    const divider = document.createElement("li");
    divider.className = "border-t border-gray-200 dark:border-gray-700 my-2";
    menuEl.appendChild(divider);

    loggedMenu(user, renderCallback).forEach(item =>
      createMenuButton(menuEl, item.label, item.className, item.action, item.html)
    );
  } else {
    guestMenu(renderCallback).forEach(item =>
      createMenuButton(menuEl, item.label, item.className, item.action)
    );
  }
}

/* ------ Public API ------ */

export function renderMenu(renderCallback) {
  const { token, user } = getAuth();
  ensureAxiosHeader(token);
  renderHome();

  const menu = document.getElementById("menuList");
  if (!menu) return;

  renderMenuItems(menu, user, renderCallback);
}

export function render() {
  // use our new container with margin/padding/border
  const content = createContentContainer({
    padded: true,
    margin: "1rem",
    border: "1px solid #ccc",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900"
  });

  const { user } = getAuth();
  if (user) content.classList.add("ml-56");

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
