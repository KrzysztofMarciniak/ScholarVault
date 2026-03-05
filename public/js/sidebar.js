// sidebar.js
export function renderSidebar(renderCallbacks = {}) {
    let sidebar = document.getElementById("sidebar");

    // Create sidebar if it doesn't exist
    if (!sidebar) {
        sidebar = document.createElement("nav");
        sidebar.id = "sidebar";
        sidebar.className = `
            fixed left-0 top-0 h-full w-56 bg-gray-100 dark:bg-gray-800
            shadow-lg p-4 flex flex-col gap-4 overflow-y-auto z-50
            transition-all duration-300
        `;
        document.body.appendChild(sidebar);
    }

    // Inject minimal CSS for minimized state and focus behavior (only once)
    if (!document.getElementById("sidebar-minimized-styles")) {
        const style = document.createElement("style");
        style.id = "sidebar-minimized-styles";
        style.textContent = `
            /* width control + hiding labels when minimized */
            #sidebar.minimized { width: 4rem !important; }
            #sidebar.minimized h2,
            #sidebar.minimized .label { display: none !important; }

            /* center icons when minimized */
            #sidebar.minimized .btn-icon-only { justify-content: center; padding-left: 0.5rem; padding-right: 0.5rem; }

            /* remove outline/box-shadow on focused buttons while minimized */
            #sidebar.minimized button:focus,
            #sidebar.minimized button:focus-visible {
                outline: none !important;
                box-shadow: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    sidebar.innerHTML = ""; // Clear previous content

    // --- Safe user parsing ---
    const userRaw = localStorage.getItem("current_user");
    let user = null;
    try {
        user = userRaw ? JSON.parse(userRaw) : null;
    } catch (e) {
        user = null; // malformed -> treat as logged off
    }

    // Build roles safely (always an array of lowercase strings)
    const roles = [];
    if (user && user.role) {
        if (Array.isArray(user.role)) {
            user.role.forEach(r => { if (r != null) roles.push(String(r).toLowerCase()); });
        } else {
            roles.push(String(user.role).toLowerCase());
        }
    }

    // Ensure minimized default state is applied immediately
    let minimized = true;
    sidebar.classList.add("minimized");

    const sections = [];

    // Common section for everybody (always pushed)
    const commonSection = {
        buttons: [
            {
                label: "Users",
                icon: "fa-solid fa-users",
                onClick: () => import('./all_users.js').then(mod => mod.renderUsers())
            },
            {
                label: "Search Users",
                icon: "fa-solid fa-magnifying-glass",
                onClick: () => {
                    import('./search_user.js').then(mod => {
                        const query = prompt("Enter search query (min 2 chars):");
                        if (!query || query.length < 2) return alert("Query too short");
                        const container = document.getElementById("app");
                        if (container) {
                            mod.renderSearchResults(container, query);
                        }
                    });
                }
            }
        ]
    };

    // Add the common section first so it's always visible
    sections.push(commonSection);

    // Role-based sections
    if (roles.includes("administrator")) {
        sections.push({
            buttons: [
                { label: "Dashboard", icon: "fa-solid fa-tachometer-alt", onClick: renderCallbacks.adminDashboard },
                { label: "Manage Users", icon: "fa-solid fa-users", onClick: renderCallbacks.adminUsers },
                { label: "Manage Articles", icon: "fa-solid fa-file-lines", onClick: renderCallbacks.adminArticles },
            ],
        });
    }

    if (roles.includes("author")) {
        sections.push({
            buttons: [
                { label: "My Articles", icon: "fa-solid fa-pencil", onClick: renderCallbacks.myArticles },
                { label: "Submit Article", icon: "fa-solid fa-plus", onClick: renderCallbacks.submitArticle },
            ],
        });
    }

    if (roles.includes("reviewer")) {
        sections.push({
            buttons: [
                { label: "Assigned Reviews", icon: "fa-solid fa-tasks", onClick: renderCallbacks.assignedReviews },
                { label: "Review History", icon: "fa-solid fa-history", onClick: renderCallbacks.reviewHistory },
            ],
        });
    }

    // Toggle button (keeps minimized initial state)
    const toggleButton = document.createElement("button");
    toggleButton.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
    toggleButton.className = `
        self-end mb-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white
        text-xl transition-colors duration-150
    `;
    toggleButton.setAttribute("aria-label", "Toggle sidebar");
    toggleButton.onclick = () => {
        minimized = !minimized;
        sidebar.classList.toggle("minimized", minimized);
        toggleButton.innerHTML = minimized
            ? `<i class="fa-solid fa-chevron-right"></i>`
            : `<i class="fa-solid fa-chevron-left"></i>`;
    };
    sidebar.appendChild(toggleButton);

    // Render sections
    sections.forEach(section => {
        const container = document.createElement("div");
        container.className = "flex flex-col gap-2";

        section.buttons.forEach(btn => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = `
                flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                text-gray-800 dark:text-gray-100 font-medium py-1 px-3 rounded transition-colors duration-150
            `;
            button.classList.add("btn-icon-only");

            button.onclick = () => {
                if (typeof btn.onClick === "function") btn.onClick();
            };

            const icon = document.createElement("i");
            icon.className = btn.icon + " text-lg";

            const label = document.createElement("span");
            label.className = "label";
            label.textContent = btn.label;

            button.appendChild(icon);
            button.appendChild(label);

            container.appendChild(button);
        });

        sidebar.appendChild(container);
    });
}
