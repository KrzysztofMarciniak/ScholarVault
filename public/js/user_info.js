import { renderForm, resetFormErrors, markInvalid } from './form.js';
import { updateUserAdmin } from './admin_update_user.js';
import { deleteUserAdmin } from "./admin_delete_user.js";

const app = document.getElementById("app");

async function apiGet(path) {
  const token = localStorage.getItem("api_token");
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(path, {
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    let errJson = {};
    try { errJson = await res.json(); } catch {}
    const msg = errJson?.message || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Fetch a single user by ID
 * @param {number|string} id
 * @returns {Promise<object>}
 */
export async function fetchUser(id) {
  return await apiGet(`/api/v1/users/show/${id}`);
}

/**
 * Fetch current authenticated user (no local context)
 * @returns {Promise<object>}
 */
export async function fetchCurrentUser() {
  return await apiGet(`/api/v1/users/me`);
}

/**
 * Render user details and (if admin) admin update form
 * @param {object} user
 */
export function renderUserInfo(user) {
    const deactivatedText = user.deactivated ? "yes" : "no";

    app.innerHTML = `
        <div class="max-w-3xl mx-auto px-4 py-6">

            <h1 class="text-2xl font-semibold mb-4">${user.name || "Unnamed User"}</h1>

            <ul class="space-y-2 text-gray-700 dark:text-gray-300 mb-6">
                <li><strong>ID:</strong> ${user.id}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Role:</strong> ${user.role || "N/A"}</li>
                <li><strong>Affiliation:</strong> ${user.affiliation || "-"}</li>
                <li><strong>ORCID:</strong> ${
                    user.orcid
                        ? `<a href="https://orcid.org/${user.orcid}" target="_blank" class="text-green-600 hover:text-green-700">${user.orcid}</a>`
                        : "-"
                }</li>
                <li><strong>Bio:</strong> ${user.bio || "-"}</li>
                <li><strong>Deactivated:</strong> ${deactivatedText}</li>
            </ul>

            <!-- REQUIRED BY form.js -->
            <div id="content"></div>

        </div>
    `;
}

/**
 * Show user panel by id. If current user is admin, mount admin update form.
 * @param {number|string} id
 */
export async function showUser(id) {
  try {
    const user = await fetchUser(id);
    renderUserInfo(user);

    // fetch current authenticated user (no local context)
    let current;
    try {
      current = await fetchCurrentUser();
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      current = null;
    }

    // if admin, render admin update form + conditional deactivate button
    if (current && current.role === "Administrator") {
      const adminContainerId = "adminControls";
      // ensure admin container exists (placed after rendered info)
      const adminAreaHTML = `<div id="${adminContainerId}" class="max-w-3xl mx-auto px-4 pb-10"></div>`;
      document.getElementById("content").insertAdjacentHTML("afterend", adminAreaHTML);
      const adminArea = document.getElementById(adminContainerId);

      // Build admin form HTML and deactivate button (only if not deactivated)
      const deactivateBtnHTML = user.deactivated
        ? `<div class="mb-3 text-sm text-gray-600 dark:text-gray-400">User already deactivated.</div>`
        : `<button id="deactivateBtn" class="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">Deactivate User</button>`;

      adminArea.innerHTML = `
        <h2 class="text-xl font-semibold mb-4">Admin: Update User #${user.id}</h2>

        <form id="adminUserForm" class="space-y-4 p-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div>
            <label class="block text-sm font-medium mb-1">Name</label>
            <input name="name" type="text" value="${user.name ?? ""}" class="w-full p-2 rounded border dark:bg-gray-700">
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input name="email" type="email" value="${user.email ?? ""}" required class="w-full p-2 rounded border dark:bg-gray-700">
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Role ID</label>
            <input name="role_id" type="number" value="${user.role_id ?? ""}" required class="w-full p-2 rounded border dark:bg-gray-700">
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Affiliation</label>
            <input name="affiliation" type="text" value="${user.affiliation ?? ""}" class="w-full p-2 rounded border dark:bg-gray-700">
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">ORCID</label>
            <input name="orcid" type="text" value="${user.orcid ?? ""}" class="w-full p-2 rounded border dark:bg-gray-700">
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Bio</label>
            <input name="bio" type="text" value="${user.bio ?? ""}" class="w-full p-2 rounded border dark:bg-gray-700">
          </div>

          <button type="submit" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Save Changes</button>

          <small id="adminFormMsg" class="block text-sm text-red-600 mt-2"></small>
        </form>

        <div class="mt-4">
          ${deactivateBtnHTML}
        </div>
      `;

      // wire form submit
      const form = document.getElementById("adminUserForm");
      const msg = document.getElementById("adminFormMsg");
      form.onsubmit = async (e) => {
        e.preventDefault();
        msg.textContent = "";

        const formData = Object.fromEntries(new FormData(form).entries());
        try {
          await updateUserAdmin(user.id, formData);
          msg.textContent = "User updated successfully";
          msg.classList.remove("text-red-600");
          msg.classList.add("text-green-600");

          // refresh displayed user and admin area
          const refreshed = await fetchUser(user.id);
          renderUserInfo(refreshed);
          await showUser(user.id);
        } catch (err) {
          msg.textContent = err.message || "Update failed";
          msg.classList.remove("text-green-600");
          msg.classList.add("text-red-600");
          console.error(err);
        }
      };

      // wire deactivate button if present
      const deactivateBtn = document.getElementById("deactivateBtn");
      if (deactivateBtn) {
        deactivateBtn.onclick = async () => {
          if (!confirm("Deactivate this user? This revokes all tokens and cannot be undone without admin help.")) return;
          try {
            const res = await deleteUserAdmin(user.id);
            // show simple alert and refresh
            alert(res?.message || "User deactivated");
            const refreshed = await fetchUser(user.id);
            renderUserInfo(refreshed);
            // re-render admin area (will show "already deactivated")
            await showUser(user.id);
          } catch (err) {
            alert(err.message || "Failed to deactivate user");
            console.error(err);
          }
        };
      }
    }

  } catch (err) {
    app.innerHTML = `
      <div class="flex items-center justify-center py-10 text-red-600 dark:text-red-400">
        <i class="fa-solid fa-triangle-exclamation mr-2"></i>
        Failed to load user: ${err.message}
      </div>
    `;
    console.error(err);
  }
}
