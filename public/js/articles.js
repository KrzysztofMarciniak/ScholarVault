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
      text-transform: uppercase;
      letter-spacing: 0.5px;
      opacity: 0.9;
    }

    .article-abstract {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--text-color-a);
      margin-bottom: 1rem;
      white-space: pre-wrap;
      padding: 0.75rem;
      border-left: 3px solid var(--primary-color-a);
      background: rgba(0,0,0,0.05);
      border-radius: 0.35rem;
    }

    .article-file-link,
    .article-doi-link {
      color: var(--primary-color-a);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .article-file-link:hover,
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
    .article-citations-list {
      list-style: none;
      padding: 0;
      font-size: 0.85rem;
      color: var(--text-color-a);
    }

    .article-authors-list li,
    .article-citations-list li {
      margin-bottom: 0.75rem;
      line-height: 1.5;
      padding: 0.5rem 0.75rem;
      border-left: 2px solid var(--primary-color-a);
      background: rgba(0,0,0,0.02);
      border-radius: 0.25rem;
    }

    .article-citations-list li {
      font-size: 0.8rem;
    }

    .article-citations-list li strong {
      display: block;
      margin-bottom: 0.25rem;
      color: var(--text-color-a);
    }

    .article-empty-state {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-color-a);
      opacity: 0.7;
      font-style: italic;
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
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .article-cite-button {
      cursor: pointer;
      border: none;
      margin-top: 0.25rem;
    }

    .article-cite-menu {
      margin-top: 0.75rem;
      padding: 0.75rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.5rem;
      background: var(--background-color);
    }

    .article-cite-menu-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .article-cite-option {
      cursor: pointer;
      padding: 0.35rem 0.7rem;
      border-radius: 0.4rem;
      border: 1px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      font-weight: 600;
      font-size: 0.8rem;
      transition: all 0.2s ease;
    }

    .article-cite-option:hover {
      background: var(--text-color-b);
      transform: translateY(-1px);
    }

    .article-citation-output {
      width: 100%;
      min-height: 7rem;
      resize: vertical;
      border-radius: 0.5rem;
      border: 1px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      padding: 0.75rem;
      font-size: 0.85rem;
      line-height: 1.5;
      font-family: monospace;
      box-sizing: border-box;
    }

    .article-cite-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .article-cite-copy {
      cursor: pointer;
      border: none;
      padding: 0.45rem 0.75rem;
      border-radius: 0.4rem;
      background: var(--primary-color-a);
      color: white;
      font-weight: 600;
      font-size: 0.8rem;
    }

    .article-cite-copy:hover {
      opacity: 0.92;
    }

    @media (max-width: 900px) {
      .article-wrapper {
        flex-direction: column;
      }

      .article-list {
        max-height: none;
        border-right: none;
        border-bottom: 2px solid var(--primary-color-b);
      }

      .article-sidebar {
        width: 100%;
        max-height: none;
      }
    }
  `;

  document.head.appendChild(style);
  __articlesStylesInjected = true;
}

/** Basic HTML escaping for safe rendering */
function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getArticleAuthors(article) {
  return Array.isArray(article?.authors) ? article.authors : [];
}

function getAuthorNames(article) {
  return getArticleAuthors(article)
    .map((a) => a?.name)
    .filter(Boolean);
}

function getYear(article) {
  const dateStr = article?.created_at || article?.published_at || article?.updated_at;
  const d = dateStr ? new Date(dateStr) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getFullYear() : "n.d.";
}

function formatHarvardCitation(article) {
  const authors = getAuthorNames(article);
  const year = getYear(article);

  const authorText =
    authors.length === 0
      ? "Anonymous"
      : authors.length === 1
        ? authors[0]
        : authors.length === 2
          ? `${authors[0]} and ${authors[1]}`
          : `${authors[0]} et al.`;

  const title = article?.title || "Untitled";
  const doi = article?.doi ? `https://doi.org/${article.doi}` : "";
  const parts = [`${authorText} (${year})`, title];

  if (doi) parts.push(doi);

  return `${parts[0]}. ${parts[1]}.${doi ? ` ${doi}` : ""}`;
}

function slugifyForBibtex(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 32) || "article";
}

function formatBibTeX(article) {
  const authors = getAuthorNames(article);
  const year = getYear(article);
  const title = (article?.title || "Untitled").replaceAll("{", "\\{").replaceAll("}", "\\}");
  const authorField = authors.length ? authors.join(" and ") : "Anonymous";
  const keyBase = `${slugifyForBibtex(authors[0] || "article")}${year}`;

  const fields = [
    `@article{${keyBase},`,
    `  title={${title}},`,
    `  author={${authorField}},`,
    `  year={${year}}`
  ];

  if (article?.doi) {
    fields.push(`  doi={${article.doi}},`);
  }

  if (article?.journal) {
    fields.push(`  journal={${article.journal}},`);
  }

  if (article?.volume) {
    fields.push(`  volume={${article.volume}},`);
  }

  if (article?.issue) {
    fields.push(`  number={${article.issue}},`);
  }

  if (article?.pages) {
    fields.push(`  pages={${article.pages}},`);
  }

  const url = article?.doi ? `https://doi.org/${article.doi}` : article?.url;
  if (url) {
    fields.push(`  url={${url}},`);
  }

  if (fields.length > 1) {
    const last = fields.length - 1;
    fields[last] = fields[last].replace(/,$/, "");
  }

  fields.push(`}`);
  return fields.join("\n");
}

function formatCitation(article, style) {
  switch (style) {
    case "harvard":
      return formatHarvardCitation(article);
    case "bibtex":
      return formatBibTeX(article);
    default:
      return "";
  }
}

/** Fetch list of articles */
async function fetchArticles(filters = {}) {
  const token = getToken();
  const url = new URL("/api/v1/articles", window.location.origin);

  Object.entries(filters).forEach(([k, v]) => {
    if (v != null && v !== "") url.searchParams.set(k, v);
  });

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

  const authors = getAuthorNames(article).join(", ");
  const date = article?.created_at ? new Date(article.created_at).toLocaleDateString() : "Unknown date";

  item.innerHTML = `
    <div class="article-item-title">${escapeHtml(article?.title || "Untitled")}</div>
    <div class="article-item-meta">
      ${escapeHtml(authors || "No authors")} • ${escapeHtml(date)}
    </div>
  `;

  item.addEventListener("click", () => onClick(article.id));
  return item;
}

/** Render article details in sidebar */
function renderArticleSidebar(container, article) {
  const authors = getArticleAuthors(article);

  const authorsHTML = authors.length
    ? `<ul class="article-authors-list">
        ${authors
          .map((a) => `<li>${escapeHtml(a?.name || "")}${a?.orcid ? ` <span class="article-doi-link">(ORCID: ${escapeHtml(a.orcid)})</span>` : ""}</li>`)
          .join("")}
      </ul>`
    : `<p class="article-empty-state">No authors</p>`;

  const citationsHTML = Array.isArray(article?.citations) && article.citations.length
    ? `<ul class="article-citations-list">
        ${article.citations
          .map((c) => {
            const parts = [];
            if (c?.title) parts.push(`<strong>${escapeHtml(c.title)}</strong>`);
            if (c?.doi) parts.push(`<a href="https://doi.org/${encodeURIComponent(c.doi)}" target="_blank" rel="noopener noreferrer" class="article-doi-link">DOI: ${escapeHtml(c.doi)}</a>`);
            if (c?.url && c.url !== `https://doi.org/${c.doi}`) parts.push(`<a href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer" class="article-doi-link">View</a>`);
            return `<li>${parts.join(" • ")}</li>`;
          })
          .join("")}
      </ul>`
    : `<p class="article-empty-state">No citations</p>`;

  container.innerHTML = `
  <div class="article-sidebar-content">
    <h2 class="article-sidebar-title">
      ${escapeHtml(article?.title || "Untitled")}
    </h2>

    ${
      article?.abstract
        ? `<div class="article-sidebar-section">
            <div class="article-abstract">
              ${escapeHtml(article.abstract)}
            </div>
          </div>`
        : ""
    }

    ${
      Array.isArray(article?.keywords) && article.keywords.length
        ? `<div class="article-sidebar-section">
            <h3>Keywords</h3>
            <div class="article-meta-row">
              ${escapeHtml(article.keywords.join(" • "))}
            </div>
          </div>`
        : ""
    }

    ${
      article?.filename
        ? `<div class="article-sidebar-section">
            <h3>File</h3>
            <div class="article-meta-row">
              <a href="/uploads/${encodeURIComponent(article.filename)}"
                 download
                 class="article-file-link">
                <i class="fa-solid fa-download"></i> ${escapeHtml(article.filename)}
              </a>
            </div>
          </div>`
        : ""
    }

    ${
      article?.doi
        ? `<div class="article-sidebar-section">
            <h3>DOI</h3>
            <div class="article-meta-row">
              <a href="https://doi.org/${encodeURIComponent(article.doi)}"
                 target="_blank"
                 rel="noopener noreferrer"
                 class="article-doi-link">
                ${escapeHtml(article.doi)}
              </a>
            </div>
          </div>`
        : ""
    }

    ${
      article?.status
        ? `<div class="article-sidebar-section">
            <h3>Status</h3>
            <span class="article-status-badge">
              ${escapeHtml(article.status)}
            </span>
          </div>`
        : ""
    }

    ${
      article?.created_at || article?.updated_at
        ? `<div class="article-sidebar-section">
            <h3>Dates</h3>
            <div class="article-meta-row">
              ${
                article?.created_at
                  ? `<strong>Created:</strong> ${escapeHtml(new Date(article.created_at).toLocaleString())}<br>`
                  : ""
              }
              ${
                article?.updated_at
                  ? `<strong>Updated:</strong> ${escapeHtml(new Date(article.updated_at).toLocaleString())}`
                  : ""
              }
            </div>
          </div>`
        : ""
    }

    ${
      authorsHTML
        ? `<div class="article-sidebar-section">
            <h3>Authors</h3>
            ${authorsHTML}
          </div>`
        : ""
    }

    ${
      citationsHTML
        ? `<div class="article-sidebar-section">
            <h3>Citations</h3>
            ${citationsHTML}
          </div>`
        : ""
    }

    <div class="article-sidebar-section">
      <button id="citeBtn" class="article-status-badge article-cite-button" type="button">
        <i class="fa-solid fa-quote-left"></i> Cite This Article
      </button>

      <div id="citeMenu" class="article-cite-menu" style="display:none;">
        <div class="article-cite-menu-row">
          <button type="button" class="article-cite-option" data-style="harvard">Harvard</button>
          <button type="button" class="article-cite-option" data-style="bibtex">BibTeX</button>
        </div>

        <textarea id="citationOutput"
                  class="article-citation-output"
                  readonly
                  placeholder="Select a style to generate citation."></textarea>

        <div class="article-cite-actions">
          <button id="copyCitationBtn"
                  type="button"
                  class="article-cite-copy"
                  style="display:none;">
            <i class="fa-solid fa-copy"></i> Copy
          </button>
        </div>
      </div>
    </div>
  </div>
`;

  const citeBtn = container.querySelector("#citeBtn");
  const citeMenu = container.querySelector("#citeMenu");
  const citationOutput = container.querySelector("#citationOutput");
  const copyCitationBtn = container.querySelector("#copyCitationBtn");
  const styleButtons = container.querySelectorAll("[data-style]");

  citeBtn?.addEventListener("click", () => {
    const isHidden = citeMenu.style.display === "none" || !citeMenu.style.display;
    citeMenu.style.display = isHidden ? "block" : "none";
  });

  styleButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const style = btn.dataset.style;
      const citation = formatCitation(article, style);

      citationOutput.value = citation;
      copyCitationBtn.style.display = "inline-block";
    });
  });

  copyCitationBtn?.addEventListener("click", async () => {
    const text = citationOutput.value || "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      const original = copyCitationBtn.innerHTML;
      copyCitationBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
      setTimeout(() => {
        copyCitationBtn.innerHTML = original;
      }, 1200);
    } catch (err) {
      console.error("Failed to copy citation:", err);
    }
  });
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

  listEl.innerHTML = `
    <div class="article-loading">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading articles...
    </div>
  `;

  try {
    const articles = await fetchArticles({ ...filters, page, per_page: perPage });

    if (!articles.length) {
      listEl.innerHTML = `<div class="article-empty-state">No articles found.</div>`;
      sidebarEl.innerHTML = "";
      return container;
    }

    listEl.innerHTML = "";

    for (const article of articles) {
      const item = createArticleListItem(article, async (id) => {
        try {
          sidebarEl.innerHTML = `
            <div class="article-loading">
              <i class="fa-solid fa-spinner fa-spin"></i> Loading article...
            </div>
          `;
          const articleDetail = await fetchArticle(id);
          renderArticleSidebar(sidebarEl, articleDetail);
        } catch (err) {
          sidebarEl.innerHTML = `<div class="article-error">Failed to load article: ${escapeHtml(err.message)}</div>`;
          console.error(err);
        }
      });
      listEl.appendChild(item);
    }

    if (articles[0]) {
      const firstArticle = await fetchArticle(articles[0].id);
      renderArticleSidebar(sidebarEl, firstArticle);
    }
  } catch (err) {
    listEl.innerHTML = `
      <div class="article-error">
        <i class="fa-solid fa-exclamation-circle"></i>
        Failed to load articles: ${escapeHtml(err.message)}
      </div>
    `;
    console.error(err);
  }

  return container;
}
