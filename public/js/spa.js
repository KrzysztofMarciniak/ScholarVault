import { getCurrentUser, setCurrentUser, updateUserMenu } from './user_store.js';
import { renderLoginForm } from './login.js';
import { renderRegisterForm } from './register.js';
import { logout } from './logout.js';
import { initUserMenu } from './user_menu.js';
import { renderSidebar } from './sidebar.js';
import { initNotificationsModal } from "./notifications_ui.js";
import { initThemeSwitcher } from "./theme_switch.js";
import { renderSelfUpdate } from './self_update.js';
import { renderDeleteSelf } from './self_delete.js';
import { renderChangePassword } from './self_password.js';
import { createContentContainer } from './layout.js';
import { renderHome } from "./home.js";

const app = document.getElementById("app");

initUserMenu();
initNotificationsModal();
initThemeSwitcher();

/* ------ Inject theme-aware CSS once ------ */
(function injectAppStyles() {
  if (document.getElementById("app-theme-styles")) return;

  const style = document.createElement("style");
  style.id = "app-theme-styles";
  style.textContent = `
    .app-container {
      margin: 1rem;
    }

    .app-card {
      background: var(--modal-bg);
      color: var(--modal-text);
      border: 1px solid var(--input-border);
      border-radius: 0.75rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);
      transition: background 0.2s, color 0.2s, border 0.2s;
    }

    .menu-btn {
      width: 100%;
      text-align: left;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      background: transparent;
      color: var(--body-text);
      border: none;
    }

    .menu-btn:hover {
      background: var(--button-hover-bg);
      color: var(--button-text);
    }

    .menu-btn-danger:hover {
      background: var(--notification-error-bg);
      color: var(--notification-error-text);
    }

    .menu-btn-accent:hover {
      background: var(--notification-info-bg);
      color: var(--notification-info-text);
    }

    #menuUserInfo {
      padding: 0.5rem;
      font-weight: 600;
      color: var(--body-text);
    }

    .menu-divider {
      border-top: 1px solid var(--input-border);
      margin: 0.5rem 0;
    }
  `;
  document.head.appendChild(style);
})();

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
    className: "menu-btn",
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
    label: "Update Password",
    className: "menu-btn menu-btn-accent",
    action: () => {
      const content = createContentContainer({
        padded: true,
        extraClasses: "app-card app-container"
      });
      content.replaceChildren();
      renderChangePassword(() => console.log("Password updated"));
    }
  },

  {
    label: "Deactivate Account",
    className: "menu-btn menu-btn-danger",
    action: () => {
      const content = createContentContainer({
        padded: true,
        extraClasses: "app-card app-container"
      });
      content.replaceChildren();
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
    className: "menu-btn",
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
    className: "menu-btn",
    action: () => renderLoginForm(renderCallback)
  },
  {
    label: "Register",
    className: "menu-btn",
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

    const divider = document.createElement("li");
    divider.className = "menu-divider";
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
  const content = createContentContainer({
    padded: true,
    extraClasses: "app-card app-container"
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
