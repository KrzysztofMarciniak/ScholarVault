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
  if (!query || query.length < 2) {
    throw new Error("Query must be at least 2 characters");
  }

  perPage = Math.min(perPage, 100);

  const url = new URL("/api/v1/users/search", window.location.origin);
  url.searchParams.set("q", query);
  url.searchParams.set("per_page", perPage);
  url.searchParams.set("page", page);

  const token = getToken();

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Failed to search users:", err);
    throw err;
  }
}

/**
 * Render search results into a container
 * @param {HTMLElement} container
 * @param {string} query
 */
export async function renderSearchResults(container, query) {
  container.innerHTML = "<p>Loading...</p>";

  try {
    const results = await searchUsers(query);

    if (!results?.data?.length) {
      container.innerHTML = "<p>No users found.</p>";
      return;
    }
container.innerHTML = results.data.map(user => {
  const rolePart = user.role ? ` - Role: ${user.role}` : "";
  const deactivatedPart = user.deactivated ? " (Deactivated)" : "";
  const emailPart = user.email ? ` (${user.email})` : "";

return `
<div class="flex items-center justify-between p-3 mb-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition">

  <div class="flex items-center gap-3">

    <span class="text-xs font-mono text-gray-500">
      #${user.id}
    </span>

    <span class="font-medium text-gray-800 dark:text-gray-100">
      ${user.name || "Unnamed user"}
    </span>

    ${emailPart
      ? `<span class="text-sm text-gray-500">
          <i class="fa-solid fa-envelope mr-1"></i>${emailPart}
        </span>`
      : ""
    }

    ${user.orcid
      ? `<a
          href="https://orcid.org/${encodeURIComponent(user.orcid)}"
          target="_blank"
          class="text-green-600 hover:text-green-700 text-lg"
          title="ORCID profile">
          <i class="fa-brands fa-orcid"></i>
        </a>`
      : ""}
  </div>

  <div class="flex items-center gap-2">

    ${rolePart
      ? `<span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          <i class="fa-solid fa-user-shield mr-1"></i>${rolePart}
        </span>`
      : ""}

    ${deactivatedPart
      ? `<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
          <i class="fa-solid fa-user-slash mr-1"></i>Deactivated
        </span>`
      : ""}

  </div>

</div>
`;
}).join("");
  } catch (err) {
    container.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}
