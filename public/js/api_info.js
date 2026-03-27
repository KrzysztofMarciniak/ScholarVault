// api_info.js
/**
 * API info modal overlay (icon -> full-screen overlay).
 * Uses CSS variables from theme_switch.js for theme reactivity.
 */

let __apiStylesInjected = false;

function ensureApiStyles() {
  if (__apiStylesInjected) return;

  const style = document.createElement("style");
  style.id = "api-modal-theme";

  style.textContent = `
    .api-root {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
    }

    .api-icon {
      position: fixed;
      top: 6rem;
      right: 5.5rem;
      z-index: 10001;
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 9999px;
      border: 2px solid var(--primary-color-b);
      background-color: var(--primary-color-a);
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.3s ease;
    }

    .api-icon:hover {
      background-color: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }

    .api-icon:active {
      transform: translateY(0);
    }

    .api-icon:focus-visible {
      outline: 2px solid var(--primary-color-a);
      outline-offset: 2px;
    }

    .api-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .api-overlay.is-open {
      display: flex;
    }

    .api-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .api-overlay.is-open .api-backdrop {
      opacity: 1;
    }

    .api-panel {
      position: relative;
      z-index: 1;
      width: min(100%, 48rem);
      max-height: 80vh;
      overflow: hidden;
      margin-top: 1rem;
      border-radius: 1rem;
      border: 2px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      box-shadow: 0 20px 50px rgba(0,0,0,0.28);
      transform: scale(0.96);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .api-overlay.is-open .api-panel {
      transform: scale(1);
      opacity: 1;
    }

    .api-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 2px solid var(--primary-color-b);
      background: var(--text-color-b);
      flex-shrink: 0;
    }

    .api-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color-a);
    }

    .api-close-btn {
      border: 1px solid var(--primary-color-b);
      background: transparent;
      color: var(--primary-color-a);
      cursor: pointer;
      width: 2.25rem;
      height: 2.25rem;
      display: grid;
      place-items: center;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .api-close-btn:hover {
      background: var(--primary-color-a);
      color: white;
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
    }

    .api-close-btn:active {
      transform: translateY(0);
    }

    .api-content {
      display: flex;
      flex: 1;
      overflow: hidden;
    }

    .api-list-container {
      flex: 0 0 40%;
      border-right: 2px solid var(--primary-color-b);
      overflow-y: auto;
      padding: 0;
    }

    .api-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .api-item {
      padding: 1rem;
      border-bottom: 1px solid var(--input-border);
      cursor: pointer;
      transition: all 0.2s ease;
      background: transparent;
    }

    .api-item:hover {
      background: var(--text-color-b);
    }

    .api-item.active {
      background: var(--text-color-b);
      border-left: 4px solid var(--primary-color-a);
      padding-left: calc(1rem - 4px);
    }

    .api-item-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-color-a);
    }

    .api-detail-container {
      flex: 1;
      padding: 1rem;
      overflow-y: auto;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      color: var(--text-color-a);
    }

    .api-detail-text {
      font-size: 0.95rem;
      width: 100%;
      overflow-x: auto;
    }

    .api-json {
      font-family: "Fira Code", "Courier New", monospace;
      font-size: 0.88rem;
      line-height: 1.5;
      white-space: pre;
      padding: 1rem;
      border-radius: 0.75rem;
      background: #1e1e1e;
      color: #d4d4d4;
      width: 100%;
      overflow-x: auto;
    }

    .api-json .key { color: #9cdcfe; font-weight: 600; }
    .api-json .string { color: #ce9178; }
    .api-json .number { color: #b5cea8; }
    .api-json .boolean { color: #569cd6; font-weight: 600; }
    .api-json .null { color: #808080; font-style: italic; }
  `;

  document.head.appendChild(style);
  __apiStylesInjected = true;
}

/**
 * Usage: import and call initApiInfoModal() once on startup.
 */
export function initApiInfoModal() {
  if (document.getElementById("apiModalRoot")) return;

  ensureApiStyles();

  const root = document.createElement("div");
  root.id = "apiModalRoot";
  root.className = "api-root";
  document.body.appendChild(root);

  const iconBtn = document.createElement("button");
  iconBtn.id = "apiIcon";
  iconBtn.type = "button";
  iconBtn.className = "api-icon";
  iconBtn.setAttribute("aria-label", "Open API info");
  iconBtn.setAttribute("aria-expanded", "false");
  iconBtn.innerHTML = `<i class="fa-solid fa-code" aria-hidden="true"></i>`;
  root.appendChild(iconBtn);

  const overlay = document.createElement("div");
  overlay.id = "apiOverlay";
  overlay.className = "api-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div id="apiBackdrop" class="api-backdrop"></div>
    <div id="apiPanel" class="api-panel" role="dialog" aria-modal="true" aria-labelledby="apiTitle">
      <header class="api-header">
        <h2 id="apiTitle" class="api-title">API Info</h2>
        <button id="closeApiBtn" type="button" aria-label="Close API info" class="api-close-btn">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>

      <div class="api-content">
        <div class="api-list-container">
          <ul id="apiList" class="api-list"></ul>
        </div>
        <div id="apiDetail" class="api-detail-container">
          <div class="api-detail-text">Select an API</div>
        </div>
      </div>
    </div>
  `;
  root.appendChild(overlay);

  const panel = overlay.querySelector("#apiPanel");
  const backdrop = overlay.querySelector("#apiBackdrop");
  const apiList = overlay.querySelector("#apiList");
  const apiDetail = overlay.querySelector("#apiDetail");
  const closeBtn = overlay.querySelector("#closeApiBtn");

  let isOpen = false;
  let keyHandlerBound = false;

  const apis = [
    { id: 1, title: "Articles", endpoint: "/api/v1/articles/help" },
    { id: 2, title: "Articles Author", endpoint: "/api/v1/articles/help/author" },
    { id: 3, title: "Articles Reviewer", endpoint: "/api/v1/articles/help/reviewer" },
    { id: 4, title: "Articles Admin", endpoint: "/api/v1/articles/help/admin" },
    { id: 5, title: "Register", endpoint: "/api/v1/register/help" },
    { id: 6, title: "Login", endpoint: "/api/v1/login/help" },
    { id: 7, title: "Users", endpoint: "/api/v1/users/help" },
    { id: 8, title: "Citations", endpoint: "/api/v1/citations/help" },
    { id: 9, title: "Test", endpoint: "/api/v1/test/help" },
    { id: 10, title: "Test Sanitization", endpoint: "/api/v1/test/sanitization/help" },
    { id: 11, title: "Notifications", endpoint: "/api/v1/notifications/help" }
  ];

  async function fetchHelp(endpoint) {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) return "No help available";
      const data = await response.json();
      return data.message || data.help || JSON.stringify(data, null, 2);
    } catch (error) {
      return `Error fetching help: ${error.message}`;
    }
  }

  function renderJSON(data, container) {
    container.innerHTML = "";
    const pre = document.createElement("pre");
    pre.className = "api-json";

    function syntaxHighlight(obj) {
      if (typeof obj !== "string") obj = JSON.stringify(obj, null, 2);
      const escaped = obj.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      return escaped.replace(
        /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|\b-?\d+(\.\d+)?\b)/g,
        match => {
          let cls = "number";
          if (/^"/.test(match)) cls = /:$/.test(match) ? "key" : "string";
          else if (/true|false/.test(match)) cls = "boolean";
          else if (/null/.test(match)) cls = "null";
          return `<span class="${cls}">${match}</span>`;
        }
      );
    }

    pre.innerHTML = syntaxHighlight(data);
    container.appendChild(pre);
  }

  function renderList() {
    apiList.innerHTML = "";

    apis.forEach(api => {
      const li = document.createElement("li");
      li.className = "api-item";
      li.innerHTML = `<div class="api-item-title">${api.title}</div>`;

      li.addEventListener("click", async () => {
        document.querySelectorAll(".api-item").forEach(item => item.classList.remove("active"));
        li.classList.add("active");
        apiDetail.innerHTML = `<div class="api-detail-text">Loading...</div>`;

        const help = await fetchHelp(api.endpoint);
        try {
          const parsed = JSON.parse(help);
          renderJSON(parsed, apiDetail);
        } catch {
          apiDetail.innerHTML = `<div class="api-detail-text" style="white-space: pre-wrap; text-align: left;">${help}</div>`;
        }
      });

      apiList.appendChild(li);
    });
  }

  function openModal() {
    if (isOpen) return;
    isOpen = true;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    iconBtn.setAttribute("aria-expanded", "true");

    if (!keyHandlerBound) {
      document.addEventListener("keydown", onKeyDown);
      keyHandlerBound = true;
    }

    const focusable = panel.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])");
    if (focusable.length) focusable[0].focus();
  }

  function closeModal() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    iconBtn.setAttribute("aria-expanded", "false");

    if (keyHandlerBound) {
      document.removeEventListener("keydown", onKeyDown);
      keyHandlerBound = false;
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }
    if (e.key !== "Tab") return;

    const focusables = Array.from(panel.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])"))
      .filter(el => !el.hasAttribute("disabled"));
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  iconBtn.addEventListener("click", () => {
    if (isOpen) closeModal();
    else openModal();
  });

  renderList();
}
