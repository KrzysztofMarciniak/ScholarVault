// articles.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

let __articlesStylesInjected = false;

function ensureArticleStyles() {
  if (__articlesStylesInjected) return;

  const style = document.createElement("style");
  style.id = "articles-theme";

  style.textContent = `
    .article-wrapper {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      width: 100%;
      min-height: 60vh;
    }

    .article-list {
      flex: 1;
      max-height: 60vh;
      overflow-y: auto;
      border-right: 2px solid var(--primary-color-b);
    }

    .article-item {
      cursor: pointer;
      padding: 1rem;
      border-bottom: 1px solid var(--text-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      transition: all 0.2s ease;
    }

    .article-item:hover {
      background: var(--text-color-b);
      border-left: 3px solid var(--primary-color-a);
      padding-left: calc(1rem - 3px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateX(2px);
    }

    .article-item-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color-a);
      margin-bottom: 0.35rem;
    }

    .article-item-meta {
      font-size: 0.75rem;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .article-sidebar {
      width: 40%;
      max-height: 60vh;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--text-color-b);
      border-radius: 0.75rem;
      border: 2px solid var(--primary-color-b);
    }

    .article-sidebar-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color-a);
      margin-bottom: 1rem;
    }

    .article-sidebar-section {
      margin-bottom: 1.5rem;
    }

    .article-sidebar-section h3 {
      font-weight: 600;
      color: var(--text-color-a);
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }

    .article-abstract {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-color-a);
      margin-bottom: 1rem;
    }

    .article-file-link {
      color: var(--primary-color-a);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .article-file-link:hover {
      color: var(--primary-color-b);
      text-decoration: underline;
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

    .article-meta-row {
      font-size: 0.85rem;
      color: var(--text-color-a);
      opacity: 0.85;
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    .article-authors-list,
    .article-citations-list,
    .article-cited-by-list {
      list-style: disc;
      padding-left: 1.25rem;
      font-size: 0.85rem;
      color: var(--text-color-a);
    }

    .article-authors-list li,
    .article-citations-list li,
    .article-cited-by-list li {
      margin-bottom: 0.35rem;
      line-height: 1.4;
    }

    .article-empty-state {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .article-loading {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
    }

    .article-error {
      padding: 1.5rem;
      color: #dc2626;
      font-weight: 500;
    }

    .article-status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      font-weight: 600;
      font-size: 0.75rem;
    }
  `;

  document.head.appendChild(style);
  __articlesStylesInjected = true;
}

/** Fetch list of articles */
async function fetchArticles(filters = {}) {
  const token = getToken();
  const url = new URL("/api/v1/articles", window.location.origin);
  Object.entries(filters).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });

  const res = await fetch(url.toString(), token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload.data ?? [];
}

/** Fetch single article */
async function fetchArticle(id) {
  const token = getToken();
  const res = await fetch(`/api/v1/articles/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload.data ?? null;
}

/** Create a list item for articles */
function createArticleListItem(article, onClick) {
  const item = document.createElement("div");
  item.className = "article-item";
  item.innerHTML = `
    <div class="article-item-title">${article.title}</div>
    <div class="article-item-meta">
      ${article.authors.map(a => a.name).join(", ")} • ${new Date(article.created_at).toLocaleDateString()}
    </div>
  `;
  item.addEventListener("click", () => onClick(article.id));
  return item;
}

/** Render article details in sidebar */
function renderArticleSidebar(container, article) {
  const authorsHTML = article.authors.length
    ? `<ul class="article-authors-list">
        ${article.authors.map(a => `<li>${a.name}${a.orcid ? ` (ORCID: ${a.orcid})` : ""}</li>`).join("")}
      </ul>`
    : `<p class="article-empty-state">No authors</p>`;

  const citationsHTML = article.citations.length
    ? `<ul class="article-citations-list">
        ${article.citations.map(c => `<li>${c.title} (${c.doi || "no DOI"})</li>`).join("")}
      </ul>`
    : `<p class="article-empty-state">No citations</p>`;

  const citedByHTML = article.cited_by.length
    ? `<ul class="article-cited-by-list">
        ${article.cited_by.map(c => `<li>${c.title} (${c.doi || "no DOI"})</li>`).join("")}
      </ul>`
    : `<p class="article-empty-state">Not cited by any articles</p>`;

  container.innerHTML = `
    <div class="article-sidebar-content">
      <h2 class="article-sidebar-title">${article.title}</h2>

      <div class="article-abstract">${article.abstract}</div>

      ${article.filename ? `<div class="article-sidebar-section">
        <strong>File:</strong> <a href="/uploads/${article.filename}" download class="article-file-link"><i class="fa-solid fa-download"></i> ${article.filename}</a>
      </div>` : ""}

      <div class="article-sidebar-section">
        <div class="article-meta-row">
          <strong>Keywords:</strong> ${article.keywords?.join(", ") || "N/A"}
        </div>
      </div>

      <div class="article-sidebar-section">
        <div class="article-meta-row">
          <strong>DOI:</strong>
          ${article.doi ? `<a href="https://doi.org/${article.doi}" target="_blank" class="article-doi-link">${article.doi}</a>` : "N/A"}
        </div>
      </div>

      <div class="article-sidebar-section">
        <div class="article-meta-row">
          <strong>Status:</strong> <span class="article-status-badge">${article.status || "N/A"}</span>
        </div>
      </div>

      <div class="article-sidebar-section">
        <div class="article-meta-row">
          <strong>Created:</strong> ${new Date(article.created_at).toLocaleString()}<br>
          <strong>Updated:</strong> ${new Date(article.updated_at).toLocaleString()}
        </div>
      </div>

      <div class="article-sidebar-section">
        <h3>Authors</h3>
        ${authorsHTML}
      </div>

      <div class="article-sidebar-section">
        <h3>Citations</h3>
        ${citationsHTML}
      </div>

      <div class="article-sidebar-section">
        <h3>Cited By</h3>
        ${citedByHTML}
      </div>
    </div>
  `;
}

/** Render articles list + sidebar */
export async function renderArticles({ page = 1, perPage = 15, filters = {} } = {}) {
  ensureArticleStyles();

  const container = createContentContainer({
    title: "Published Articles",
    icon: "fa-solid fa-newspaper",
    extraClasses: "",
    padded: true,
    margin: "2rem auto",
    border: "1px solid var(--primary-color-b)",
  });

  // Layout wrapper
  let wrapper = container.querySelector("#articleWrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "articleWrapper";
    wrapper.className = "article-wrapper";
    wrapper.innerHTML = `
      <div id="articleList" class="article-list"></div>
      <div id="articleSidebar" class="article-sidebar"></div>
    `;
    container.appendChild(wrapper);
  }

  const listEl = wrapper.querySelector("#articleList");
  const sidebarEl = wrapper.querySelector("#articleSidebar");

  listEl.innerHTML = `<div class="article-loading">
    <i class="fa-solid fa-spinner fa-spin"></i> Loading articles...
  </div>`;

  try {
    const articles = await fetchArticles({ ...filters, page, per_page: perPage });

    if (!articles.length) {
      listEl.innerHTML = `<div class="article-empty-state">No articles found.</div>`;
      sidebarEl.innerHTML = "";
      return;
    }

    listEl.innerHTML = "";
    for (const article of articles) {
      const item = createArticleListItem(article, async (id) => {
        const articleDetail = await fetchArticle(id);
        renderArticleSidebar(sidebarEl, articleDetail);
      });
      listEl.appendChild(item);
    }

    // Render first article by default
    if (articles[0]) {
      const firstArticle = await fetchArticle(articles[0].id);
      renderArticleSidebar(sidebarEl, firstArticle);
    }

  } catch (err) {
    listEl.innerHTML = `<div class="article-error"><i class="fa-solid fa-exclamation-circle"></i> Failed to load articles: ${err.message}</div>`;
    console.error(err);
  }
}
