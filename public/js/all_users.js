const app = document.getElementById("app");

export async function renderUsers(page = 1) {
    app.innerHTML = `
        <div class="flex items-center justify-center py-10 text-gray-500 dark:text-gray-400">
            <i class="fa-solid fa-spinner fa-spin text-xl mr-2"></i>
            Loading users...
        </div>
    `;

    try {
        const perPage = 15;
        const res = await fetch(`/api/v1/users?per_page=${perPage}&page=${page}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const users = json.data;
        const currentPage = json.current_page;
        const lastPage = json.last_page;

        app.innerHTML = `
            <div class="max-w-4xl mx-auto px-4 py-6">

                <h1 class="flex items-center gap-2 text-3xl font-semibold mb-6 text-gray-800 dark:text-gray-100">
                    <i class="fa-solid fa-users text-gray-500"></i>
                    Users
                </h1>

                <div id="usersList" class="flex flex-col gap-3"></div>

                <div id="pagination" class="flex items-center justify-center gap-3 mt-8"></div>

            </div>
        `;

        const list = document.getElementById("usersList");
        const pagination = document.getElementById("pagination");

        users.forEach(user => {
    const item = document.createElement("div");
    item.className = "flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition";

    item.innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold">
                ${(user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div class="flex flex-col">
                <span class="font-medium text-gray-800 dark:text-gray-100 cursor-pointer user-id" data-id="${user.id}">
                    ${user.name || "Unnamed user"}
                </span>
                <div class="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    ${user.orcid
                        ? `<a href="https://orcid.org/${encodeURIComponent(user.orcid)}"
                              class="flex items-center gap-1 text-green-600 hover:text-green-700"
                              target="_blank">
                                <i class="fa-brands fa-orcid"></i>
                                ORCID
                           </a>`
                        : ""}
                </div>
            </div>
        </div>
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <i class="fa-solid fa-user-gear mr-1"></i>
            ${user.role || "N/A"}
        </div>
    `;

    list.appendChild(item);
});

document.querySelectorAll(".user-id").forEach(el => {
    el.onclick = (e) => {
        const id = e.currentTarget.dataset.id;
        import("./user_info.js").then(module => module.showUser(id));
    };
});

        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left mr-1"></i>Previous`;
        prevBtn.disabled = !json.prev_page_url;
        prevBtn.className = `
            flex items-center px-4 py-2 rounded-lg
            bg-gray-200 dark:bg-gray-700
            hover:bg-gray-300 dark:hover:bg-gray-600
            text-gray-800 dark:text-gray-200
            disabled:opacity-40 disabled:cursor-not-allowed
            transition
        `;
        prevBtn.onclick = () => renderUsers(currentPage - 1);
        pagination.appendChild(prevBtn);

        const pageIndicator = document.createElement("span");
        pageIndicator.className = "px-3 text-sm text-gray-600 dark:text-gray-400";
        pageIndicator.textContent = `Page ${currentPage} / ${lastPage}`;
        pagination.appendChild(pageIndicator);

        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = `Next<i class="fa-solid fa-chevron-right ml-1"></i>`;
        nextBtn.disabled = !json.next_page_url;
        nextBtn.className = `
            flex items-center px-4 py-2 rounded-lg
            bg-gray-200 dark:bg-gray-700
            hover:bg-gray-300 dark:hover:bg-gray-600
            text-gray-800 dark:text-gray-200
            disabled:opacity-40 disabled:cursor-not-allowed
            transition
        `;
        nextBtn.onclick = () => renderUsers(currentPage + 1);
        pagination.appendChild(nextBtn);

    } catch (err) {
        app.innerHTML = `
            <div class="flex items-center justify-center py-10 text-red-600 dark:text-red-400">
                <i class="fa-solid fa-triangle-exclamation mr-2"></i>
                Failed to load users: ${err.message}
            </div>
        `;
        console.error(err);
    }
}
