import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

/**
 * GET /api/v1/articles/my
 */
async function fetchMyArticles(page = 1, perPage = 10) {
    const token = getToken();
    if (!token) throw new Error("Not authenticated");

    const url = `/api/v1/articles/my?page=${page}&per_page=${perPage}`;

    const res = await fetch(url, {
        headers: {
            "Accept": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || res.statusText);
    }

    return res.json();
}

/**
 * Render author's own articles list
 */
export async function renderMyArticles(page = 1) {

    const container = createContentContainer({
        title: "My Articles",
        icon: "fa-solid fa-file-lines",
        padded: true,
        margin: "2rem auto",
        extraClasses: "max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-md"
    });

    container.innerHTML = `
        <div id="articlesLoading" class="flex items-center justify-center py-6 text-gray-500 dark:text-gray-400">
            <i class="fa-solid fa-spinner fa-spin text-xl mr-2"></i>
            Loading your articles...
        </div>
    `;

    try {
        const perPage = 15;
        const data = await fetchMyArticles(page, perPage);
        const articles = data.data || [];
        const pagination = data.pagination || {};

        if (!articles.length) {
            container.innerHTML = `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No articles found.</p>`;
            return;
        }

        container.innerHTML = `
            <div id="articlesList" class="flex flex-col gap-3"></div>
            <div id="pagination" class="flex items-center justify-center gap-3 mt-8"></div>
        `;

        const list = document.getElementById("articlesList");
        const paginationContainer = document.getElementById("pagination");

        articles.forEach(article => {
            const item = document.createElement("div");
            item.className = `
                flex flex-col p-4 rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition
            `;
            item.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-medium text-gray-800 dark:text-gray-100">${article.title}</span>
                    <span class="px-2 py-1 text-xs rounded ${
                        article.status === "accepted" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" :
                        article.status === "rejected" ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }">${article.status}</span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 text-sm mb-1">${article.abstract}</p>
                ${article.doi ? `<p class="text-xs text-gray-500 dark:text-gray-400">DOI: <a href="https://doi.org/${article.doi}" target="_blank" class="underline">${article.doi}</a></p>` : ""}
            `;
            list.appendChild(item);
        });

        // Pagination buttons
        const prevBtn = document.createElement("button");
        prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left mr-1"></i>Previous`;
        prevBtn.disabled = !pagination.prev_page_url;
        prevBtn.className = `
            flex items-center px-4 py-2 rounded-lg
            bg-gray-200 dark:bg-gray-700
            hover:bg-gray-300 dark:hover:bg-gray-600
            text-gray-800 dark:text-gray-200
            disabled:opacity-40 disabled:cursor-not-allowed
            transition
        `;
        prevBtn.onclick = () => renderMyArticles(pagination.current_page - 1);
        paginationContainer.appendChild(prevBtn);

        const pageIndicator = document.createElement("span");
        pageIndicator.className = "px-3 text-sm text-gray-600 dark:text-gray-400";
        pageIndicator.textContent = `Page ${pagination.current_page} / ${pagination.last_page}`;
        paginationContainer.appendChild(pageIndicator);

        const nextBtn = document.createElement("button");
        nextBtn.innerHTML = `Next<i class="fa-solid fa-chevron-right ml-1"></i>`;
        nextBtn.disabled = !pagination.next_page_url;
        nextBtn.className = prevBtn.className;
        nextBtn.onclick = () => renderMyArticles(pagination.current_page + 1);
        paginationContainer.appendChild(nextBtn);

    } catch (err) {
        container.innerHTML = `
            <div class="flex items-center justify-center py-10 text-red-600 dark:text-red-400">
                <i class="fa-solid fa-triangle-exclamation mr-2"></i>
                Failed to load articles: ${err.message}
            </div>
        `;
        console.error(err);
    }
}
