// search_user.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";
import {
  renderLoading,
  renderEmpty,
  renderError,
  renderUserList,
  attachShowHandlers,
  escapeHtml
} from "./users_ui.js";

/**
 * renderSearchResults(containerOrQuery, maybeQuery?)
 *
 * Accepts:
 * - renderSearchResults(queryString)
 * - renderSearchResults(containerElement, queryString)
 * - renderSearchResults(containerElement, inputElement)  // will read .value
 */
export async function renderSearchResults(containerOrQuery, maybeQuery) {
  // Normalize args
  let content;
  let query;

  if (containerOrQuery instanceof HTMLElement) {
    content = containerOrQuery;
    query = maybeQuery;
  } else {
    // first arg is query string
    content = createContentContainer({
      title: "User Search",
      icon: "fa-solid fa-magnifying-glass",
      extraClasses: "max-w-4xl",
      margin: "2rem auto"
    });
    query = containerOrQuery;
  }

  // If caller accidentally passed an element as the query (e.g. an <input>), extract its value.
  if (query instanceof HTMLInputElement || query instanceof HTMLTextAreaElement) {
    query = query.value;
  }

  // Coerce to string or undefined
  if (query != null) query = String(query);

  renderLoading(content, "Searching...");

  try {
    if (!query || query.length < 2) {
      throw new Error("Query must be at least 2 characters");
    }

    const url = new URL("/api/v1/users/search", window.location.origin);
    url.searchParams.set("q", query);
    url.searchParams.set("per_page", 15);
    url.searchParams.set("page", 1);

    const headers = { "Accept": "application/json" };
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const r = await fetch(url.toString(), { method: "GET", headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}: ${r.statusText}`);

    const res = await r.json();
    const users = res?.data ?? [];

    if (!users.length) {
      renderEmpty(
        content,
        `<p class="text-gray-600 dark:text-gray-400">No users found for "<strong>${escapeHtml(query)}</strong>".</p>`
      );
      return;
    }

    renderUserList(content, users, { showEmail: true, showControls: true });
    attachShowHandlers(content);
  } catch (err) {
    renderError(content, err);
    console.error(err);
  }
}
