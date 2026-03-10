import { createContentContainer } from "./layout.js";
import {
    renderLoading,
    renderError,
    renderUserList,
    attachShowHandlers
} from "./users_ui.js";

export async function renderUsers(page = 1) {

    const content = createContentContainer({
        title: "Users",
        icon: "fa-solid fa-users",
        extraClasses: "max-w-4xl",
        margin: "2rem auto"
    });

    renderLoading(content, "Loading users...");

    try {

        const perPage = 15;
        const res = await fetch(`/api/v1/users?per_page=${perPage}&page=${page}`);

        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        const users = json.data;
        const currentPage = json.current_page;
        const lastPage = json.last_page;

        content.innerHTML = `
            <div id="usersList" class="flex flex-col gap-3"></div>
            <div id="pagination" class="flex items-center justify-center gap-3 mt-8"></div>
        `;

        const list = content.querySelector("#usersList");
        const pagination = content.querySelector("#pagination");

        /* reusable list renderer */
        renderUserList(list, users, {
            showEmail: false,
            showControls: true
        });

        /* attach "show user" button handlers */
        attachShowHandlers(list);

        /* ---------- pagination ---------- */

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

    }
    catch (err) {

        renderError(content, err);
        console.error(err);

    }
}
