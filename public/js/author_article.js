// author_article.js
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

/** Fetch a single article (accepts { data: ... } or top-level object) */
async function fetchArticle(id) {
  const token = getToken();
  const res = await fetch(`/api/v1/articles/my/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload.data ?? payload ?? null;
}

async function fetchComments(id) {
  const token = getToken();
  const res = await fetch(`/api/v1/articles/my/comments/${id}`, token ? { headers: { Authorization: `Bearer ${token}` } } : {});
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload.data ?? payload ?? [];
}

/** Submit a new comment */
async function addComment(articleId, comment) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/v1/articles/my/comments/${articleId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ comment }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.statusText || "Failed to add comment");
  return payload;
}

/** Render article details */
function renderArticle(container, article) {
  const authors = Array.isArray(article.authors) ? article.authors : [];
  const keywords = Array.isArray(article.keywords) ? article.keywords : [];

  const created = article.created_at ? new Date(article.created_at).toLocaleString() : null;
  const updated = article.updated_at ? new Date(article.updated_at).toLocaleString() : null;

  container.innerHTML = `
    <div class="p-4 flex flex-col gap-3 w-full">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">${article.title ?? "Untitled"}</h1>
      <div class="text-sm text-gray-500">${article.doi ? `DOI: <a class="underline" href="https://doi.org/${article.doi}" target="_blank">${article.doi}</a>` : ""}</div>
      <p class="text-gray-700 dark:text-gray-300">${article.abstract ?? ""}</p>

      ${article.filename ? `<p class="text-sm text-gray-500 dark:text-gray-400">
        File: <a href="/uploads/${article.filename}" download class="underline">${article.filename}</a>
      </p>` : ""}

      <div class="grid grid-cols-2 gap-4 mt-2">
        <div class="text-sm text-gray-600 dark:text-gray-400">
          <strong>Authors</strong>
          <div>${authors.map(a => a.name ?? a).join(", ") || "N/A"}</div>
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          <strong>Keywords</strong>
          <div>${keywords.length ? keywords.join(", ") : "N/A"}</div>
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          <strong>Status</strong>
          <div>${String(article.status ?? "N/A")}</div>
        </div>

        <div class="text-sm text-gray-600 dark:text-gray-400">
          <strong>Timestamps</strong>
          <div>
            ${created ? `<div>Created: ${created}</div>` : ""}
            ${updated ? `<div>Updated: ${updated}</div>` : ""}
          </div>
        </div>
      </div>

      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <strong>Citations</strong>
        <div>${article.citations_count ?? (Array.isArray(article.citations) ? article.citations.length : 0)}</div>
      </div>

      <div class="mt-2 text-sm text-gray-600 dark:text-gray-400">
        <strong>Cited by</strong>
        <div>${article.cited_by_count ?? (Array.isArray(article.cited_by) ? article.cited_by.length : 0)}</div>
      </div>
    </div>
  `;
}

/** Render comments section */
function renderComments(container, comments, articleId) {
  const commentsContainer = document.createElement("div");
  commentsContainer.className = "mt-4";

  commentsContainer.innerHTML = `
    <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Comments</h2>
    <div id="commentList" class="flex flex-col gap-2 mb-2"></div>
    <textarea id="commentInput" rows="3" placeholder="Add a comment..." class="w-full p-2 border rounded"></textarea>
    <div class="flex gap-2 mt-2">
      <button id="submitComment" class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Submit</button>
      <small id="commentError" class="text-red-600 hidden"></small>
    </div>
  `;
  container.appendChild(commentsContainer);

  const listEl = commentsContainer.querySelector("#commentList");
  const inputEl = commentsContainer.querySelector("#commentInput");
  const submitBtn = commentsContainer.querySelector("#submitComment");
  const errorEl = commentsContainer.querySelector("#commentError");

  function renderCommentList() {
    listEl.innerHTML = (comments || []).map(c => {
      // c might be { user: "Name", comment: "...", created_at: "..." } OR { user: { name: "..." }, ... }
      const userName = typeof c.user === "string" ? c.user : (c.user?.name ?? "Unknown");
      const created = c.created_at ? new Date(c.created_at).toLocaleString() : "";
      return `
        <div class="p-2 border-b border-gray-200 dark:border-gray-700">
          <div class="text-sm text-gray-800 dark:text-gray-100 font-medium">${userName}</div>
          <div class="text-sm text-gray-700 dark:text-gray-300">${c.comment ?? ""}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400">${created}</div>
        </div>
      `;
    }).join("");
  }

  renderCommentList();

  submitBtn.addEventListener("click", async () => {
    const commentText = inputEl.value.trim();
    errorEl.classList.add("hidden");
    if (!commentText) {
      errorEl.textContent = "Comment cannot be empty";
      errorEl.classList.remove("hidden");
      return;
    }

    submitBtn.disabled = true;
    try {
      const newComment = await addComment(articleId, commentText);
      // API commonly returns the created comment object; support both shapes
      const created = newComment.data ?? newComment ?? null;

      // Normalize created comment into expected shape for client-side list
      const pushComment = created && typeof created === "object"
        ? (created.user ? created : { id: created.id ?? null, user: created.user ?? created.user_id ?? "You", comment: created.comment ?? commentText, created_at: created.created_at ?? new Date().toISOString() })
        : { user: "You", comment: commentText, created_at: new Date().toISOString() };

      comments.push(pushComment);
      inputEl.value = "";
      renderCommentList();
    } catch (err) {
      console.error("Failed to submit comment:", err);
      errorEl.textContent = err.message || "Failed to submit comment";
      errorEl.classList.remove("hidden");
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/** Main render function */
export async function renderAuthorArticle(articleId) {
  const container = createContentContainer({
    title: "Article Details",
    icon: "fa-solid fa-newspaper",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 w-full",
    margin: "2rem auto"
  });

  try {
    const article = await fetchArticle(articleId);
    if (!article) {
      container.innerHTML = `<div class="py-6 text-red-600 dark:text-red-400 text-center">Article not found.</div>`;
      return;
    }
    renderArticle(container, article);

    const comments = await fetchComments(articleId);
    renderComments(container, comments ?? [], articleId);
  } catch (err) {
    container.innerHTML = `<div class="py-6 text-red-600 dark:text-red-400 text-center">Failed to load article: ${err.message}</div>`;
    console.error(err);
  }
}
