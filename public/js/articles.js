// articles.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

/** Fetch list of articles */
async function fetchArticles(filters = {}) {
  const token = getToken();
  const url = new URL("/api/v1/articles", window.location.origin);
  Object.entries(filters).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });

  const res = await fetch(url.toString(), token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload;
}

/** Fetch single article */
async function fetchArticle(id) {
  const token = getToken();
  const res = await fetch(`/api/v1/articles/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload.data ?? null;
}

/** Article list item */
function createArticleListItem(article, onClick) {
  const item = document.createElement("div");
  item.className = `
    cursor-pointer px-4 py-2 border-b border-gray-200 dark:border-gray-700
    hover:bg-gray-100 dark:hover:bg-gray-800 transition
  `;
  item.innerHTML = `
    <div class="font-medium text-gray-800 dark:text-gray-100">${article.title}</div>
    <div class="text-xs text-gray-500 dark:text-gray-400">
      ${article.authors.map(a => a.name).join(", ")} • ${new Date(article.created_at).toLocaleDateString()}
    </div>
  `;
  item.addEventListener("click", () => onClick(article.id));
  return item;
}

/** Sidebar detail */
function renderArticleSidebar(container, article) {
  container.innerHTML = `
    <div class="p-4 flex flex-col gap-3 w-full">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">${article.title}</h2>
      <p class="text-gray-700 dark:text-gray-300">${article.abstract}</p>
      ${article.doi ? `<p class="text-xs text-gray-500 dark:text-gray-400">DOI: <a href="https://doi.org/${article.doi}" target="_blank" class="underline">${article.doi}</a></p>` : ""}
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Authors: ${article.authors.map(a => a.name).join(", ")}
      </div>
      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Keywords: ${article.keywords?.join(", ") || "N/A"}
      </div>
    </div>
  `;
}

/** Render articles list + sidebar */
export async function renderArticles({ page = 1, perPage = 15, filters = {} } = {}) {
  const container = createContentContainer({
    title: "Published Articles",
    icon: "fa-solid fa-newspaper",
    extraClasses: "",
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
  });

  // Layout wrapper
  let wrapper = container.querySelector("#articleWrapper");
  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "articleWrapper";
    wrapper.className = "flex flex-row gap-4 w-full min-h-[60vh]";
    wrapper.innerHTML = `
      <div id="articleList" class="flex-1 max-h-[60vh] overflow-y-auto border-r border-gray-200 dark:border-gray-700"></div>
      <div id="articleSidebar" class="w-2/5 max-h-[60vh] overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 rounded-xl"></div>
    `;
    container.appendChild(wrapper);
  }

  const listEl = wrapper.querySelector("#articleList");
  const sidebarEl = wrapper.querySelector("#articleSidebar");

  listEl.innerHTML = `<div class="py-6 text-center text-gray-500 dark:text-gray-400">
    <i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading articles...
  </div>`;

  try {
    const data = await fetchArticles({ ...filters, page, per_page: perPage });
    const articles = data.data ?? [];

    if (!articles.length) {
      listEl.innerHTML = `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No articles found.</p>`;
      sidebarEl.innerHTML = "";
      return;
    }

    listEl.innerHTML = "";
    articles.forEach(article => {
      const item = createArticleListItem(article, async (id) => {
        const articleDetail = await fetchArticle(id);
        renderArticleSidebar(sidebarEl, articleDetail);
      });
      listEl.appendChild(item);
    });

    // Render first article by default
    if (articles[0]) {
      const firstArticle = await fetchArticle(articles[0].id);
      renderArticleSidebar(sidebarEl, firstArticle);
    }

  } catch (err) {
    listEl.innerHTML = `<div class="py-6 text-red-600 dark:text-red-400">Failed to load articles: ${err.message}</div>`;
    console.error(err);
  }
}
