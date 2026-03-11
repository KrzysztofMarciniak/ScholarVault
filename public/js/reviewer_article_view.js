// showArticle.js
import { getToken } from "./get_token.js";
import { createContentContainer } from "./layout.js";

/** Fetch a single assigned article */
async function fetchArticle(id) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/v1/articles/assigned/${id}`, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || res.statusText);

  return payload;
}

/** Render authors list */
function renderAuthors(authors) {
  if (!authors?.length) return `<p class="text-gray-500">No authors.</p>`;

  return `
    <ul class="space-y-2">
      ${authors.map(a => `
        <li class="border-b pb-1">
          <strong>${a.name}</strong>
          ${a.affiliation ? `<div class="text-sm text-gray-500">${a.affiliation}</div>` : ""}
          ${a.orcid ? `<div class="text-xs text-gray-400">ORCID: ${a.orcid}</div>` : ""}
        </li>
      `).join("")}
    </ul>
  `;
}

/** Render citations list */
function renderCitations(list) {
  if (!list?.length) return `<p class="text-gray-500">None.</p>`;

  return `
    <ul class="list-disc ml-5 space-y-1">
      ${list.map(c => `
        <li>
          ${c.title}
          ${c.doi ? `<span class="text-xs text-gray-400">(DOI: ${c.doi})</span>` : ""}
        </li>
      `).join("")}
    </ul>
  `;
}

/** Render existing comments */
function renderComments(comments) {
  return `
    <div class="space-y-3">
      ${comments.map(c => `
        <div class="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
          <div class="text-xs text-gray-500 mb-1">
            ${c.user?.name ?? "Unknown"} • ${new Date(c.created_at).toLocaleString()}
          </div>
          <div class="text-sm">${c.comment}</div>
        </div>
      `).join("")}
    </div>
  `;
}

/** Submit comment to API */
async function submitComment(articleId, comment) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/v1/articles/assigned/comment/${articleId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ comment }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || res.statusText);

  return payload;
}

/** Render comment form below comments */
function renderCommentForm(container, articleId, commentsContainer) {
  const form = document.createElement("form");
  form.className = "mt-6 space-y-2";

  const textarea = document.createElement("textarea");
  textarea.name = "comment";
  textarea.placeholder = "Leave a comment...";
  textarea.required = true;
  textarea.rows = 3;
  textarea.className =
    "w-full p-2 border rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Submit Comment";
  submit.className =
    "px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition";

  const errorBox = document.createElement("small");
  errorBox.className = "block text-red-600 dark:text-red-400 mt-1";

  form.appendChild(textarea);
  form.appendChild(submit);
  form.appendChild(errorBox);
  container.appendChild(form);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.textContent = "";

    const comment = textarea.value.trim();
    if (!comment) {
      errorBox.textContent = "Comment cannot be empty";
      return;
    }

    submit.disabled = true;

    try {
      const created = await submitComment(articleId, comment);
      textarea.value = "";

      // Append new comment to comments container
      if (commentsContainer) {
        const div = document.createElement("div");
        div.className = "border rounded-lg p-3 bg-gray-50 dark:bg-gray-800";
        div.innerHTML = `
          <div class="text-xs text-gray-500 mb-1">
            ${created.user?.name ?? "Unknown"} • ${new Date(created.created_at).toLocaleString()}
          </div>
          <div class="text-sm">${created.comment}</div>
        `;
        commentsContainer.appendChild(div);
      }

    } catch (err) {
      console.error("Failed to submit comment:", err);
      errorBox.textContent = err.message || "Failed to submit comment";
    } finally {
      submit.disabled = false;
    }
  });
}

/** Show article with full info + comments + form */
export async function showArticle(id) {

  const content = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 max-w-4xl",
    title: "Review Article",
  });

  content.innerHTML += `<p class="text-gray-500">Loading article...</p>`;

  try {

    const article = await fetchArticle(id);

    // render everything; mark status with a span.article-status so we can update it
    content.innerHTML = `

      <section class="space-y-6">

        <div>
          <h2 class="text-xl font-semibold">${article.title}</h2>
          <div class="text-sm text-gray-500">Status: <span class="article-status">${article.status ?? ""}</span></div>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Abstract</h3>
          <p class="text-sm leading-relaxed">${article.abstract ?? ""}</p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Authors</h3>
          ${renderAuthors(article.authors)}
        </div>

        <div>
          <h3 class="font-semibold mb-2">Citations</h3>
          ${renderCitations(article.citations)}
        </div>

        <div>
          <h3 class="font-semibold mb-2">Cited By</h3>
          ${renderCitations(article.cited_by)}
        </div>

        <div>
          <h3 class="font-semibold mb-2">Reviewer Comments</h3>
          <div id="commentsContainer">
            ${renderComments(article.comments)}
          </div>
        </div>

      </section>
    `;

    const commentsContainer = content.querySelector("#commentsContainer");
    renderCommentForm(content, id, commentsContainer);

    // pass the current status to the decision panel so it can render read-only when appropriate
    renderDecisionPanel(content, id, article.status);

  } catch (err) {

    content.innerHTML = `
      <div class="text-red-500">
        Failed to load article: ${err.message}
      </div>
    `;

    console.error("Reviewer article view error:", err);
  }
}

/** Submit decision (accept/reject) */
async function submitDecision(articleId, decision) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(`/api/v1/articles/assigned/decide/${articleId}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ decision }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || res.statusText);

  return payload;
}

/** Render decision buttons for reviewer */
function renderDecisionPanel(container, articleId, currentStatus) {
  const panel = document.createElement("div");
  panel.className = "mt-6 flex gap-4";

  const acceptBtn = document.createElement("button");
  acceptBtn.textContent = "Accept";
  acceptBtn.className = "px-4 py-2 bg-green-600 text-white rounded-md";

  const rejectBtn = document.createElement("button");
  rejectBtn.textContent = "Reject";
  rejectBtn.className = "px-4 py-2 bg-red-600 text-white rounded-md";

  // find status element to update after change
  const statusEl = container.querySelector(".article-status");

  // Disable buttons if article is already decided
  const readonly = ["accepted", "rejected", "rejected_by_admin"].includes((currentStatus ?? "").toString().toLowerCase());
  if (readonly) {
    acceptBtn.disabled = true;
    rejectBtn.disabled = true;
    acceptBtn.classList.add("opacity-50", "cursor-not-allowed");
    rejectBtn.classList.add("opacity-50", "cursor-not-allowed");
  } else {
    acceptBtn.addEventListener("click", async () => {
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
      acceptBtn.classList.add("opacity-50", "cursor-not-allowed");
      rejectBtn.classList.add("opacity-50", "cursor-not-allowed");
      try {
        const res = await submitDecision(articleId, "accepted");
        // update UI status
        if (statusEl) statusEl.textContent = "accepted";
        // final read-only state
        acceptBtn.disabled = true;
        rejectBtn.disabled = true;
      } catch (err) {
        console.error("Failed to submit decision:", err);
        alert(err.message || "Failed to submit decision");
        acceptBtn.disabled = false;
        rejectBtn.disabled = false;
        acceptBtn.classList.remove("opacity-50", "cursor-not-allowed");
        rejectBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });

    rejectBtn.addEventListener("click", async () => {
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
      acceptBtn.classList.add("opacity-50", "cursor-not-allowed");
      rejectBtn.classList.add("opacity-50", "cursor-not-allowed");
      try {
        const res = await submitDecision(articleId, "rejected");
        if (statusEl) statusEl.textContent = "rejected";
        acceptBtn.disabled = true;
        rejectBtn.disabled = true;
      } catch (err) {
        console.error("Failed to submit decision:", err);
        alert(err.message || "Failed to submit decision");
        acceptBtn.disabled = false;
        rejectBtn.disabled = false;
        acceptBtn.classList.remove("opacity-50", "cursor-not-allowed");
        rejectBtn.classList.remove("opacity-50", "cursor-not-allowed");
      }
    });
  }

  panel.appendChild(acceptBtn);
  panel.appendChild(rejectBtn);
  container.prepend(panel);
}
