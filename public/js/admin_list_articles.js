// admin_list_articles.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";
import { notifySuccess, notifyError } from "./notification.js";
import { renderCitations } from "./crud_citations.js";

let __adminArticlesStylesInjected = false;
let selectedArticleId = null;

const STATUS_MAP = {
  submitted: { label: "Submitted", color: "#6366f1" },
  under_review: { label: "Under Review", color: "#f59e0b" },
  revision_required: { label: "Revision Required", color: "#ef4444" },
  accepted: { label: "Accepted", color: "#10b981" },
  rejected: { label: "Rejected", color: "#dc2626" },
  rejected_by_admin: { label: "Rejected (Admin)", color: "#991b1b" },
  published: { label: "Published", color: "#059669" },
};

function getStatusDisplay(status) {
  if (!status) return { label: "Unknown", color: "#6b7280" };
  const key = String(status).toLowerCase().replace(/ /g, "_");
  return STATUS_MAP[key] || { label: String(status), color: "#6b7280" };
}

function ensureAdminArticleStyles() {
  if (__adminArticlesStylesInjected) return;

  const style = document.createElement("style");
  style.id = "admin-articles-theme";

  style.textContent = `
    .admin-article-wrapper {
      display: flex;
      flex-direction: row;
      gap: 1.5rem;
      width: 100%;
      min-height: 60vh;
    }

    .admin-article-controls {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      flex: 1;
    }

    .admin-article-filters {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .admin-search-input,
    .admin-status-filter {
      padding: 0.6rem 0.875rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.5rem;
      background: var(--background-color);
      color: var(--text-color-a);
      outline: none;
      transition: all 0.2s ease;
      font-size: 0.9rem;
    }

    .admin-search-input {
      flex: 1;
      min-width: 200px;
    }

    .admin-status-filter {
      min-width: 150px;
    }

    .admin-search-input:focus,
    .admin-status-filter:focus {
      border-color: var(--primary-color-a);
      box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
    }

    .admin-filter-btn {
      padding: 0.6rem 1.25rem;
      border: none;
      border-radius: 0.5rem;
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .admin-filter-btn:hover {
      background: var(--primary-color-b);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .admin-filter-btn:active {
      transform: translateY(0);
    }

    .admin-article-list {
      flex: 1;
      overflow-y: auto;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.5rem;
      background: var(--background-color);
    }

    .admin-article-item {
      cursor: pointer;
      padding: 1rem;
      border-bottom: 1px solid var(--text-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      transition: all 0.2s ease;
    }

    .admin-article-item:last-child {
      border-bottom: none;
    }

    .admin-article-item:hover {
      background: var(--text-color-b);
      border-left: 3px solid var(--primary-color-a);
      padding-left: calc(1rem - 3px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .admin-article-item.selected {
      background: var(--text-color-b);
      border-left: 3px solid var(--primary-color-a);
      padding-left: calc(1rem - 3px);
    }

    .admin-article-item-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color-a);
      margin-bottom: 0.5rem;
    }

    .admin-article-item-meta {
      font-size: 0.8rem;
      color: var(--text-color-a);
      opacity: 0.7;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    .admin-article-item-status-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
    }

    .admin-article-sidebar {
      width: 42%;
      max-height: 60vh;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--text-color-b);
      border-radius: 0.75rem;
      border: 1px solid var(--primary-color-b);
    }

    .admin-article-sidebar-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-color-a);
      margin-bottom: 1.25rem;
      line-height: 1.3;
    }

    .admin-article-section {
      margin-bottom: 1.5rem;
    }

    .admin-article-section h3 {
      font-weight: 600;
      color: var(--text-color-a);
      font-size: 0.9rem;
      margin-bottom: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.8;
    }

    .admin-article-abstract {
      font-size: 0.9rem;
      line-height: 1.7;
      color: var(--text-color-a);
      margin-bottom: 1.25rem;
      white-space: pre-wrap;
    }

    .admin-article-file-link {
      color: var(--primary-color-a);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      word-break: break-word;
    }

    .admin-article-file-link:hover {
      color: var(--primary-color-b);
      text-decoration: underline;
    }

    .admin-article-meta-row {
      font-size: 0.85rem;
      color: var(--text-color-a);
      opacity: 0.85;
      line-height: 1.7;
      margin-bottom: 0.5rem;
      word-break: break-word;
    }

    .admin-article-meta-row strong {
      display: inline-block;
      min-width: 90px;
      font-weight: 600;
    }

    .admin-reviewer-list {
      list-style: none;
      padding: 0;
      margin: 0;
      font-size: 0.85rem;
      color: var(--text-color-a);
    }

    .admin-reviewer-item {
      margin-bottom: 0.65rem;
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      padding: 0.5rem;
      background: var(--background-color);
      border-radius: 0.375rem;
      opacity: 0.9;
    }

    .admin-reviewer-item i {
      margin-top: 0.125rem;
      flex-shrink: 0;
    }

    .admin-reviewer-info {
      flex: 1;
      min-width: 0;
    }

    .admin-reviewer-name {
      font-weight: 500;
      display: block;
      word-break: break-word;
    }

    .admin-reviewer-email {
      font-size: 0.75rem;
      opacity: 0.75;
      display: block;
      word-break: break-all;
    }

    .admin-action-buttons {
      display: flex;
      gap: 0.65rem;
      margin-top: 1.5rem;
      flex-wrap: wrap;
    }

    .admin-publish-btn,
    .admin-reject-btn,
    .admin-assign-btn,
    .admin-citations-btn {
      flex: 1;
      min-width: 140px;
      padding: 0.65rem 1rem;
      border: none;
      border-radius: 0.5rem;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.9rem;
    }

    .admin-publish-btn {
      background: #10b981;
    }

    .admin-publish-btn:hover:not(:disabled) {
      background: #059669;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }

    .admin-reject-btn {
      background: #ef4444;
    }

    .admin-reject-btn:hover:not(:disabled) {
      background: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
    }

    .admin-assign-btn,
    .admin-citations-btn {
      background: var(--primary-color-a);
    }

    .admin-assign-btn:hover:not(:disabled),
    .admin-citations-btn:hover:not(:disabled) {
      background: var(--primary-color-b);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .admin-publish-btn:disabled,
    .admin-reject-btn:disabled,
    .admin-assign-btn:disabled,
    .admin-citations-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .admin-article-status {
      display: inline-block;
      padding: 0.3rem 0.6rem;
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .admin-pagination {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }

    .admin-pagination-btn {
      padding: 0.4rem 0.7rem;
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
      padding: 2rem;
      text-align: center;
      color: var(--text-color-a);
    }

    .admin-empty-state {
      padding: 2rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .admin-error {
      padding: 1.5rem;
      color: #ef4444;
      font-weight: 500;
      background: rgba(239, 68, 68, 0.1);
      border-radius: 0.5rem;
      border-left: 3px solid #ef4444;
    }
  `;

  document.head.appendChild(style);
  __adminArticlesStylesInjected = true;
}

/** Fetch paginated admin articles with optional filters */
async function fetchAdminArticles({ page = 1, perPage = 10, status = null, search = "" } = {}) {
  const token = getToken();
  const params = new URLSearchParams({ page, per_page: perPage });
  if (status != null && status !== "") params.set("status", status);
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
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ status }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || res.statusText);
  return payload;
}

function createArticleListItem(article, onClick) {
  const item = document.createElement("div");
  item.className = "admin-article-item";
  item.dataset.articleId = String(article.id);

  const statusDisplay = getStatusDisplay(article.status);
  const authorNames = article.authors?.map(a => a.name).filter(Boolean).join(", ") || "";
  const metaAuthors = authorNames ? `<span>${authorNames}</span>` : `<span></span>`;

  item.innerHTML = `
    <div class="admin-article-item-title">${article.title || "Untitled"}</div>
    <div class="admin-article-item-meta">
      ${metaAuthors}
      <span class="admin-article-item-status-badge" style="background-color: ${statusDisplay.color}">
        ${statusDisplay.label}
      </span>
    </div>
  `;

  item.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    onClick?.(article);
  });

  return item;
}

/** Render the article details in sidebar */
function renderArticleSidebar(container, article) {
  selectedArticleId = article?.id ?? null;

  const statusDisplay = getStatusDisplay(article.status);

  const reviewersHTML = article.reviewers && article.reviewers.length
    ? `<ul class="admin-reviewer-list">
        ${article.reviewers.map(r => `
          <li class="admin-reviewer-item">
            <i class="fa-solid fa-user-check" style="color: var(--primary-color-a);"></i>
            <div class="admin-reviewer-info">
              <span class="admin-reviewer-name">${r.name}</span>
              <span class="admin-reviewer-email">${r.email}</span>
            </div>
          </li>
        `).join("")}
      </ul>`
    : `<p class="admin-empty-state">No reviewers assigned.</p>`;

  const authorsList = article.authors?.map(a => a.name).filter(Boolean).join(", ") || "";
  const keywords = article.keywords && article.keywords.length
    ? article.keywords.filter(Boolean).join(", ")
    : "";
  const abstract = article.abstract || "";
  const doi = article.doi || "";
  const hasFilename = Boolean(article.filename);

  container.innerHTML = `
    <div class="admin-article-sidebar-content">
      <h2 class="admin-article-sidebar-title">${article.title || "Untitled"}</h2>

      ${abstract ? `<div class="admin-article-abstract">${abstract}</div>` : ""}

      ${hasFilename ? `
        <div class="admin-article-section">
          <h3>Document</h3>
          <a href="/uploads/${encodeURIComponent(article.filename)}" download class="admin-article-file-link">
            <i class="fa-solid fa-download"></i> ${article.filename}
          </a>
        </div>
      ` : ""}

      ${authorsList ? `
        <div class="admin-article-section">
          <h3>Authors</h3>
          <div class="admin-article-meta-row">${authorsList}</div>
        </div>
      ` : ""}

      ${keywords ? `
        <div class="admin-article-section">
          <h3>Keywords</h3>
          <div class="admin-article-meta-row">${keywords}</div>
        </div>
      ` : ""}

      ${doi ? `
        <div class="admin-article-section">
          <h3>DOI</h3>
          <div class="admin-article-meta-row">${doi}</div>
        </div>
      ` : ""}

      <div class="admin-article-section">
        <h3>Status</h3>
        <span class="admin-article-status" style="background-color: ${statusDisplay.color}">
          ${statusDisplay.label}
        </span>
      </div>

      <div class="admin-article-section">
        <h3>Assigned Reviewers</h3>
        ${reviewersHTML}
      </div>

      <div id="adminActionButtons" class="admin-action-buttons"></div>
    </div>
  `;

  const actionButtons = container.querySelector("#adminActionButtons");

  if (article.status?.toLowerCase() === "accepted") {
    renderAdminDecisionButtons(container, article);
  }

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
        notifyError("Failed to load assign reviewers module");
      }
    });
    actionButtons.appendChild(assignBtn);
  }

  if (article.id) {
    const citationsBtn = document.createElement("button");
    citationsBtn.innerHTML = `<i class="fa-solid fa-book"></i> Citations`;
    citationsBtn.className = "admin-citations-btn";
    citationsBtn.addEventListener("click", async () => {
      try {
        selectedArticleId = article.id;
        await renderCitations(article.id);
      } catch (err) {
        console.error("Failed to load citations:", err);
        notifyError("Failed to load citations");
      }
    });
    actionButtons.appendChild(citationsBtn);
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
      const newStatus = res.new_status_name || "Published";
      article.status = newStatus;
      if (statusEl) {
        const newDisplay = getStatusDisplay(newStatus);
        statusEl.textContent = newDisplay.label;
        statusEl.style.backgroundColor = newDisplay.color;
      }
      notifySuccess("Article published successfully.");
      window.dispatchEvent(new CustomEvent("admin:article-updated", { detail: { articleId: article.id } }));
    } catch (err) {
      console.error("Publish failed:", err);
      notifyError(err.message || "Publish failed");
    } finally {
      setUiPending(false);
    }
  });

  rejectBtn.addEventListener("click", async () => {
    if (!confirm("Reject this article? This action cannot be undone.")) return;
    setUiPending(true);
    try {
      const res = await submitAdminDecision(article.id, "rejected_by_admin");
      const newStatus = res.new_status_name || "Rejected by Admin";
      article.status = newStatus;
      if (statusEl) {
        const newDisplay = getStatusDisplay(newStatus);
        statusEl.textContent = newDisplay.label;
        statusEl.style.backgroundColor = newDisplay.color;
      }
      notifySuccess("Article rejected.");
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
    margin: "2rem auto",
  });

  let wrapper = container.querySelector("#adminArticleWrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "adminArticleWrapper";
    wrapper.className = "admin-article-wrapper";
    wrapper.innerHTML = `
      <div class="admin-article-controls">
        <div class="admin-article-filters">
          <input id="adminSearch" type="text" placeholder="Search articles..." class="admin-search-input">
          <select id="adminStatusFilter" class="admin-status-filter">
            <option value="">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_review">Under Review</option>
            <option value="revision_required">Revision Required</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
            <option value="rejected_by_admin">Rejected (Admin)</option>
            <option value="published">Published</option>
          </select>
          <button id="adminFilterBtn" class="admin-filter-btn">
            <i class="fa-solid fa-filter"></i> Filter
          </button>
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

  function syncSelectedItem(articleId) {
    selectedArticleId = articleId ?? null;
    wrapper.querySelectorAll(".admin-article-item").forEach(el => {
      el.classList.toggle("selected", Number(el.dataset.articleId) === Number(selectedArticleId));
    });
  }

  async function loadArticles(page = 1) {
    currentPage = page;

    listEl.innerHTML = `
      <div class="admin-loading">
        <i class="fa-solid fa-spinner fa-spin"></i> Loading articles...
      </div>
    `;

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
        selectedArticleId = null;
        return;
      }

      listEl.innerHTML = "";

      articles.forEach(article => {
        const item = createArticleListItem(article, a => {
          syncSelectedItem(a.id);
          renderArticleSidebar(sidebarEl, a);
        });
        listEl.appendChild(item);
      });

      const firstArticle = articles[0];
      syncSelectedItem(firstArticle.id);
      renderArticleSidebar(sidebarEl, firstArticle);

      paginationEl.innerHTML = "";
      if (data.last_page > 1) {
        for (let i = 1; i <= data.last_page; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.className = `admin-pagination-btn ${i === data.current_page ? "active" : ""}`;
          btn.addEventListener("click", () => loadArticles(i));
          paginationEl.appendChild(btn);
        }
      }
    } catch (err) {
      listEl.innerHTML = `
        <div class="admin-error">
          <i class="fa-solid fa-exclamation-circle"></i> Failed to load articles: ${err.message}
        </div>
      `;
      console.error(err);
    }
  }

  filterBtn.addEventListener("click", () => loadArticles(1));
  window.addEventListener("admin:article-updated", () => loadArticles(currentPage));

  await loadArticles(1);
}
