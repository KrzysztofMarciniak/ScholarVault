// search_user.js

function getToken() {
  return localStorage.getItem("api_token");
}

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
        <div class="user-item">
          <span>
            ${user.name || "unnamed user"}${emailPart}
            ${user.orcid
              ? `<a href="https://orcid.org/${encodeURIComponent(user.orcid)}" class="fa-brands fa-orcid"></a>`
              : ""}
            ${rolePart}${deactivatedPart}
          </span>
        </div>
      `;
    }).join("");

  } catch (err) {
    container.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}
