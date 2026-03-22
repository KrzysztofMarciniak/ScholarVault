import { getCurrentTheme, themes } from "./theme_switch.js";

// --- Helpers ---
function getUserRoles(user) {
  if (!user || !user.role) return [];
  return Array.isArray(user.role)
    ? user.role.map(r => String(r).toLowerCase())
    : [String(user.role).toLowerCase()];
}

function createSidebarButton(btn) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "sidebar-btn";

  const icon = document.createElement("i");
  icon.className = btn.icon + " sidebar-icon";

  const label = document.createElement("span");
  label.className = "label";
  label.textContent = btn.label;

  button.append(icon, label);
  if (typeof btn.onClick === "function") button.onclick = btn.onClick;

  return button;
}

function renderSection(section) {
  const container = document.createElement("div");
  container.className = "sidebar-section";
  section.buttons.forEach(btn => container.appendChild(createSidebarButton(btn)));
  return container;
}

function createToggleButton(sidebar) {
  let minimized = true;
  sidebar.classList.add("minimized");

  const toggleButton = document.createElement("button");
  toggleButton.className = "sidebar-toggle";
  toggleButton.setAttribute("aria-label", "Toggle sidebar");
  toggleButton.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;

  toggleButton.onclick = () => {
    minimized = !minimized;
    sidebar.classList.toggle("minimized", minimized);
    toggleButton.innerHTML = minimized
      ? `<i class="fa-solid fa-chevron-right"></i>`
      : `<i class="fa-solid fa-chevron-left"></i>`;
  };

  return toggleButton;
}

function buildSections(roles) {
  const sections = [];

  // --- Common ---
  sections.push({
    buttons: [
      { label: "Users", icon: "fa-solid fa-users", onClick: () => import('./all_users.js').then(m => m.renderUsers()) },
      { label: "Search Users", icon: "fa-solid fa-magnifying-glass", onClick: async () => {
        const mod = await import('./search_user.js');
        const query = prompt("Enter search query (min 2 chars):");
        if (!query || query.length < 2) return alert("Query too short");
        const container = document.getElementById("app");
        if (container) mod.renderSearchResults(container, query);
      }},
      { label: "Published Articles", icon: "fa-solid fa-newspaper", onClick: () => import('./articles.js').then(m => m.renderArticles()) }
    ]
  });

  // --- Admin ---
  if (roles.includes("administrator")) {
    sections.push({
      buttons: [
        { label: "Create User", icon: "fa-solid fa-user-plus", onClick: async () => {
          const module = await import("./admin_create_user.js");
          module.renderAdminCreateUser();
        }},
        { label: "Manage Articles", icon: "fa-solid fa-newspaper", onClick: async () => {
          const module = await import("./admin_list_articles.js");
          module.renderAdminArticles();
        }}
      ]
    });
  }

  // --- Author ---
  if (roles.includes("author")) {
    sections.push({
      buttons: [
        { label: "Submit Article", icon: "fa-solid fa-file-arrow-up", onClick: async () => {
          const module = await import("./author_submit_article.js");
          module.renderSubmitArticle();
        }},
        { label: "My Articles", icon: "fa-solid fa-file-lines", onClick: async () => {
          const module = await import("./author_my_articles.js");
          module.renderMyArticles();
        }}
      ]
    });
  }

  // --- Reviewer ---
  if (roles.includes("reviewer")) {
    sections.push({
      buttons: [
        { label: "Assigned Reviews", icon: "fa-solid fa-tasks", onClick: async () => {
          const module = await import("./reviewers_assigned.js");
          module.renderAssigned();
        }}
      ]
    });
  }

  return sections;
}

export function ensureSidebarStyles() {
  if (document.getElementById("sidebar-theme-styles")) return;

  const style = document.createElement("style");
  style.id = "sidebar-theme-styles";
  style.textContent = `
    #sidebar {
      background-color: var(--primary-color-a);
      color: var(--text-color-a);
      width: 14rem;
      transition: width 0.3s, background-color 0.3s, color 0.3s;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1rem;
      overflow-y: auto;
      position: fixed;
      top: 0;
      left: 0;
      height: 100%;
      z-index: 50;
      box-sizing: content-box;

    }

    #sidebar.minimized { width: 4rem; }
    #sidebar.minimized .label { display: none; }

    .sidebar-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--primary-color-b);
      color: white;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .sidebar-btn:hover {
      opacity: 0.8;
    }

    .sidebar-icon {
      color: white;
      font-size: 1rem;
    }

    .sidebar-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .sidebar-toggle {
      align-self: flex-end;
      margin-bottom: 0.5rem;
      font-size: 1.25rem;
      background: transparent;
      border: none;
      cursor: pointer;
      color: var(--text-color-a);
    }
  `;
  document.head.appendChild(style);
}

// --- Render sidebar ---
export function renderSidebar() {
  let sidebar = document.getElementById("sidebar");
  if (!sidebar) {
    sidebar = document.createElement("nav");
    sidebar.id = "sidebar";
    document.body.appendChild(sidebar);
  }

  ensureSidebarStyles();
  sidebar.innerHTML = "";

  let user = null;
  try { user = JSON.parse(localStorage.getItem("current_user")); } catch { user = null; }
  const roles = getUserRoles(user);

  sidebar.appendChild(createToggleButton(sidebar));

  const sections = buildSections(roles);
  sections.forEach(section => sidebar.appendChild(renderSection(section)));
}
