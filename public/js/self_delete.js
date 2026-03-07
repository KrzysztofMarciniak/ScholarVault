// delete_self.js
import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { getToken } from './get_token.js';
import { createContentContainer } from './layout.js';

/**
 * DELETE /api/v1/users/self
 */
async function deleteSelf() {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/v1/users/self", {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const msg = errJson.message || res.statusText;
    throw new Error(msg);
  }

  return await res.json();
}

/**
 * Render deactivate account form using layout container
 * @param {Function} onSuccess callback after successful deletion
 */
export function renderDeleteSelf(onSuccess = () => {}) {

  const container = createContentContainer({
    title: "Deactivate Account",
    icon: "fa-solid fa-user-slash",
    padded: true,
    margin: "2rem auto",
    border: "1px solid #f87171", // red border
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 max-w-md"
  });

  const fields = [
    { label: "Type DELETE to confirm", name: "confirm", type: "text", required: true }
  ];

  const { form, errorBox } = renderForm({
    container,
    title: "", // header handled by layout container
    fields,
    submitText: "Deactivate Account"
  });

  if (!form) return;

  // Warning text
  const warning = document.createElement("div");
  warning.className = `
    mb-5 p-4 rounded-lg
    bg-red-50 dark:bg-red-950
    border border-red-200 dark:border-red-800
    text-sm text-red-700 dark:text-red-300
    flex gap-3
  `;
  warning.innerHTML = `
    <i class="fa-solid fa-triangle-exclamation mt-1"></i>
    <div>
      <p class="font-medium">Danger Zone</p>
      <p>This action will deactivate your account and revoke all active API tokens.</p>
      <p class="mt-1 text-xs opacity-80">Recovery requires administrator assistance.</p>
    </div>
  `;
  form.prepend(warning);

  // Style submit button
  const submitBtn = form.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.className = `
      w-full mt-4 px-4 py-2
      rounded-lg
      bg-red-600 hover:bg-red-700
      text-white font-medium
      flex items-center justify-center gap-2
      transition
    `;
    submitBtn.innerHTML = `<i class="fa-solid fa-user-slash"></i> Deactivate Account`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    resetFormErrors(form, errorBox);

    const confirmValue = form.confirm.value.trim();
    if (confirmValue !== "DELETE") {
      errorBox.textContent = "You must type DELETE to confirm.";
      markInvalid(form);
      return;
    }

    try {
      await deleteSelf();
      localStorage.removeItem("api_token");
      localStorage.removeItem("current_user");

      errorBox.className = "mt-4 text-green-600 dark:text-green-400";
      errorBox.innerHTML = `<i class="fa-solid fa-circle-check mr-1"></i> Account successfully deactivated.`;

      onSuccess();
    } catch (err) {
      errorBox.className = "mt-4 text-red-600 dark:text-red-400";
      errorBox.innerHTML = `<i class="fa-solid fa-circle-exclamation mr-1"></i> Error: ${err.message}`;
      markInvalid(form);
    }
  });
}
