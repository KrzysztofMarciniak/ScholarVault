// assigned_articles.js
import { getToken } from "./get_token.js";
import {
  renderArticleList,
  renderLoading,
  renderEmpty,
  renderError
} from "./article_list.js";

let __assignedArticlesStylesInjected = false;

function ensureAssignedArticleStyles() {
  if (__assignedArticlesStylesInjected) return;

  const style = document.createElement("style");
  style.id = "assigned-articles-theme";

  style.textContent = `
    .article-list-clickable {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .article-list-clickable [data-article-id],
    .article-list-clickable [data-id],
    .article-list-clickable [data-article] {
      cursor: pointer;
      padding: 1rem;
      border-radius: 0.375rem;
      border: 1px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      transition: all 0.2s ease;
      outline: none;
    }

    .article-list-clickable [data-article-id]:hover,
    .article-list-clickable [data-id]:hover,
    .article-list-clickable [data-article]:hover {
      background: var(--text-color-b);
      border-color: var(--primary-color-a);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateX(4px);
    }

    .article-list-clickable [data-article-id]:focus-visible,
    .article-list-clickable [data-id]:focus-visible,
    .article-list-clickable [data-article]:focus-visible {
      outline: 2px solid var(--primary-color-a);
      outline-offset: 2px;
    }

    .article-list-clickable [data-article-id]:active,
    .article-list-clickable [data-id]:active,
    .article-list-clickable [data-article]:active {
      transform: translateX(2px);
    }

    .assigned-article-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color-a);
      margin-bottom: 0.35rem;
    }

    .assigned-article-meta {
      font-size: 0.8rem;
      color: var(--text-color-a);
      opacity: 0.7;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .assigned-article-status {
      display: inline-block;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      background: var(--primary-color-a);
      color: white;
      font-weight: 600;
      font-size: 0.7rem;
    }

    .assigned-loading {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-a);
    }

    .assigned-empty {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .assigned-error {
      padding: 2rem;
      color: #dc2626;
      font-weight: 500;
    }

    .assigned-pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .assigned-pagination-btn {
      padding: 0.35rem 0.65rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background: var(--background-color);
      color: var(--text-color-a);
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
      font-size: 0.85rem;
    }

    .assigned-pagination-btn:hover {
      background: var(--text-color-b);
      border-color: var(--primary-color-a);
    }

    .assigned-pagination-btn.active {
      background: var(--primary-color-a);
      color: white;
      border-color: var(--primary-color-a);
    }

    .assigned-pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  document.head.appendChild(style);
  __assignedArticlesStylesInjected = true;
}

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
 * Apply theme-aware styles to article rows.
 * Looks for elements with data-article-id, data-id, or data-article.
 */
function applyHoverStyles(container) {
  if (!container) return;
  const rows = container.querySelectorAll('[data-article-id],[data-id],[data-article]');
  rows.forEach(row => {
    row.classList.add("article-list-item");
  });

  // If new rows may be injected later, observe and apply classes to them as well.
  const mo = new MutationObserver((mutations) => {
    mutations.forEach(m => {
      Array.from(m.addedNodes || []).forEach(node => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches && node.matches('[data-article-id],[data-id],[data-article]')) {
          node.classList.add("article-list-item");
        } else {
          // scan subtree
          node.querySelectorAll && node.querySelectorAll('[data-article-id],[data-id],[data-article]').forEach(n => {
            n.classList.add("article-list-item");
          });
        }
      });
    });
  });
  mo.observe(container, { childList: true, subtree: true });
}

/** Render assigned articles list */
export async function renderAssigned(page = 1, mountSelector = null) {
  ensureAssignedArticleStyles();

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
      renderEmpty(container, `<div class="assigned-empty"><i class="fa-solid fa-inbox"></i> No assigned articles.</div>`);
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
