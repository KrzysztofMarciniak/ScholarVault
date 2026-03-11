// sidebar.js

function getUserRoles(user) {
    if (!user || !user.role) return [];

    if (Array.isArray(user.role)) {
        return user.role.map(r => String(r).toLowerCase());
    }

    return [String(user.role).toLowerCase()];
}

function createSidebarButton(btn) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = `
        flex items-center gap-2
        bg-gray-200 dark:bg-gray-700
        hover:bg-gray-300 dark:hover:bg-gray-600
        text-gray-800 dark:text-gray-100
        font-medium py-1 px-3 rounded
        transition-colors duration-150
        btn-icon-only
    `;

    const icon = document.createElement("i");
    icon.className = btn.icon + " text-lg";

    const label = document.createElement("span");
    label.className = "label";
    label.textContent = btn.label;

    button.append(icon, label);

    if (typeof btn.onClick === "function") {
        button.onclick = btn.onClick;
    }

    return button;
}

function renderSection(section) {
    const container = document.createElement("div");
    container.className = "flex flex-col gap-2";

    section.buttons.forEach(btn => {
        container.appendChild(createSidebarButton(btn));
    });

    return container;
}

function createToggleButton(sidebar) {
    let minimized = true;
    sidebar.classList.add("minimized");

    const toggleButton = document.createElement("button");

    toggleButton.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;

    toggleButton.className = `
        self-end mb-2
        text-gray-700 dark:text-gray-200
        hover:text-gray-900 dark:hover:text-white
        text-xl
        transition-colors duration-150
    `;

    toggleButton.setAttribute("aria-label", "Toggle sidebar");

    toggleButton.onclick = () => {
        minimized = !minimized;

        sidebar.classList.toggle("minimized", minimized);

        toggleButton.innerHTML = minimized
            ? `<i class="fa-solid fa-chevron-right"></i>`
            : `<i class="fa-solid fa-chevron-left"></i>`;
    };

    return toggleButton;
}

function buildSections(roles, callbacks) {

    const sections = [];

    // --- Common section ---
    sections.push({
        buttons: [
            {
                label: "Users",
                icon: "fa-solid fa-users",
                onClick: () =>
                    import('./all_users.js').then(m => m.renderUsers())
            },
{
                label: "Search Users",
                icon: "fa-solid fa-magnifying-glass",
                onClick: () => {
                    import('./search_user.js').then(mod => {

                        const query = prompt("Enter search query (min 2 chars):");

                        if (!query || query.length < 2)
                            return alert("Query too short");

                        const container = document.getElementById("app");

                        if (container) {
                            mod.renderSearchResults(container, query);
                        }

                    });
                }
            },
            {
                label: "Published Articles",
                icon:"fa-solid fa-newspaper",
                onClick: ()=>import ('./articles.js').then(m=>m.renderArticles())
            }

        ]
    });

    // --- Admin section ---
if (roles.includes("administrator")) {
  sections.push({
    buttons: [
      {
        label: "Create User",
        icon: "fa-solid fa-user-plus",
        onClick: async () => {
          try {
            const module = await import("./admin_create_user.js");
            module.renderAdminCreateUser();
          } catch (err) {
            console.error("Failed to load admin_create_user module:", err);
          }
        }
      },
      {
        label: "Manage Articles",
        icon: "fa-solid fa-newspaper",
        onClick: async () => {
          try {
            const module = await import("./admin_list_articles.js");
            module.renderAdminArticles();
          } catch (err) {
            console.error("Failed to load admin_list_articles module:", err);
          }
        }
      }
    ]
  });
}

    // --- Author section ---
if (roles.includes("author")) {
  sections.push({
    title: "Author",
    buttons: [
      {
        label: "Submit Article",
        icon: "fa-solid fa-file-arrow-up",
        onClick: async () => {
          const module = await import("./author_submit_article.js");
          module.renderSubmitArticle();
        }
      },
            {
                label: "My Articles",
                icon: "fa-solid fa-file-lines",
                onClick: async () => {
                    const module = await import("./author_my_articles.js");
                    module.renderMyArticles();
                }
            }
    ]
  });
}

    // --- Reviewer section ---
    if (roles.includes("reviewer")) {
        sections.push({
            buttons: [
                {
                    label: "Assigned Reviews",
                    icon: "fa-solid fa-tasks",
                    onClick: callbacks.assignedReviews
                },
                {
                    label: "Review History",
                    icon: "fa-solid fa-history",
                    onClick: callbacks.reviewHistory
                }
            ]
        });
    }

    return sections;
}

function ensureSidebarStyles() {

    if (document.getElementById("sidebar-minimized-styles"))
        return;

    const style = document.createElement("style");

    style.id = "sidebar-minimized-styles";

    style.textContent = `
        #sidebar.minimized { width: 4rem !important; }

        #sidebar.minimized h2,
        #sidebar.minimized .label {
            display: none !important;
        }

        #sidebar.minimized .btn-icon-only {
            justify-content: center;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
        }

        #sidebar.minimized button:focus,
        #sidebar.minimized button:focus-visible {
            outline: none !important;
            box-shadow: none !important;
        }
    `;

    document.head.appendChild(style);
}

export function renderSidebar(renderCallbacks = {}) {

    let sidebar = document.getElementById("sidebar");

    if (!sidebar) {
        sidebar = document.createElement("nav");

        sidebar.id = "sidebar";

        sidebar.className = `
            fixed left-0 top-0
            h-full w-56
            bg-gray-100 dark:bg-gray-800
            shadow-lg
            p-4
            flex flex-col gap-4
            overflow-y-auto
            z-50
            transition-all duration-300
        `;

        document.body.appendChild(sidebar);
    }

    ensureSidebarStyles();

    sidebar.innerHTML = "";

    let user = null;

    try {
        const raw = localStorage.getItem("current_user");
        user = raw ? JSON.parse(raw) : null;
    } catch {
        user = null;
    }

    const roles = getUserRoles(user);

    const sections = buildSections(roles, renderCallbacks);

    sidebar.appendChild(createToggleButton(sidebar));

    sections.forEach(section => {
        sidebar.appendChild(renderSection(section));
    });
}
