// admin_list_articles.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";
import { notifySuccess, notifyError } from "./notification.js";

let __adminArticlesStylesInjected = false;

function ensureAdminArticleStyles() {
  if (__adminArticlesStylesInjected) return;

  const style = document.createElement("style");
  style.id = "admin-articles-theme";

  style.textContent = `
    .admin-article-wrapper {
      display: flex;
      flex-direction: row;
      gap: 1rem;
      width: 100%;
      min-height: 60vh;
    }

    .admin-article-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .admin-article-filters {
      display: flex;
      gap: 0.5rem;
    }

    .admin-search-input,
    .admin-status-filter {
      flex: 1;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background: var(--background-color);
      color: var(--text-color-a);
      outline: none;
      transition: all 0.2s ease;
    }

    .admin-search-input:focus,
    .admin-status-filter:focus {
      border-color: var(--primary-color-a);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
    }

    .admin-filter-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .admin-filter-btn:hover {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .admin-filter-btn:active {
      transform: translateY(0);
    }

    .admin-article-list {
      flex: 1;
      overflow-y: auto;
      border-right: 2px solid var(--primary-color-b);
    }

    .admin-article-item {
      cursor: pointer;
      padding: 1rem;
      border-bottom: 1px solid var(--text-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      transition: all 0.2s ease;
    }

    .admin-article-item:hover {
      background: var(--text-color-b);
      border-left: 3px solid var(--primary-color-a);
      padding-left: calc(1rem - 3px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateX(2px);
    }

    .admin-article-item-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color-a);
      margin-bottom: 0.35rem;
    }

    .admin-article-item-meta {
      font-size: 0.75rem;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .admin-article-sidebar {
      width: 40%;
      max-height: 60vh;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--text-color-b);
      border-radius: 0.75rem;
      border: 2px solid var(--primary-color-b);
    }

    .admin-article-sidebar-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color-a);
      margin-bottom: 1rem;
    }

    .admin-article-section {
      margin-bottom: 1.5rem;
    }

    .admin-article-section h3 {
      font-weight: 600;
      color: var(--text-color-a);
      font-size: 0.95rem;
      margin-bottom: 0.5rem;
    }

    .admin-article-abstract {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-color-a);
      margin-bottom: 1rem;
    }

    .admin-article-file-link {
      color: var(--primary-color-a);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .admin-article-file-link:hover {
      color: var(--primary-color-b);
      text-decoration: underline;
    }

    .admin-article-meta-row {
      font-size: 0.85rem;
      color: var(--text-color-a);
      opacity: 0.85;
      line-height: 1.6;
      margin-bottom: 0.5rem;
    }

    .admin-reviewer-list {
      list-style: disc;
      padding-left: 1.25rem;
      font-size: 0.85rem;
      color: var(--text-color-a);
    }

    .admin-reviewer-item {
      margin-bottom: 0.35rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .admin-action-buttons {
      display: flex;
      gap: 0.5rem;
      margin-top: 1.5rem;
    }

    .admin-publish-btn,
    .admin-reject-btn,
    .admin-assign-btn {
      flex: 1;
      padding: 0.6rem 1rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .admin-publish-btn {
      background: #16a34a;
      border-color: #15803d;
    }

    .admin-publish-btn:hover:not(:disabled) {
      background: #15803d;
      border-color: #16a34a;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(22, 163, 74, 0.3);
    }

    .admin-reject-btn {
      background: #dc2626;
      border-color: #991b1b;
    }

    .admin-reject-btn:hover:not(:disabled) {
      background: #991b1b;
      border-color: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
    }

    .admin-assign-btn {
      background: var(--primary-color-a);
      border-color: var(--primary-color-b);
    }

    .admin-assign-btn:hover:not(:disabled) {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .admin-publish-btn:disabled,
    .admin-reject-btn:disabled,
    .admin-assign-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .admin-article-status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .admin-article-status-deactivated {
      font-size: 0.85rem;
      color: var(--text-color-a);
      opacity: 0.75;
      padding: 0.75rem;
      background: var(--background-color);
      border-radius: 0.5rem;
      border-left: 3px solid #dc2626;
    }

    .admin-pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .admin-pagination-btn {
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

    .admin-pagination-btn:hover {
      background: var(--text-color-b);
      border-color: var(--primary-color-a);
    }

    .admin-pagination-btn.active {
      background: var(--primary-color-a);
      color: white;
      border-color: var(--primary-color-a);
    }

    .admin-loading {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
    }

    .admin-empty-state {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .admin-error {
      padding: 1.5rem;
      color: #dc2626;
      font-weight: 500;
    }
  `;

  document.head.appendChild(style);
  __adminArticlesStylesInjected = true;
}

/** Fetch paginated admin articles with optional filters */
async function fetchAdminArticles({ page = 1, perPage = 10, status = null, search = "" } = {}) {
  const token = getToken();
  const params = new URLSearchParams({ page, per_page: perPage });
  if (status != null) params.set("status", status);
  if (search) params.set("search", search);

  const url = `/api/v1/articles/admin?${params.toString()}`;
  const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload;
}

/** Submit admin decision for an article */
async function submitAdminDecision(articleId, status) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const url = `/api/v1/articles/admin/decide/${articleId}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || res.statusText);
  return payload;
}

/** Create a list item for admin articles */
function createArticleListItem(article, onClick) {
  const item = document.createElement("div");
  item.className = "admin-article-item";
  item.innerHTML = `
    <div class="admin-article-item-title">${article.title}</div>
    <div class="admin-article-item-meta">
      ${article.authors.map(a => a.name).join(", ")} • Status: ${article.status || "N/A"}
    </div>
  `;
  item.addEventListener("click", () => onClick(article));
  return item;
}

/** Render the article details in sidebar */
function renderArticleSidebar(container, article) {
  const reviewersHTML = article.reviewers.length
    ? `<ul class="admin-reviewer-list">
        ${article.reviewers.map(r => `
          <li class="admin-reviewer-item">
            <i class="fa-solid fa-user-check" style="color: var(--primary-color-a);"></i>
            ${r.name} (${r.email})
          </li>
        `).join("")}
      </ul>`
    : `<p class="admin-empty-state">No reviewers assigned.</p>`;

  container.innerHTML = `
    <div class="admin-article-sidebar-content">
      <h2 class="admin-article-sidebar-title">${article.title}</h2>

      <div class="admin-article-abstract">${article.abstract}</div>

      ${article.filename ? `<div class="admin-article-section">
        <strong>File:</strong> <a href="/uploads/${article.filename}" download class="admin-article-file-link"><i class="fa-solid fa-download"></i> ${article.filename}</a>
      </div>` : ""}

      <div class="admin-article-section">
        <div class="admin-article-meta-row">
          <strong>Authors:</strong> ${article.authors.map(a => a.name).join(", ")}
        </div>
      </div>

      <div class="admin-article-section">
        <div class="admin-article-meta-row">
          <strong>Keywords:</strong> ${article.keywords?.join(", ") || "N/A"}
        </div>
      </div>

      <div class="admin-article-section">
        <div class="admin-article-meta-row">
          <strong>Status:</strong> <span class="admin-article-status">${article.status || "N/A"}</span>
        </div>
      </div>

      <div class="admin-article-section">
        <h3>Assigned Reviewers</h3>
        ${reviewersHTML}
      </div>

      <div id="adminActionButtons" class="admin-action-buttons"></div>
    </div>
  `;

  // Only render decision buttons if status is "Accepted"
  if (article.status?.toLowerCase() === "accepted") {
    renderAdminDecisionButtons(container, article);
  }

  // Assign reviewers button (optional)
  if (article.id) {
    const assignBtn = document.createElement("button");
    assignBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Assign Reviewers`;
    assignBtn.className = "admin-assign-btn";
    assignBtn.addEventListener("click", async () => {
      try {
        const module = await import("./admin_assign_reviewers.js");
        module.renderAssignReviewers(article);
      } catch (err) {
        console.error("Failed to load assign reviewers module:", err);
      }
    });
    container.querySelector("#adminActionButtons").appendChild(assignBtn);
  }
}

/** Add admin decision buttons to sidebar */
function renderAdminDecisionButtons(container, article) {
  const btnContainer = container.querySelector("#adminActionButtons");
  if (!btnContainer) return;

  const publishBtn = document.createElement("button");
  publishBtn.innerHTML = `<i class="fa-solid fa-upload"></i> Publish`;
  publishBtn.className = "admin-publish-btn";

  const rejectBtn = document.createElement("button");
  rejectBtn.innerHTML = `<i class="fa-solid fa-ban"></i> Reject`;
  rejectBtn.className = "admin-reject-btn";

  const statusEl = container.querySelector(".admin-article-status");

  const setUiPending = (isPending) => {
    publishBtn.disabled = isPending;
    rejectBtn.disabled = isPending;
  };

  publishBtn.addEventListener("click", async () => {
    if (!confirm("Publish this article? This action cannot be undone by reviewers.")) return;
    setUiPending(true);
    try {
      const res = await submitAdminDecision(article.id, "published");
      article.status = res.new_status_name || "Published";
      if (statusEl) statusEl.textContent = article.status;
      notifySuccess("Article published.");
      window.dispatchEvent(new CustomEvent("admin:article-updated", { detail: { articleId: article.id } }));
    } catch (err) {
      console.error("Publish failed:", err);
      notifyError(err.message || "Publish failed");
    } finally {
      setUiPending(false);
    }
  });

  rejectBtn.addEventListener("click", async () => {
    if (!confirm("Reject this article (admin)?")) return;
    setUiPending(true);
    try {
      const res = await submitAdminDecision(article.id, "rejected_by_admin");
      article.status = res.new_status_name || "Rejected by Admin";
      if (statusEl) statusEl.textContent = article.status;
      notifySuccess("Article rejected (admin).");
      window.dispatchEvent(new CustomEvent("admin:article-updated", { detail: { articleId: article.id } }));
    } catch (err) {
      console.error("Reject failed:", err);
      notifyError(err.message || "Reject failed");
    } finally {
      setUiPending(false);
    }
  });

  btnContainer.appendChild(publishBtn);
  btnContainer.appendChild(rejectBtn);
}

/** Render admin articles list + sidebar */
export async function renderAdminArticles({ page = 1, perPage = 10, filters = {} } = {}) {
  ensureAdminArticleStyles();

  const container = createContentContainer({
    title: "All Articles",
    icon: "fa-solid fa-newspaper",
    extraClasses: "",
    margin: "2rem auto"
  });

  let wrapper = container.querySelector("#adminArticleWrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "adminArticleWrapper";
    wrapper.className = "admin-article-wrapper";
    wrapper.innerHTML = `
      <div class="admin-article-controls" style="flex: 1;">
        <div class="admin-article-filters">
          <input id="adminSearch" type="text" placeholder="Search..." class="admin-search-input" style="flex: 1;">
          <select id="adminStatusFilter" class="admin-status-filter">
            <option value="">All Statuses</option>
            <option value="1">Submitted</option>
            <option value="2">Under Review</option>
            <option value="3">Revision Required</option>
            <option value="4">Accepted</option>
            <option value="5">Rejected</option>
            <option value="6">Published</option>
          </select>
          <button id="adminFilterBtn" class="admin-filter-btn"><i class="fa-solid fa-filter"></i> Filter</button>
        </div>
        <div id="adminArticleList" class="admin-article-list"></div>
        <div id="adminPagination" class="admin-pagination"></div>
      </div>
      <div id="adminArticleSidebar" class="admin-article-sidebar"></div>
    `;
    container.appendChild(wrapper);
  }

  const listEl = wrapper.querySelector("#adminArticleList");
  const sidebarEl = wrapper.querySelector("#adminArticleSidebar");
  const paginationEl = wrapper.querySelector("#adminPagination");
  const searchEl = wrapper.querySelector("#adminSearch");
  const statusEl = wrapper.querySelector("#adminStatusFilter");
  const filterBtn = wrapper.querySelector("#adminFilterBtn");

  let currentPage = 1;

  async function loadArticles(page = 1) {
    currentPage = page;
    listEl.innerHTML = `<div class="admin-loading">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading articles...
    </div>`;

    try {
      const data = await fetchAdminArticles({
        page,
        perPage,
        status: statusEl.value || null,
        search: searchEl.value.trim(),
      });

      const articles = data.data ?? [];

      if (!articles.length) {
        listEl.innerHTML = `<div class="admin-empty-state">No articles found.</div>`;
        sidebarEl.innerHTML = "";
        paginationEl.innerHTML = "";
        return;
      }

      listEl.innerHTML = "";
      articles.forEach(article => {
        const item = createArticleListItem(article, a => renderArticleSidebar(sidebarEl, a));
        listEl.appendChild(item);
      });

      renderArticleSidebar(sidebarEl, articles[0]);

      // Pagination buttons
      paginationEl.innerHTML = "";
      for (let i = 1; i <= data.last_page; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = `admin-pagination-btn ${i === data.current_page ? "active" : ""}`;
        btn.addEventListener("click", () => loadArticles(i));
        paginationEl.appendChild(btn);
      }

    } catch (err) {
      listEl.innerHTML = `<div class="admin-error"><i class="fa-solid fa-exclamation-circle"></i> Failed to load articles: ${err.message}</div>`;
      console.error(err);
    }
  }

  filterBtn.addEventListener("click", () => loadArticles(1));
  window.addEventListener("admin:article-updated", () => loadArticles(currentPage));

  await loadArticles(1);
}
