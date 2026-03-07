// change_password.js
import { notifySuccess, notifyError } from "./notification.js";
import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { getToken } from "./get_token.js";
import { createContentContainer } from "./layout.js";

/**
 * PATCH /api/v1/users/self/password
 */
async function changePasswordApi({ current_password, new_password, password_confirmation }) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.patch(
    "/api/v1/users/self/password",
    { current_password, new_password, password_confirmation },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
}

/**
 * Render change password form using shared layout + styled submit
 * @param {Function} renderCallback optional callback executed after success
 */
export function renderChangePassword(renderCallback = () => {}) {
  const container = createContentContainer({
    title: "Change Password",
    icon: "fa-solid fa-key",
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 max-w-md"
  });

  const fields = [
    { label: "Current Password", name: "current_password", type: "password", required: true },
    { label: "New Password", name: "new_password", type: "password", required: true },
    { label: "Confirm New Password", name: "password_confirmation", type: "password", required: true }
  ];

  const { form, errorBox } = renderForm({
    container,
    title: "", // header handled by layout container
    fields,
    submitText: "Update Password",
    useStyledSubmit: true,
    submitVariant: "primary",
    submitSize: "md",
    submitExtraClasses: "w-full mt-4"
  });

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    resetFormErrors(form, errorBox);

    const current_password = (form.current_password?.value || "").trim();
    const new_password = (form.new_password?.value || "").trim();
    const password_confirmation = (form.password_confirmation?.value || "").trim();

    if (!current_password || !new_password || !password_confirmation) {
      errorBox.textContent = "All fields are required.";
      markInvalid(form);
      return;
    }

    if (new_password.length < 6) {
      errorBox.textContent = "New password must be at least 6 characters.";
      markInvalid(form);
      return;
    }

    if (new_password !== password_confirmation) {
      errorBox.textContent = "New password and confirmation do not match.";
      markInvalid(form);
      return;
    }

    try {
      await changePasswordApi({ current_password, new_password, password_confirmation });

      errorBox.className = "mt-4 text-green-600 dark:text-green-400";
      errorBox.textContent = "Password successfully updated.";
      notifySuccess("Password successfully updated.");

      form.reset();

      if (typeof renderCallback === "function") renderCallback();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Password update failed";
      errorBox.className = "mt-4 text-red-600 dark:text-red-400";
      errorBox.textContent = msg;
      markInvalid(form);
      notifyError(msg);
    }
  };
}
