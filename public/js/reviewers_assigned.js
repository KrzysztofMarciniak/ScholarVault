// assigned_articles.js
import { getToken } from "./get_token.js";
import {
  renderArticleList,
  renderLoading,
  renderEmpty,
  renderError
} from "./article_list.js";

/** Fetch assigned articles for reviewer */
async function fetchAssignedArticles(page = 1, perPage = 10) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const url = new URL("/api/v1/articles/assigned", window.location.origin);
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

/** Resolve container to mount assigned articles */
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

/**
 * Enhance a rendered list so rows are visually clickable and keyboard-accessible.
 * - onItemClick(id) will be called when a row is clicked or activated with Enter/Space.
 * - The function tries to find rows by data-article-id, data-id, or data-article attributes.
 */
function enhanceListInteractivity(container, onItemClick) {
  if (!container || typeof onItemClick !== "function") return;

  // mark container so CSS rules scope to it
  container.classList.add("article-list-clickable");

  const findRow = (el) => el && el.closest && el.closest('[data-article-id],[data-id],[data-article]');

  // helper to extract id from supported attributes
  const getIdFromRow = (row) => {
    if (!row) return null;
    return row.getAttribute("data-article-id")
      || row.getAttribute("data-id")
      || row.getAttribute("data-article")
      || row.dataset.articleId
      || row.dataset.id
      || row.dataset.article
      || null;
  };

  // ensure rows are focusable and have role=button for screenreaders if missing
  const ensureFocusable = (row) => {
    if (!row.hasAttribute("tabindex")) row.setAttribute("tabindex", "0");
    if (!row.getAttribute("role")) row.setAttribute("role", "button");
    // add a visually-hidden outline on focus if you prefer custom styling; CSS handles it below.
  };

  // When the list is dynamic, we use mutation observer to ensure new rows become focusable
  const observer = new MutationObserver(() => {
    const rows = container.querySelectorAll('[data-article-id],[data-id],[data-article]');
    rows.forEach(ensureFocusable);
  });
  observer.observe(container, { childList: true, subtree: true });

  // initialize existing rows
  container.querySelectorAll('[data-article-id],[data-id],[data-article]').forEach(ensureFocusable);

  // click delegation
  const clickHandler = (e) => {
    const row = findRow(e.target);
    if (!row) return;
    const id = getIdFromRow(row);
    if (!id) return;
    onItemClick(id);
  };

  const keyHandler = (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const row = findRow(e.target);
    if (!row) return;
    const id = getIdFromRow(row);
    if (!id) return;
    e.preventDefault();
    onItemClick(id);
  };

  container.addEventListener("click", clickHandler);
  container.addEventListener("keydown", keyHandler);

  // return function to detach if needed
  return () => {
    observer.disconnect();
    container.removeEventListener("click", clickHandler);
    container.removeEventListener("keydown", keyHandler);
  };
}

/**
 * Apply Tailwind hover styles to article rows from this file only.
 * Looks for elements with data-article-id, data-id, or data-article.
 */
function applyHoverStyles(container) {
  if (!container) return;
  const rows = container.querySelectorAll('[data-article-id],[data-id],[data-article]');
  rows.forEach(row => {
    row.classList.add(
      "cursor-pointer",
      "hover:bg-gray-100",
      "dark:hover:bg-gray-800",
      "transition-colors"
    );
    // optional focus ring for keyboard users
    row.classList.add("focus:outline-none", "focus:ring-2", "focus:ring-indigo-500");
  });

  // If new rows may be injected later, observe and apply classes to them as well.
  const mo = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      Array.from(m.addedNodes || []).forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches && node.matches('[data-article-id],[data-id],[data-article]')) {
          node.classList.add(
            "cursor-pointer",
            "hover:bg-gray-100",
            "dark:hover:bg-gray-800",
            "transition-colors",
            "focus:outline-none",
            "focus:ring-2",
            "focus:ring-indigo-500"
          );
        } else {
          // scan subtree
          node.querySelectorAll && node.querySelectorAll('[data-article-id],[data-id],[data-article]').forEach(n => {
            n.classList.add(
              "cursor-pointer",
              "hover:bg-gray-100",
              "dark:hover:bg-gray-800",
              "transition-colors",
              "focus:outline-none",
              "focus:ring-2",
              "focus:ring-indigo-500"
            );
          });
        }
      });
    });
  });
  mo.observe(container, { childList: true, subtree: true });
}

/** Render assigned articles list */
export async function renderAssigned(page = 1, mountSelector = null) {
  const perPage = 10;
  const container = resolveMount(mountSelector);

  renderLoading(container, "Loading assigned articles...");

  try {
    const json = await fetchAssignedArticles(page, perPage);
    const articles = Array.isArray(json.data) ? json.data : [];
    const pagination = json.pagination ?? {
      current_page: json.current_page ?? page,
      last_page: json.last_page ?? 1,
      prev_page_url: json.prev_page_url ?? null,
      next_page_url: json.next_page_url ?? null
    };

    if (!articles.length) {
      renderEmpty(container, `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No assigned articles.</p>`);
      return;
    }

    // Render the list as before
    renderArticleList(container, articles, pagination, {
      onPageChange: (p) => renderAssigned(p, mountSelector),
      onItemClick: (id) => {
        import("./reviewer_article_view.js")
          .then(m => { if (typeof m.showArticle === "function") m.showArticle(id); })
          .catch(() => console.info("article_view module not available"));
      }
    });

    setTimeout(() => {
      applyHoverStyles(container);

      const clickCallback = (id) => {
        import("./reviewer_article_view.js")
          .then(m => { if (typeof m.showArticle === "function") m.showArticle(id); })
          .catch(() => console.info("article_view module not available"));
      };
      // do not rely on returned cleanup here; it's fine to leave listeners attached
      enhanceListInteractivity(container, clickCallback);
    }, 0);

  } catch (err) {
    renderError(container, err);
    console.error("Failed to load assigned articles:", err);
  }
}
