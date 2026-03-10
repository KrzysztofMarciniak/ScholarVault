// article_list.js
import { createContentContainer } from "./layout.js";

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
  const container = createContentContainer({ title, icon, extraClasses, margin });
  if (padded) container.classList.add("p-4");
  return container;
}

/** Render loading state into a container */
export function renderLoading(container, message = "Loading...") {
  if (!container) throw new Error("container required");
  container.innerHTML = `
    <div class="flex items-center justify-center py-6 text-gray-500 dark:text-gray-400">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i> ${message}
    </div>
  `;
}

/** Render empty state */
export function renderEmpty(container, messageHtml) {
  if (!container) throw new Error("container required");
  container.innerHTML = messageHtml || `<p class="text-gray-600 dark:text-gray-400">No items found.</p>`;
}

/** Render error state */
export function renderError(container, err) {
  if (!container) throw new Error("container required");
  const msg = err?.message || "An error occurred";
  container.innerHTML = `<p class="text-red-600 dark:text-red-400">Error: ${msg}</p>`;
}

/** Return HTML for one article card (string) */
export function renderArticleCard(article) {
  const status = (article.status || "").toLowerCase();
  const statusClass =
    status === "accepted"
      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      : status === "rejected"
      ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";

  return `
  <div class="article-item flex flex-col p-4 rounded-xl border border-gray-200 dark:border-gray-700
              bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition" data-id="${article.id}">
    <div class="flex justify-between items-center mb-2">
      <span class="font-medium text-gray-800 dark:text-gray-100">${article.title}</span>
      <span class="px-2 py-1 text-xs rounded ${statusClass}">${article.status || ""}</span>
    </div>
    <p class="text-gray-600 dark:text-gray-300 text-sm mb-1">${article.abstract || ""}</p>
    ${
      article.doi
        ? `<p class="text-xs text-gray-500 dark:text-gray-400">DOI: <a href="https://doi.org/${article.doi}" target="_blank" rel="noopener noreferrer" class="underline">${article.doi}</a></p>`
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
  let container;
  if (containerOrOptions instanceof HTMLElement) {
    container = containerOrOptions;
  } else {
    container = createArticleContainer(containerOrOptions || {});
  }

  if (!Array.isArray(articles) || articles.length === 0) {
    const emptyHtml = opts.showEmptyHtml || `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No articles found.</p>`;
    renderEmpty(container, emptyHtml);
    return container;
  }

  container.innerHTML = `<div class="flex flex-col gap-3" id="articleListInner"></div>`;
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
  const current = Number(pagination.current_page || 1);
  const last = Number(pagination.last_page || 1);
  const container = document.createElement("div");
  container.className = "flex items-center justify-center gap-3 mt-8";

  const prevBtn = document.createElement("button");
  prevBtn.innerHTML = `<i class="fa-solid fa-chevron-left mr-1"></i>Previous`;
  prevBtn.disabled = !pagination.prev_page_url || current <= 1;
  prevBtn.className = `
    flex items-center px-4 py-2 rounded-lg
    bg-gray-200 dark:bg-gray-700
    hover:bg-gray-300 dark:hover:bg-gray-600
    text-gray-800 dark:text-gray-200
    disabled:opacity-40 disabled:cursor-not-allowed
    transition
  `;
  prevBtn.onclick = () => onPageChange(Math.max(1, current - 1));
  container.appendChild(prevBtn);

  const pageIndicator = document.createElement("span");
  pageIndicator.className = "px-3 text-sm text-gray-600 dark:text-gray-400";
  pageIndicator.textContent = `Page ${current} / ${last}`;
  container.appendChild(pageIndicator);

  const nextBtn = document.createElement("button");
  nextBtn.innerHTML = `Next<i class="fa-solid fa-chevron-right ml-1"></i>`;
  nextBtn.disabled = !pagination.next_page_url || current >= last;
  nextBtn.className = prevBtn.className;
  nextBtn.onclick = () => onPageChange(Math.min(last, current + 1));
  container.appendChild(nextBtn);

  return container;
}
