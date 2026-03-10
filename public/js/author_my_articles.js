// author_my_articles.js
import { getToken } from "./get_token.js";
import {
  renderArticleList,
  renderLoading,
  renderEmpty,
  renderError
} from "./article_list.js";

/** Fetch /api/v1/articles/my?page=&per_page= */
async function fetchMyArticles(page = 1, perPage = 15) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("/api/v1/articles/my/list", window.location.origin);
  url.searchParams.set("page", String(page));
  url.searchParams.set("per_page", String(perPage));

  const res = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload;
}

/**
 * mountSelector: optional selector string to find existing node to render into.
 * If not provided, defaults to #main-content -> #app -> main -> body.
 */
function resolveMount(mountSelector) {
  if (mountSelector) {
    const el = document.querySelector(mountSelector);
    if (el) return el;
  }
  return document.querySelector("#main-content") ||
         document.querySelector("#app") ||
         document.querySelector("main") ||
         document.body;
}

/** Render author's articles into existing page container (no new layout wrapper) */
export async function renderMyArticles(page = 1, mountSelector = null) {
  const perPage = 15;
  const container = resolveMount(mountSelector);

  // show local loading UI
  renderLoading(container, "Loading your articles...");

  try {
    const json = await fetchMyArticles(page, perPage);
    const articles = Array.isArray(json.data) ? json.data : [];
    const pagination = json.pagination ?? {
      current_page: json.current_page ?? page,
      last_page: json.last_page ?? 1,
      prev_page_url: json.prev_page_url ?? null,
      next_page_url: json.next_page_url ?? null
    };

    if (!articles.length) {
      renderEmpty(container, `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No articles found.</p>`);
      return;
    }

    renderArticleList(container, articles, pagination, {
      onPageChange: (p) => renderMyArticles(p, mountSelector),
      onItemClick: (id) => {
        import("./article_view.js")
          .then(m => { if (typeof m.showArticle === "function") m.showArticle(id); })
          .catch(() => console.info("article_view module not available"));
      }
    });

  } catch (err) {
    renderError(container, err);
    console.error("Failed to load articles:", err);
  }
}
