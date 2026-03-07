import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { notifySuccess, notifyError } from "./notification.js";
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

/**
 * POST /api/v1/users (admin only)
 */
async function createUserApi(data) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.post("/api/v1/users", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data; // returns { status: 'success', user: {...} }
}

/**
 * Render admin user creation form
 * @param {Function} onSuccess callback executed after user creation
 */
export function renderAdminCreateUser(onSuccess = () => {}) {
  const container = createContentContainer({
    title: "Create User (Admin)",
    icon: "fa-solid fa-user-plus",
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 max-w-md"
  });

  const fields = [
    { name: "name", label: "Name", type: "text", required: false },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "password", label: "Password", type: "password", required: true },
    { name: "role_id", label: "Role ID", type: "number", required: true },
    { name: "affiliation", label: "Affiliation", type: "text", required: false },
    { name: "orcid", label: "ORCID", type: "text", required: false },
    { name: "bio", label: "Bio", type: "textarea", required: false }
  ];

  const { form, errorBox } = renderForm({
    container,
    title: "",
    fields,
    submitText: "Create User",
    useStyledSubmit: true,
    submitVariant: "success",
    submitSize: "md",
    submitExtraClasses: "w-full mt-4"
  });

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    resetFormErrors(form, errorBox);

    const payload = {};
    for (const field of form.elements) {
      if (!field.name) continue;
      const value = field.value.trim();
      if (value !== "") payload[field.name] = value;
    }

    try {
      const res = await createUserApi(payload);

      // Fix: API returns res.user, not res.data
      const user = res.user;

      errorBox.className = "mt-4 text-green-600 dark:text-green-400";
      errorBox.textContent = `User "${user.name}" created successfully.`;
      notifySuccess(`User "${user.name}" created successfully.`);

      form.reset();
      onSuccess(user); // pass the created user
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Failed to create user";
      errorBox.className = "mt-4 text-red-600 dark:text-red-400";
      errorBox.textContent = message;
      markInvalid(form);
      notifyError(message);
    }
  };
}
