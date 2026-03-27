// article_list.js
import { createContentContainer } from "./layout.js";

let __articleListStylesInjected = false;

function ensureArticleListStyles() {
  if (__articleListStylesInjected) return;

  const style = document.createElement("style");
  style.id = "article-list-theme";

  style.textContent = `
    .article-list-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .article-item {
      display: flex;
      flex-direction: column;
      padding: 1rem;
      border-radius: 0.75rem;
      border: 1px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .article-item:hover {
      background: var(--text-color-b);
      border-color: var(--primary-color-a);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateY(-2px);
    }

    .article-item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 0.5rem;
    }

    .article-item-title {
      font-weight: 600;
      color: var(--text-color-a);
      flex: 1;
    }

    .article-status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .article-status-accepted {
      background: #dcfce7;
      color: #14532d;
    }

    .article-status-rejected {
      background: #fee2e2;
      color: #991b1b;
    }

    .article-status-pending {
      background: #fef3c7;
      color: #92400e;
    }

    .article-abstract {
      color: var(--text-color-a);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 0.5rem;
      opacity: 0.9;
    }

    .article-doi {
      font-size: 0.8rem;
      color: var(--text-color-a);
      opacity: 0.75;
    }

    .article-doi-link {
      color: var(--primary-color-a);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .article-doi-link:hover {
      color: var(--primary-color-b);
      text-decoration: underline;
    }

    .article-list-loading {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
    }

    .article-list-empty {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .article-list-error {
      padding: 1.5rem;
      color: #dc2626;
      font-weight: 500;
    }

    .article-pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .article-pagination-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--primary-color-b);
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .article-pagination-btn:hover:not(:disabled) {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .article-pagination-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .article-pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    .article-pagination-indicator {
      padding: 0 0.5rem;
      font-size: 0.9rem;
      color: var(--text-color-a);
      opacity: 0.8;
    }
  `;

  document.head.appendChild(style);
  __articleListStylesInjected = true;
}

/**
 * createArticleContainer(options) -> HTMLElement
 * options: { title, icon, extraClasses, margin, padded }
 */
export function createArticleContainer({
  title = "Articles",
  icon = "fa-solid fa-newspaper",
  extraClasses = "",
  margin = "0",
  padded = false,
} = {}) {
  ensureArticleListStyles();
  const container = createContentContainer({ title, icon, extraClasses, margin });
  if (padded) container.classList.add("p-4");
  return container;
}

/** Render loading state into a container */
export function renderLoading(container, message = "Loading...") {
  if (!container) throw new Error("container required");
  container.innerHTML = `
    <div class="article-list-loading">
      <i class="fa-solid fa-spinner fa-spin"></i> ${message}
    </div>
  `;
}

/** Render empty state */
export function renderEmpty(container, messageHtml) {
  if (!container) throw new Error("container required");
  container.innerHTML = messageHtml || `<div class="article-list-empty">No items found.</div>`;
}

/** Render error state */
export function renderError(container, err) {
  if (!container) throw new Error("container required");
  const msg = err?.message || "An error occurred";
  container.innerHTML = `<div class="article-list-error"><i class="fa-solid fa-exclamation-circle"></i> Error: ${msg}</div>`;
}

/** Return HTML for one article card (string) */
export function renderArticleCard(article) {
  const status = (article.status || "").toLowerCase();
  let statusClass = "article-status-pending";
  
  if (status === "accepted") {
    statusClass = "article-status-accepted";
  } else if (status === "rejected" || status === "rejected_by_admin") {
    statusClass = "article-status-rejected";
  }

  return `
  <div class="article-item" data-id="${article.id}">
    <div class="article-item-header">
      <span class="article-item-title">${article.title}</span>
      <span class="article-status-badge ${statusClass}">${article.status || "Pending"}</span>
    </div>
    <p class="article-abstract">${article.abstract || ""}</p>
    ${
      article.doi
        ? `<p class="article-doi">DOI: <a href="https://doi.org/${article.doi}" target="_blank" rel="noopener noreferrer" class="article-doi-link">${article.doi}</a></p>`
        : ""
    }
  </div>`;
}

/**
 * renderArticleList(containerOrOptions, articles, pagination, opts)
 * - containerOrOptions: HTMLElement OR options object passed to createArticleContainer
 * - articles: array
 * - pagination: { current_page, last_page, prev_page_url, next_page_url }
 * - opts: { onItemClick(id,el), onPageChange(page), showEmptyHtml }
 */
export function renderArticleList(containerOrOptions, articles = [], pagination = {}, opts = {}) {
  ensureArticleListStyles();

  let container;
  if (containerOrOptions instanceof HTMLElement) {
    container = containerOrOptions;
  } else {
    container = createArticleContainer(containerOrOptions || {});
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    const emptyHtml = opts.showEmptyHtml || `<div class="article-list-empty">No articles found.</div>`;
    renderEmpty(container, emptyHtml);
    return container;
  }

  container.innerHTML = `<div class="article-list-container" id="articleListInner"></div>`;
  const list = container.querySelector("#articleListInner");
  list.innerHTML = articles.map(renderArticleCard).join("");

  if (typeof opts.onItemClick === "function") attachArticleHandlers(list, opts.onItemClick);

  if (pagination && (pagination.current_page || pagination.last_page)) {
    const pagEl = createPagination(pagination, (p) => {
      if (typeof opts.onPageChange === "function") return opts.onPageChange(p);
      return null;
    });
    container.appendChild(pagEl);
  }

  return container;
}

/** Attach click handlers to .article-item elements */
export function attachArticleHandlers(container, handler) {
  if (!container || typeof handler !== "function") return;
  container.querySelectorAll(".article-item").forEach(el => {
    el.replaceWith(el.cloneNode(true));
  });
  container.querySelectorAll(".article-item").forEach(el => {
    el.addEventListener("click", (e) => {
      const id = Number(e.currentTarget.dataset.id);
      try { handler(id, e.currentTarget); } catch (err) { console.error("article handler error:", err); }
    });
  });
}

/** Create pagination DOM node */
export function createPagination(pagination = {}, onPageChange = () => {}) {
  ensureArticleListStyles();

  const current = Number(pagination.current_page || 1);
  const last = Number(pagination.last_page || 1);
  const container = document.createElement("div");
  container.className = "article-pagination";

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left"></i> Previous`;
  prevBtn.disabled = !pagination.prev_page_url || current <= 1;
  prevBtn.className = "article-pagination-btn";
  prevBtn.onclick = () => onPageChange(Math.max(1, current - 1));
  container.appendChild(prevBtn);

  const pageIndicator = document.createElement("span");
  pageIndicator.className = "article-pagination-indicator";
  pageIndicator.textContent = `Page ${current} / ${last}`;
  container.appendChild(pageIndicator);

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = `Next <i class="fa-solid fa-chevron-right"></i>`;
  nextBtn.disabled = !pagination.next_page_url || current >= last;
  nextBtn.className = "article-pagination-btn";
  nextBtn.onclick = () => onPageChange(Math.min(last, current + 1));
  container.appendChild(nextBtn);

  return container;
}
