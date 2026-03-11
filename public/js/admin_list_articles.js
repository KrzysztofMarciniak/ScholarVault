// admin_list_articles.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";
import { notifySuccess, notifyError } from "./notification.js";

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
  item.className = `
    cursor-pointer px-4 py-2 border-b border-gray-200 dark:border-gray-700
    hover:bg-gray-100 dark:hover:bg-gray-800 transition
  `;
  item.innerHTML = `
    <div class="font-medium text-gray-800 dark:text-gray-100">${article.title}</div>
    <div class="text-xs text-gray-500 dark:text-gray-400">
      ${article.authors.map(a => a.name).join(", ")} • Status: ${article.status || "N/A"}
    </div>
  `;
  item.addEventListener("click", () => onClick(article));
  return item;
}

/** Render the article details in sidebar */
function renderArticleSidebar(container, article) {
  const reviewersHTML = article.reviewers.length
    ? `<ul class="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300">
        ${article.reviewers.map(r => `
          <li>
            <i class="fa-solid fa-user-check mr-1 text-blue-500"></i>
            ${r.name} (${r.email})
          </li>
        `).join("")}
      </ul>`
    : `<p class="text-sm text-gray-500 dark:text-gray-400">No reviewers assigned.</p>`;

  container.innerHTML = `
    <div class="p-4 flex flex-col gap-3 w-full">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">${article.title}</h2>
      <p class="text-gray-700 dark:text-gray-300">${article.abstract}</p>
      ${article.filename ? `<p class="text-sm text-gray-500 dark:text-gray-400">
        File: <a href="/uploads/${article.filename}" download class="underline">${article.filename}</a>
      </p>` : ""}
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Authors: ${article.authors.map(a => a.name).join(", ")}
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Keywords: ${article.keywords?.join(", ") || "N/A"}
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Status: <span class="admin-article-status font-medium">${article.status || "N/A"}</span>
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <strong>Assigned Reviewers:</strong>
        ${reviewersHTML}
      </div>
      <div id="adminActionButtons" class="mt-4 flex gap-2"></div>
    </div>
  `;

  // Only render decision buttons if status is "Accepted"
  if (article.status?.toLowerCase() === "accepted") {
    renderAdminDecisionButtons(container, article);
  }

  // Assign reviewers button (optional)
  if (article.id) {
    const assignBtn = document.createElement("button");
    assignBtn.textContent = "Assign Reviewers";
    assignBtn.className = "mt-3 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600";
    assignBtn.addEventListener("click", async () => {
      try {
        const module = await import("./admin_assign_reviewers.js");
        module.renderAssignReviewers(article);
      } catch (err) {
        console.error("Failed to load assign reviewers module:", err);
      }
    });
    container.appendChild(assignBtn);
  }
}


/** Add admin decision buttons to sidebar */
function renderAdminDecisionButtons(container, article) {
  const btnContainer = container.querySelector("#adminActionButtons");
  btnContainer.innerHTML = "";

  const publishBtn = document.createElement("button");
  publishBtn.innerHTML = `<i class="fa-solid fa-upload mr-2"></i>Publish`;
  publishBtn.className = "px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2";

  const rejectBtn = document.createElement("button");
  rejectBtn.innerHTML = `<i class="fa-solid fa-ban mr-2"></i>Reject (admin)`;
  rejectBtn.className = "px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2";

  const statusEl = container.querySelector(".admin-article-status");

  const setUiPending = (isPending) => {
    publishBtn.disabled = isPending;
    rejectBtn.disabled = isPending;
    [publishBtn, rejectBtn].forEach(b => {
      if (isPending) b.classList.add("opacity-60", "cursor-not-allowed");
      else b.classList.remove("opacity-60", "cursor-not-allowed");
    });
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
  const container = createContentContainer({
    title: "All Articles",
    icon: "fa-solid fa-newspaper",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 w-full",
    margin: "2rem auto"
  });

  let wrapper = container.querySelector("#adminArticleWrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "adminArticleWrapper";
    wrapper.className = "flex flex-row gap-4 w-full min-h-[60vh]";
    wrapper.innerHTML = `
      <div class="flex flex-col flex-1">
        <div class="flex gap-2 mb-2">
          <input id="adminSearch" type="text" placeholder="Search..." class="flex-1 px-2 py-1 border rounded">
          <select id="adminStatusFilter" class="px-2 py-1 border rounded">
            <option value="">All Statuses</option>
            <option value="1">Submitted</option>
            <option value="2">Under Review</option>
            <option value="3">Revision Required</option>
            <option value="4">Accepted</option>
            <option value="5">Rejected</option>
            <option value="6">Published</option>
          </select>
          <button id="adminFilterBtn" class="px-3 py-1 bg-blue-500 text-white rounded">Filter</button>
        </div>
        <div id="adminArticleList" class="flex-1 overflow-y-auto border-r border-gray-200 dark:border-gray-700"></div>
        <div id="adminPagination" class="flex justify-center gap-2 mt-2"></div>
      </div>
      <div id="adminArticleSidebar" class="w-2/5 max-h-[60vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"></div>
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
    listEl.innerHTML = `<div class="py-6 text-center text-gray-500 dark:text-gray-400">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading articles...
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
        listEl.innerHTML = `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No articles found.</p>`;
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
        btn.className = `px-2 py-1 border rounded ${i === data.current_page ? "bg-blue-500 text-white" : ""}`;
        btn.addEventListener("click", () => loadArticles(i));
        paginationEl.appendChild(btn);
      }

    } catch (err) {
      listEl.innerHTML = `<div class="py-6 text-red-600 dark:text-red-400">Failed to load articles: ${err.message}</div>`;
      console.error(err);
    }
  }

  filterBtn.addEventListener("click", () => loadArticles(1));
  window.addEventListener("admin:article-updated", () => loadArticles(currentPage));

  await loadArticles(1);
}
