import { createContentContainer } from "./layout.js";
import { updateUserAdmin } from "./admin_update_user.js";
import { deleteUserAdmin } from "./admin_delete_user.js";

const app = document.getElementById("app");

async function apiGet(path) {
  const token = localStorage.getItem("api_token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(path, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    let errJson = {};
    try { errJson = await res.json(); } catch {}

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

  const container = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "max-w-3xl",
    title: user.name || "User",
    icon: "fa-solid fa-user"
  });

  const deactivated = user.deactivated ? "yes" : "no";

  const list = document.createElement("ul");
  list.className = "space-y-2 text-gray-700 dark:text-gray-300 mb-6";

  list.innerHTML = `
    <li><strong>ID:</strong> ${user.id}</li>
    <li><strong>Email:</strong> ${user.email}</li>
    <li><strong>Role:</strong> ${user.role || "N/A"}</li>
    <li><strong>Affiliation:</strong> ${user.affiliation || "-"}</li>
    <li>
      <strong>ORCID:</strong>
      ${
        user.orcid
          ? `<a href="https://orcid.org/${user.orcid}"
               target="_blank"
               class="text-green-600 hover:text-green-700">
               ${user.orcid}
             </a>`
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

  const deactivateHTML = user.deactivated
    ? `<div class="text-sm text-gray-500">User already deactivated.</div>`
    : `<button id="deactivateBtn"
         class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
         Deactivate User
       </button>`;

  adminArea.innerHTML = `

    <h2 class="text-xl font-semibold mb-4">
      Admin Controls
    </h2>

    <form id="adminUserForm"
      class="space-y-4 p-6 rounded-lg border
             border-gray-200 dark:border-gray-700
             bg-gray-50 dark:bg-gray-800">

      <input name="name" value="${user.name ?? ""}"
        class="w-full p-2 rounded border dark:bg-gray-700"
        placeholder="Name">

      <input name="email" type="email" value="${user.email ?? ""}"
        class="w-full p-2 rounded border dark:bg-gray-700"
        required>

      <input name="role_id" type="number" value="${user.role_id ?? ""}"
        class="w-full p-2 rounded border dark:bg-gray-700"
        required>

      <input name="affiliation" value="${user.affiliation ?? ""}"
        class="w-full p-2 rounded border dark:bg-gray-700"
        placeholder="Affiliation">

      <input name="orcid" value="${user.orcid ?? ""}"
        class="w-full p-2 rounded border dark:bg-gray-700"
        placeholder="ORCID">

      <input name="bio" value="${user.bio ?? ""}"
        class="w-full p-2 rounded border dark:bg-gray-700"
        placeholder="Bio">

      <button type="submit"
        class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
        Save Changes
      </button>

      <small id="adminMsg" class="block text-sm mt-2"></small>

    </form>

    <div class="mt-4">
      ${deactivateHTML}
    </div>
  `;

  wireAdminEvents(user);
}

/* ---------------- EVENTS ---------------- */

function wireAdminEvents(user) {

  const form = document.getElementById("adminUserForm");
  const msg = document.getElementById("adminMsg");

  form.onsubmit = async (e) => {

    e.preventDefault();
    msg.textContent = "";

    const data = Object.fromEntries(new FormData(form).entries());

    try {

      await updateUserAdmin(user.id, data);

      msg.textContent = "User updated successfully";
      msg.className = "text-green-600";

    } catch (err) {

      msg.textContent = err.message || "Update failed";
      msg.className = "text-red-600";

    }
  };

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
