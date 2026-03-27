// reviewer_article_view.js
import { getToken } from "./get_token.js";
import { createContentContainer } from "./layout.js";

import { renderCitations } from "./crud_citations.js";
let __showArticleStylesInjected = false;

function ensureShowArticleStyles() {
  if (__showArticleStylesInjected) return;

  const style = document.createElement("style");
  style.id = "show-article-theme";

  style.textContent = `
    .show-article-container {
      max-width: 56rem;
      margin: 2rem auto;
      padding: 1.5rem;
    }

    .article-section {
      margin-bottom: 1.5rem;
    }

    .article-section-title {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--text-color-a);
      margin-bottom: 0.75rem;
    }

    .article-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-color-a);
      margin-bottom: 0.5rem;
    }

    .article-status-row {
      font-size: 0.85rem;
      color: var(--text-color-a);
      opacity: 0.85;
    }

    .article-status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      font-weight: 600;
      font-size: 0.75rem;
    }

    .article-abstract {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-color-a);
    }

    .article-authors-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .article-author-item {
      padding: 0.75rem;
      border-bottom: 1px solid var(--text-color-b);
      background: transparent;
      transition: all 0.2s ease;
    }

    .article-author-item:last-child {
      border-bottom: none;
    }

    .article-author-item:hover {
      background: var(--text-color-b);
      border-radius: 0.375rem;
    }

    .article-author-name {
      font-weight: 600;
      color: var(--text-color-a);
      margin-bottom: 0.25rem;
    }

    .article-author-meta {
      font-size: 0.8rem;
      color: var(--text-color-a);
      opacity: 0.75;
      line-height: 1.4;
    }

    .article-citations-list {
      list-style: disc;
      padding-left: 1.25rem;
    }

    .article-citation-item {
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
      color: var(--text-color-a);
      line-height: 1.5;
    }

    .article-citation-doi {
      font-size: 0.75rem;
      color: var(--text-color-a);
      opacity: 0.7;
      display: inline-block;
      margin-left: 0.5rem;
    }

    .comments-container {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .comment-item {
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      padding: 1rem;
      background: var(--text-color-b);
      transition: all 0.2s ease;
    }

    .comment-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border-color: var(--primary-color-a);
    }

    .comment-meta {
      font-size: 0.75rem;
      color: var(--text-color-a);
      opacity: 0.7;
      margin-bottom: 0.5rem;
    }

    .comment-text {
      font-size: 0.9rem;
      color: var(--text-color-a);
      line-height: 1.5;
    }

    .comment-empty {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .comment-form {
      margin-top: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .comment-textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background: var(--background-color);
      color: var(--text-color-a);
      font-family: inherit;
      font-size: 0.9rem;
      outline: none;
      transition: all 0.2s ease;
      resize: vertical;
    }

    .comment-textarea:focus {
      border-color: var(--primary-color-a);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
    }

    .comment-submit {
      padding: 0.6rem 1rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .comment-submit:hover:not(:disabled) {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .comment-submit:active:not(:disabled) {
      transform: translateY(0);
    }

    .comment-submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .comment-error {
      color: #dc2626;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .decision-panel {
      margin-top: 2rem;
      margin-bottom: 1.5rem;
      padding-top: 1.5rem;
      border-top: 2px solid var(--primary-color-b);
      display: flex;
      gap: 1rem;
    }

    .decision-accept-btn,
    .decision-reject-btn {
      flex: 1;
      padding: 0.75rem 1.5rem;
      border: 1px solid transparent;
      border-radius: 0.375rem;
      color: white;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .decision-accept-btn {
      background: #16a34a;
      border-color: #15803d;
    }

    .decision-accept-btn:hover:not(:disabled) {
      background: #15803d;
      border-color: #16a34a;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
    }

    .decision-reject-btn {
      background: #dc2626;
      border-color: #991b1b;
    }

    .decision-reject-btn:hover:not(:disabled) {
      background: #991b1b;
      border-color: #dc2626;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .decision-accept-btn:disabled,
    .decision-reject-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .article-empty-state {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
    }

    .article-error {
      padding: 1.5rem;
      color: #dc2626;
      font-weight: 500;
    }

    .article-actions {
      display: flex;
      gap: 0.75rem;
    }

    .article-action-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.375rem;
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .article-action-btn:hover {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .article-action-btn:active {
      transform: translateY(0);
    }
  `;

  document.head.appendChild(style);
  __showArticleStylesInjected = true;
}

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
  if (!authors?.length) return `<div class="article-empty-state">No authors.</div>`;

  return `
    <ul class="article-authors-list">
      ${authors.map(a => `
        <li class="article-author-item">
          <div class="article-author-name"><i class="fa-solid fa-user" style="margin-right: 0.5rem;"></i>${a.name}</div>
          <div class="article-author-meta">
            ${a.affiliation ? `<div>Affiliation: ${a.affiliation}</div>` : ""}
            ${a.orcid ? `<div>ORCID: ${a.orcid}</div>` : ""}
          </div>
        </li>
      `).join("")}
    </ul>
  `;
}


/** Render existing comments */
function renderComments(comments) {
  if (!comments?.length) return `<div class="article-empty-state">No comments yet.</div>`;

  return `
    <div class="comments-container">
      ${comments.map(c => `
        <div class="comment-item">
          <div class="comment-meta">
            <i class="fa-solid fa-user-circle"></i> ${c.user?.name ?? "Unknown"} • ${new Date(c.created_at).toLocaleString()}
          </div>
          <div class="comment-text">${c.comment}</div>
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
  form.className = "comment-form";

  const textarea = document.createElement("textarea");
  textarea.name = "comment";
  textarea.placeholder = "Leave a comment...";
  textarea.required = true;
  textarea.rows = 4;
  textarea.className = "comment-textarea";

  const submit = document.createElement("button");
  submit.type = "submit";
  submit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Comment`;
  submit.className = "comment-submit";

  const errorBox = document.createElement("small");
  errorBox.className = "comment-error";

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
        div.className = "comment-item";
        div.innerHTML = `
          <div class="comment-meta">
            <i class="fa-solid fa-user-circle"></i> ${created.user?.name ?? "Unknown"} • ${new Date(created.created_at).toLocaleString()}
          </div>
          <div class="comment-text">${created.comment}</div>
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
  ensureShowArticleStyles();

  const content = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "2px solid var(--primary-color-b)",
    extraClasses: "show-article-container",
    title: "Review Article",
    icon: "fa-solid fa-file-lines",
  });

  content.innerHTML += `<p style="color: var(--text-color-a); text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Loading article...</p>`;

  try {
    const article = await fetchArticle(id);

    // render everything
    content.innerHTML = `
      <section class="article-section">
        <h2 class="article-title">${article.title}</h2>
        <div class="article-status-row">
          Status: <span class="article-status">${article.status ?? ""}</span>
        </div>

        <!-- Citations Button -->
        <div class="article-actions" style="margin-top: 0.75rem;">
          <button id="citationsBtn" type="button" class="article-action-btn">
            <i class="fa-solid fa-book"></i> Citations
          </button>
        </div>
      </section>

      <section class="article-section">
        <h3 class="article-section-title">Abstract</h3>
        <p class="article-abstract">${article.abstract ?? ""}</p>
      </section>

      <section class="article-section">
        <h3 class="article-section-title">Authors</h3>
        ${renderAuthors(article.authors)}
      </section>

      <section class="article-section">
        <h3 class="article-section-title">Reviewer Comments</h3>
        <div id="commentsContainer">
          ${renderComments(article.comments)}
        </div>
      </section>
    `;

    // Comments form
    const commentsContainer = content.querySelector("#commentsContainer");
    renderCommentForm(content, id, commentsContainer);

    // Decision panel
    renderDecisionPanel(content, id, article.status);

    // Citations button logic
    const citationsBtn = content.querySelector("#citationsBtn");

    citationsBtn?.addEventListener("click", async () => {
      await renderCitations(id);
    });

  } catch (err) {
    content.innerHTML = `
      <div class="article-error">
        <i class="fa-solid fa-exclamation-circle"></i> Failed to load article: ${err.message}
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

function renderDecisionPanel(container, articleId, currentStatus) {
  const panel = document.createElement("div");
  panel.className = "decision-panel";

  const acceptBtn = document.createElement("button");
  acceptBtn.innerHTML = `<i class="fa-solid fa-check"></i> Accept`;
  acceptBtn.className = "decision-accept-btn";
  acceptBtn.type = "button";

  const rejectBtn = document.createElement("button");
  rejectBtn.innerHTML = `<i class="fa-solid fa-xmark"></i> Reject`;
  rejectBtn.className = "decision-reject-btn";
  rejectBtn.type = "button";

  const statusEl = container.querySelector(".article-status");

  // Disable buttons if article is already decided or published
  const readonly = ["accepted", "rejected", "rejected_by_admin", "published"].includes(
    (currentStatus ?? "").toString().toLowerCase()
  );
  if (readonly) {
    acceptBtn.disabled = true;
    rejectBtn.disabled = true;
    // Optionally hide buttons completely if published
    if ((currentStatus ?? "").toString().toLowerCase() === "published") {
      acceptBtn.style.display = "none";
      rejectBtn.style.display = "none";
    }
  } else {
    acceptBtn.addEventListener("click", async () => {
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
      try {
        await submitDecision(articleId, "accepted");
        if (statusEl) statusEl.textContent = "accepted";
      } catch (err) {
        console.error("Failed to submit decision:", err);
        alert(err.message || "Failed to submit decision");
        acceptBtn.disabled = false;
        rejectBtn.disabled = false;
      }
    });

    rejectBtn.addEventListener("click", async () => {
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
      try {
        await submitDecision(articleId, "rejected");
        if (statusEl) statusEl.textContent = "rejected";
      } catch (err) {
        console.error("Failed to submit decision:", err);
        alert(err.message || "Failed to submit decision");
        acceptBtn.disabled = false;
        rejectBtn.disabled = false;
      }
    });
  }

  panel.appendChild(acceptBtn);
  panel.appendChild(rejectBtn);
  container.prepend(panel);
}
