// user_ui.js (theme-integrated, no Tailwind color conflicts)

export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ------ Inject theme-aware CSS ------ */
(function injectUserStyles() {
  if (document.getElementById("user-ui-theme")) return;

  const style = document.createElement("style");
  style.id = "user-ui-theme";

  style.textContent = `
    .user-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.5rem;

      border-radius: 0.5rem;
      border: 2px solid transparent;

      background: var(--text-color-b);
      color: var(--text-color-a);

      transition: all 0.2s ease;
    }

    .user-card:hover {
      border-color: var(--primary-color-b);
      background: var(--background-color);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateX(4px);
    }

    .user-id {
      font-size: 0.75rem;
      opacity: 0.6;
      font-family: monospace;
    }

    .user-name {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
    }

    .user-email {
      font-size: 0.85rem;
      opacity: 0.7;
    }

    .user-btn {
      padding: 0.35rem 0.75rem;
      font-size: 0.8rem;
      border-radius: 0.375rem;
      border: 1px solid var(--primary-color-b);
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .user-btn:hover {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .user-btn:active {
      transform: translateY(0);
    }

    .badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.7rem;
      border-radius: 0.375rem;
      border: 1px solid var(--primary-color-b);
      background: var(--primary-color-a);
      color: white;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }

    .badge-danger {
      background: #dc2626;
      border-color: #991b1b;
      color: white;
    }

    .badge-role {
      background: var(--primary-color-a);
      border-color: var(--primary-color-b);
      color: white;
    }

    .orcid-link {
      font-size: 0.8rem;
      color: var(--primary-color-a);
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .orcid-link:hover {
      color: var(--primary-color-b);
      transform: translateX(2px);
    }

    .ui-muted {
      opacity: 0.7;
    }

    .ui-error {
      color: #dc2626;
      font-weight: 500;
    }
  `;

  document.head.appendChild(style);
})();

/** Small badge renderers */
export function roleBadge(role) {
  if (!role) return "";
  return `<span class="badge badge-role">
            <i class="fa-solid fa-user-shield"></i> ${escapeHtml(role)}
          </span>`;
}

export function deactivatedBadge(deactivated) {
  if (!deactivated) return "";
  return `<span class="badge badge-danger">
            <i class="fa-solid fa-user-slash"></i> Deactivated
          </span>`;
}

export function orcidLink(orcid) {
  if (!orcid) return "";
  const safe = encodeURIComponent(orcid);
  return `<a href="https://orcid.org/${safe}" target="_blank"
             rel="noopener noreferrer"
             class="orcid-link">
             <i class="fa-brands fa-orcid"></i> ORCID
          </a>`;
}

/** Render single user card */
export function renderUserCard(user, options = {}) {
  const { showEmail = true, showControls = true } = options;

  const id = escapeHtml(user.id);
  const name = escapeHtml(user.name || "Unnamed user");

  const email = user.email
    ? `<span class="user-email"><i class="fa-solid fa-envelope"></i> ${escapeHtml(user.email)}</span>`
    : "";

  const role = roleBadge(user.role);
  const deactivated = deactivatedBadge(user.deactivated);
  const orcid = orcidLink(user.orcid);

  const controls = showControls ? `
    <div style="display:flex; align-items:center; gap:0.5rem;">
      ${role} ${deactivated}
      <button data-id="${id}" class="user-show-btn user-btn">
        <i class="fa-solid fa-eye"></i> Show
      </button>
    </div>` : "";

  return `
<div class="user-card">
  <div style="display:flex; gap:0.75rem; align-items:center;">
    <span class="user-id">#${id}</span>

    <div style="display:flex; flex-direction:column;">
      <span class="user-name">
        <i class="fa-solid fa-user ui-muted"></i>
        ${name}
      </span>
      ${showEmail ? email : ""}
      <div>${orcid}</div>
    </div>
  </div>

  ${controls}
</div>`;
}

/** Render list */
export function renderUserList(container, users, options = {}) {
  if (!container) throw new Error("container DOM element required");

  if (!Array.isArray(users) || users.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = users.map(u => renderUserCard(u, options)).join("");
}

/** UI states */
export function renderLoading(container, message = "Searching...") {
  container.innerHTML = `
    <div class="ui-muted" style="padding:1.5rem; text-align:center;">
      <i class="fa-solid fa-spinner fa-spin"></i> ${escapeHtml(message)}
    </div>
  `;
}

export function renderEmpty(container, messageHtml) {
  container.innerHTML = messageHtml || `<p class="ui-muted">No results.</p>`;
}

export function renderError(container, err) {
  const msg = err?.message ? escapeHtml(err.message) : "An error occurred";
  container.innerHTML = `<p class="ui-error">Error: ${msg}</p>`;
}

/** Attach handlers */
export function attachShowHandlers(container, handler) {
  if (!container) return;

  const defaultHandler = async (id) => {
    const mod = await import("./user_info.js");
    return mod.showUser?.(id);
  };

  const finalHandler = typeof handler === "function" ? handler : defaultHandler;

  container.querySelectorAll(".user-show-btn").forEach(btn => {
    btn.replaceWith(btn.cloneNode(true));
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
