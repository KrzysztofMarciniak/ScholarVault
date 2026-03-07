// search_user.js
import { getToken } from './get_token.js';

/**
 * Search users via API
 * @param {string} query
 * @param {number} [perPage=15]
 * @param {number} [page=1]
 * @returns {Promise<object>}
 */
export async function searchUsers(query, perPage = 15, page = 1) {
  if (!query || query.length < 2) throw new Error("Query must be at least 2 characters");
  perPage = Math.min(perPage, 100);

  const url = new URL("/api/v1/users/search", window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", perPage);
  url.searchParams.set("page", page);

  const token = getToken();
  const headers = { "Accept": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { method: "GET", headers });
  if (!res.ok) {
    const msg = `HTTP ${res.status}: ${res.statusText}`;
    throw new Error(msg);
  }

  return res.json();
}

/**
 * Render search results into a container
 * @param {HTMLElement} container
 * @param {string} query
 */
export async function renderSearchResults(container, query) {
  container.innerHTML = `
    <div class="flex items-center justify-center py-6 text-gray-500 dark:text-gray-400">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i> Searching...
    </div>
  `;

  try {
    const results = await searchUsers(query);

    if (!results?.data?.length) {
      container.innerHTML = `<p class="text-gray-600 dark:text-gray-400">No users found for "<strong>${query}</strong>".</p>`;
      return;
    }

    container.innerHTML = results.data.map(user => {
      const roleBadge = user.role
        ? `<span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <i class="fa-solid fa-user-shield mr-1"></i>${user.role}
          </span>`
        : "";
      const deactivatedBadge = user.deactivated
        ? `<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            <i class="fa-solid fa-user-slash mr-1"></i>Deactivated
          </span>`
        : "";
      const orcidLink = user.orcid
        ? `<a href="https://orcid.org/${encodeURIComponent(user.orcid)}" target="_blank"
             class="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
             <i class="fa-brands fa-orcid"></i>ORCID
           </a>`
        : "";

      return `
<div class="flex items-center justify-between p-3 mb-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition">

  <div class="flex items-center gap-3">
    <span class="text-xs font-mono text-gray-500">#${user.id}</span>
    <div class="flex flex-col">
      <span class="font-medium text-gray-800 dark:text-gray-100">${user.name || "Unnamed user"}</span>
      ${user.email ? `<span class="text-sm text-gray-500"><i class="fa-solid fa-envelope mr-1"></i>${user.email}</span>` : ""}
      <div class="mt-1">${orcidLink}</div>
    </div>
  </div>

  <div class="flex items-center gap-2">
    ${roleBadge} ${deactivatedBadge}
    <button data-id="${user.id}" class="user-show-btn px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
      <i class="fa-solid fa-eye mr-1"></i>Show
    </button>
  </div>

</div>`;
    }).join("");

    // Attach click handlers for Show buttons
    container.querySelectorAll(".user-show-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.currentTarget.dataset.id;
        import("./user_info.js")
          .then(module => module.showUser(id))
          .catch(err => console.error("Failed to load user_info module:", err));
      });
    });

  } catch (err) {
    container.innerHTML = `<p class="text-red-600 dark:text-red-400">Error: ${err.message}</p>`;
    console.error(err);
  }
}
