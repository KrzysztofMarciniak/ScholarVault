const app = document.getElementById("app");

export async function renderUsers(page = 1) {
    app.innerHTML = `<p class="text-gray-700 dark:text-gray-200">Loading users...</p>`;

    try {
        const perPage = 15;
        const res = await fetch(`/api/v1/users?per_page=${perPage}&page=${page}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const users = json.data; // paginated users
        const currentPage = json.current_page;
        const lastPage = json.last_page;

        app.innerHTML = `
            <h1 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Users</h1>
            <div id="usersList" class="flex flex-col gap-2 mb-4"></div>
            <div id="pagination" class="flex gap-2 justify-center mt-4"></div>
        `;

        const list = document.getElementById("usersList");
        const pagination = document.getElementById("pagination");

        users.forEach(user => {
            const item = document.createElement("div");
            item.className = `
                flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800
                rounded shadow-sm text-gray-800 dark:text-gray-200
            `;
            item.innerHTML = `
<span>
  ${user.name || "unnamed user"}
  ${user.orcid
    ? `<a href="https://orcid.org/${encodeURIComponent(user.orcid)}"class="fa-brands fa-orcid"></a>`
    : ""}
</span>
                <span class="text-sm text-gray-500 dark:text-gray-400">${user.role || "N/A"}</span>
            `;
            list.appendChild(item);
        });

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "« Previous";
        prevBtn.disabled = !json.prev_page_url;
        prevBtn.className = `
            px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
        `;
        prevBtn.onclick = () => renderUsers(currentPage - 1);
        pagination.appendChild(prevBtn);

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next »";
        nextBtn.disabled = !json.next_page_url;
        nextBtn.className = `
            px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600
            disabled:opacity-50 disabled:cursor-not-allowed
        `;
        nextBtn.onclick = () => renderUsers(currentPage + 1);
        pagination.appendChild(nextBtn);

    } catch (err) {
        app.innerHTML = `
            <p class="text-red-600 dark:text-red-400">Failed to load users: ${err.message}</p>
        `;
        console.error(err);
    }
}
