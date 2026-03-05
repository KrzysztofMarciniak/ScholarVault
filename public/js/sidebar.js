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
        `;
        document.body.appendChild(sidebar);
    }

    sidebar.innerHTML = ""; // Clear previous content

    const user = JSON.parse(localStorage.getItem("current_user") || "null");

    // If no user is logged in, hide the sidebar entirely
    if (!user) {
        sidebar.style.display = 'none';
        return;
    }

    // Show sidebar if user exists
    sidebar.style.display = 'flex';

    // Safely handle role whether it's a string or an array
    const roles = Array.isArray(user.role)
        ? user.role.map(r => r.toLowerCase())
        : [(user.role || "").toLowerCase()];

    const sections = [];

    if (roles.includes("administrator")) {
        sections.push({
            title: "Admin",
            buttons: [
                { label: "Dashboard", onClick: renderCallbacks.adminDashboard },
                { label: "Manage Users", onClick: renderCallbacks.adminUsers },
                { label: "Manage Articles", onClick: renderCallbacks.adminArticles },
            ],
        });
    }

    if (roles.includes("author")) {
        sections.push({
            title: "Author",
            buttons: [
                { label: "My Articles", onClick: renderCallbacks.myArticles },
                { label: "Submit Article", onClick: renderCallbacks.submitArticle },
            ],
        });
    }

    if (roles.includes("reviewer")) {
        sections.push({
            title: "Reviewer",
            buttons: [
                { label: "Assigned Reviews", onClick: renderCallbacks.assignedReviews },
                { label: "Review History", onClick: renderCallbacks.reviewHistory },
            ],
        });
    }

    // Render sections
    sections.forEach(section => {
        const sectionTitle = document.createElement("h2");
        sectionTitle.className = "text-lg font-bold mb-2 text-gray-700 dark:text-gray-200";
        sectionTitle.textContent = section.title;
        sidebar.appendChild(sectionTitle);

        const container = document.createElement("div");
        container.className = "flex flex-col gap-2";

        section.buttons.forEach(btn => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = btn.label;
            button.className = `
                bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
                text-gray-800 dark:text-gray-100 font-medium py-1 px-3 rounded
                transition-colors duration-150
            `;

            button.onclick = () => {
                if (typeof btn.onClick === "function") btn.onClick();
            };

            container.appendChild(button);
        });

        sidebar.appendChild(container);
    });
}
