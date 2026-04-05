let __userMenuStylesInjected = false;
function ensureUserMenuStyles() {
  if (__userMenuStylesInjected) return;
  const style = document.createElement("style");
  style.id = "user-menu-theme";
  style.textContent = `
    .user-menu-toggle {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 50;
      padding: 0.75rem;
      font-size: 1.5rem;
      border-radius: 9999px;
      border: 2px solid var(--primary-color-b);
      background-color: var(--primary-color-a);
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .user-menu-toggle:hover {
      background-color: var(--primary-color-b);
      border-color: var(--primary-color-a);
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
      transform: translateY(-2px);
    }
    .user-menu-toggle:active {
      transform: translateY(0);
    }
    .user-menu-list {
      position: fixed;
      top: 1rem;
      right: 10rem;
      z-index: 40;
      width: 12rem;
      display: none;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      margin: 0;
      list-style: none;
      border-radius: 0.75rem;
      border: 2px solid var(--primary-color-b);
      background-color: var(--text-color-b);
      color: var(--text-color-a);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      transition: all 0.2s ease;
    }
    .user-menu-list[aria-hidden="false"] {
      display: flex;
    }
    .user-menu-list li {
      margin: 0;
    }
    .user-menu-list button {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background-color: var(--background-color);
      color: var(--text-color-a);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }
    .user-menu-list button:hover {
      background-color: var(--primary-color-a);
      color: white;
      border-color: var(--primary-color-a);
      transform: translateX(4px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    .user-menu-list button:active {
      transform: translateX(2px);
    }
  `;
  document.head.appendChild(style);
  __userMenuStylesInjected = true;
}
/**
 * Creates or re-creates the user menu.
 */
export function initUserMenu() {
  const nav = document.querySelector("nav");
  if (!nav) return;
  ensureUserMenuStyles();
  document.getElementById("userToggle")?.remove();
  document.getElementById("menuList")?.remove();
  const toggle = document.createElement("button");
  toggle.id = "userToggle";
  toggle.type = "button";
  toggle.className = "user-menu-toggle";
  toggle.setAttribute("aria-label", "User menu");
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = `<i class="fa-solid fa-user" aria-hidden="true"></i>`;
  const menu = document.createElement("ul");
  menu.id = "menuList";
  menu.className = "user-menu-list";
  menu.setAttribute("aria-hidden", "true");
  nav.prepend(toggle);
  nav.appendChild(menu);
  function showMenu(visible) {
    toggle.setAttribute("aria-expanded", visible ? "true" : "false");
    menu.setAttribute("aria-hidden", visible ? "false" : "true");
  }
  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    showMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      showMenu(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") showMenu(false);
  });
}
