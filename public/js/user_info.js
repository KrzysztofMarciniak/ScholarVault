import { createContentContainer } from "./layout.js";
import { updateUserAdmin } from "./admin_update_user.js";
import { deleteUserAdmin } from "./admin_delete_user.js";

const app = document.getElementById("app");

let __userStylesInjected = false;

function ensureUserStyles() {
  if (__userStylesInjected) return;

  const style = document.createElement("style");
  style.id = "admin-user-theme";

  style.textContent = `
    .user-info-list {
      list-style: none;
      margin: 0 0 1.5rem 0;
      padding: 0;
      display: grid;
      gap: 0.5rem;
      color: var(--text-color-a);
    }

    .user-info-list li {
      line-height: 1.5;
    }

    .user-info-list a {
      color: var(--primary-color-a);
      text-decoration: none;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .user-info-list a:hover {
      color: var(--primary-color-b);
      text-decoration: underline;
      text-underline-offset: 2px;
    }

    .admin-controls-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin: 0 0 1rem 0;
      color: var(--text-color-a);
    }

    .admin-user-form {
      display: grid;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 2px solid var(--primary-color-b);
      background: var(--text-color-b);
      color: var(--text-color-a);
    }

    .admin-user-field {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border-radius: 0.5rem;
      border: 1px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      outline: none;
      transition: all 0.2s ease;
    }

    .admin-user-field:focus {
      border-color: var(--primary-color-a);
      box-shadow: 0 0 0 3px rgba(0,0,0,0.1);
      background: var(--background-color);
    }

    .admin-user-save {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid var(--primary-color-b);
      border-radius: 0.5rem;
      background: var(--primary-color-a);
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .admin-user-save:hover {
      background: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .admin-user-save:active {
      transform: translateY(0);
    }

    .admin-user-save:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .admin-user-msg {
      display: block;
      min-height: 1.25rem;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      font-weight: 500;
    }

    .admin-user-deactivate-wrap {
      margin-top: 1rem;
    }

    .admin-user-deactivate {
      padding: 0.625rem 1rem;
      border-radius: 0.5rem;
      border: 2px solid #991b1b;
      background: #dc2626;
      color: white;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }

    .admin-user-deactivate:hover {
      background: #991b1b;
      border-color: #dc2626;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
    }

    .admin-user-deactivate:active {
      transform: translateY(0);
    }

    .admin-user-deactivated {
      font-size: 0.875rem;
      color: var(--text-color-a);
      opacity: 0.75;
      padding: 0.75rem;
      background: var(--background-color);
      border-radius: 0.5rem;
      border-left: 3px solid #dc2626;
    }
  `;

  document.head.appendChild(style);
  __userStylesInjected = true;
}

async function apiGet(path) {
  const token = localStorage.getItem("api_token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(path, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    let errJson = {};
    try {
      errJson = await res.json();
    } catch {}
    const msg = errJson?.message || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}

export async function fetchUser(id) {
  return apiGet(`/api/v1/users/show/${id}`);
}

export async function fetchCurrentUser() {
  return apiGet(`/api/v1/users/me`);
}

/* ---------------- USER VIEW ---------------- */

export function renderUserInfo(user) {
  ensureUserStyles();

  const container = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "1px solid var(--input-border)",
    extraClasses: "max-w-3xl",
    title: user.name || "User",
    icon: "fa-solid fa-user",
  });

  const deactivated = user.deactivated ? "yes" : "no";

  const list = document.createElement("ul");
  list.className = "user-info-list";
  list.innerHTML = `
    <li><strong>ID:</strong> ${user.id}</li>
    <li><strong>Email:</strong> ${user.email}</li>
    <li><strong>Role:</strong> ${user.role || "N/A"}</li>
    <li><strong>Affiliation:</strong> ${user.affiliation || "-"}</li>
    <li>
      <strong>ORCID:</strong>
      ${
        user.orcid
          ? `<a href="https://orcid.org/${user.orcid}" target="_blank" rel="noopener noreferrer">${user.orcid}</a>`
          : "-"
      }
    </li>
    <li><strong>Bio:</strong> ${user.bio || "-"}</li>
    <li><strong>Deactivated:</strong> ${deactivated}</li>
  `;

  container.appendChild(list);

  const adminArea = document.createElement("div");
  adminArea.id = "adminArea";
  container.appendChild(adminArea);

  app.innerHTML = "";
  app.appendChild(container);
}

/* ---------------- ADMIN CONTROLS ---------------- */

function renderAdminControls(user) {
  const adminArea = document.getElementById("adminArea");
  if (!adminArea) return;

  const deactivateHTML = user.deactivated
    ? `<div class="admin-user-deactivated"><i class="fa-solid fa-info-circle"></i> User already deactivated.</div>`
    : `<button id="deactivateBtn" type="button" class="admin-user-deactivate"><i class="fa-solid fa-ban"></i> Deactivate User</button>`;

  adminArea.innerHTML = `
    <h2 class="admin-controls-title">Admin Controls</h2>

    <form id="adminUserForm" class="admin-user-form">
      <input name="name" value="${user.name ?? ""}" class="admin-user-field" placeholder="Name">

      <input name="email" type="email" value="${user.email ?? ""}" class="admin-user-field" required>

      <input name="role_id" type="number" value="${user.role_id ?? ""}" class="admin-user-field" required>

      <input name="affiliation" value="${user.affiliation ?? ""}" class="admin-user-field" placeholder="Affiliation">

      <input name="orcid" value="${user.orcid ?? ""}" class="admin-user-field" placeholder="ORCID">

      <input name="bio" value="${user.bio ?? ""}" class="admin-user-field" placeholder="Bio">

      <button type="submit" class="admin-user-save"><i class="fa-solid fa-floppy-disk"></i> Save Changes</button>

      <small id="adminMsg" class="admin-user-msg"></small>
    </form>

    <div class="admin-user-deactivate-wrap">
      ${deactivateHTML}
    </div>
  `;

  wireAdminEvents(user);
}

/* ---------------- EVENTS ---------------- */

function wireAdminEvents(user) {
  const form = document.getElementById("adminUserForm");
  const msg = document.getElementById("adminMsg");

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();
      msg.textContent = "";
      msg.className = "admin-user-msg";

      const data = Object.fromEntries(new FormData(form).entries());

      try {
        await updateUserAdmin(user.id, data);
        msg.textContent = "✓ User updated successfully";
        msg.style.color = "#16a34a";
      } catch (err) {
        msg.textContent = "✗ " + (err.message || "Update failed");
        msg.style.color = "#dc2626";
      }
    };
  }

  const deactivateBtn = document.getElementById("deactivateBtn");

  if (deactivateBtn) {
    deactivateBtn.onclick = async () => {
      if (!confirm("Deactivate this user?")) return;

      try {
        const res = await deleteUserAdmin(user.id);
        alert(res?.message || "User deactivated");

        const refreshed = await fetchUser(user.id);
        renderUserInfo(refreshed);
        renderAdminControls(refreshed);
      } catch (err) {
        alert(err.message || "Failed to deactivate");
      }
    };
  }
}

/* ---------------- MAIN ---------------- */

export async function showUser(id) {
  try {
    const user = await fetchUser(id);
    renderUserInfo(user);

    const current = await fetchCurrentUser();
    if (current?.role === "Administrator") {
      renderAdminControls(user);
    }
  } catch (err) {
    app.innerHTML = `
      <div class="flex items-center justify-center py-10 text-red-600">
        Failed to load user: ${err.message}
      </div>
    `;
  }
}
