// user_ui.js
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Small badge renderers */
export function roleBadge(role) {
  if (!role) return "";
  return `<span class="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            <i class="fa-solid fa-user-shield mr-1"></i>${escapeHtml(role)}
          </span>`;
}

export function deactivatedBadge(deactivated) {
  if (!deactivated) return "";
  return `<span class="px-2 py-1 text-xs rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            <i class="fa-solid fa-user-slash mr-1"></i>Deactivated
          </span>`;
}

export function orcidLink(orcid) {
  if (!orcid) return "";
  const safe = encodeURIComponent(orcid);
  return `<a href="https://orcid.org/${safe}" target="_blank"
             rel="noopener noreferrer"
             class="flex items-center gap-1 text-green-600 hover:text-green-700 text-sm">
             <i class="fa-brands fa-orcid"></i>ORCID
          </a>`;
}

/**
 * Render single user card HTML string.
 * options:
 *   showEmail: boolean (default true)
 *   showControls: boolean (default true)
 */
export function renderUserCard(user, options = {}) {
  const { showEmail = true, showControls = true } = options;
  const id = escapeHtml(user.id);
  const name = escapeHtml(user.name || "Unnamed user");
  const email = user.email ? `<span class="text-sm text-gray-500"><i class="fa-solid fa-envelope mr-1"></i>${escapeHtml(user.email)}</span>` : "";
  const role = roleBadge(user.role);
  const deactivated = deactivatedBadge(user.deactivated);
  const orcid = orcidLink(user.orcid);

  const controls = showControls ? `
    <div class="flex items-center gap-2">
      ${role} ${deactivated}
      <button data-id="${escapeHtml(user.id)}" class="user-show-btn px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <i class="fa-solid fa-eye mr-1"></i>Show
      </button>
    </div>` : "";

  return `
<div class="flex items-center justify-between p-3 mb-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition">

  <div class="flex items-center gap-3">
    <span class="text-xs font-mono text-gray-500">#${id}</span>
    <div class="flex flex-col">
<span class="flex items-center gap-2 font-medium text-gray-800 dark:text-gray-100">
  <i class="fa-solid fa-user text-gray-400 dark:text-gray-500 text-sm"></i>
  ${name}
</span>
      ${ showEmail ? email : "" }
      <div class="mt-1">${orcid}</div>
    </div>
  </div>

  ${controls}

</div>`;
}

/**
 * Render a list of users into container.
 * options forwarded to renderUserCard.
 */
export function renderUserList(container, users, options = {}) {
  if (!container) throw new Error("container DOM element required");
  if (!Array.isArray(users) || users.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = users.map(u => renderUserCard(u, options)).join("");
}

/** UI state helpers */
export function renderLoading(container, message = "Searching...") {
  container.innerHTML = `
    <div class="flex items-center justify-center py-6 text-gray-500 dark:text-gray-400">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i> ${escapeHtml(message)}
    </div>
  `;
}

export function renderEmpty(container, messageHtml) {
  container.innerHTML = messageHtml || `<p class="text-gray-600 dark:text-gray-400">No results.</p>`;
}

export function renderError(container, err) {
  const msg = err?.message ? escapeHtml(err.message) : "An error occurred";
  container.innerHTML = `<p class="text-red-600 dark:text-red-400">Error: ${msg}</p>`;
}

/**
 * Attach handlers to .user-show-btn elements within container.
 * handler: function(id, buttonElement) — returns a Promise or void.
 * If handler is not provided, uses default dynamic import to ./user_info.js -> showUser(id).
 */
export function attachShowHandlers(container, handler) {
  if (!container) return;
  const defaultHandler = async (id) => {
    try {
      const mod = await import("./user_info.js");
      if (typeof mod.showUser === "function") return mod.showUser(id);
      throw new Error("user_info.showUser not found");
    } catch (err) {
      console.error("default show handler failed:", err);
      throw err;
    }
  };

  const finalHandler = typeof handler === "function" ? handler : defaultHandler;

  container.querySelectorAll(".user-show-btn").forEach(btn => {
    btn.replaceWith(btn.cloneNode(true)); // remove old listeners
  });

  container.querySelectorAll(".user-show-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        await finalHandler(id, e.currentTarget);
      } catch (err) {
        console.error("show handler error:", err);
      }
    });
  });
}
