import { notifySuccess, notifyError } from "./notification.js";
import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { createContentContainer } from "./layout.js";
import { createButton } from "./button.js";

export function renderRegisterForm(renderCallback) {

  const content = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 max-w-md",
    title: "Register",
    icon: "fa-solid fa-user-plus"
  });

  const { form, errorBox } = renderForm({
    container: content,
    title: "", // container already has header
    submitText: "",
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true },
      { name: "affiliation", label: "Affiliation", type: "text", required: false },
      { name: "orcid", label: "ORCID", type: "text", required: false },
      { name: "bio", label: "Biography", type: "textarea", required: false }
    ]
  });

  if (!form) return;

  // remove default submit button if present
  const defaultBtn = form.querySelector("button[type=submit]");
  if (defaultBtn) defaultBtn.remove();

  const submitBtn = createButton(
    "Create Account",
    () => form.dispatchEvent(new Event("submit", { cancelable: true })),
    {
      variant: "success",
      size: "md",
      extraClasses: "w-full mt-4"
    }
  );

  form.appendChild(submitBtn);

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

      const res = await axios.post("/api/v1/register", payload);

      const { token, user } = res.data;

      localStorage.setItem("api_token", token);
      localStorage.setItem("current_user", JSON.stringify(user));

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      notifySuccess("Account created successfully");

      if (typeof renderCallback === "function") renderCallback();

    } catch (err) {

      const data = err.response?.data || {};
      const message = data.message || err.message || "Registration failed";

      notifyError(message);

      if (data.errors) {

        const lines = [];

        for (const field in data.errors) {
          data.errors[field].forEach(msg => lines.push(msg));
        }

        errorBox.innerHTML = lines.join("<br>");

      } else {
        errorBox.textContent = message;
      }

      markInvalid(form);
    }
  };
}
