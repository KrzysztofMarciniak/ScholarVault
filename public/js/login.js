// login.js
import { notifySuccess, notifyError } from "./notification.js";
import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { createContentContainer } from "./layout.js";

export function renderLoginForm(renderCallback) {
  // Create content container with header + icon
  const content = createContentContainer({
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 max-w-md",
    title: "Login",
    icon: "fa-solid fa-arrow-right-to-bracket"
  });

  // Render form inside container, using styled submit button
  const { form, errorBox } = renderForm({
    container: content,
    title: "", // header handled by container
    submitText: "Login",
    useStyledSubmit: true,
    submitVariant: "primary",
    submitSize: "md",
    submitExtraClasses: "w-full mt-4",
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "password", label: "Password", type: "password", required: true }
    ]
  });

  if (!form) return;

  form.onsubmit = async (e) => {
    e.preventDefault();
    resetFormErrors(form, errorBox);

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      errorBox.textContent = "Email and password are required";
      markInvalid(form);
      return;
    }

    try {
      const res = await axios.post("/api/v1/login", { email, password });
      const { token, user } = res.data;

      localStorage.setItem("api_token", token);
      localStorage.setItem("current_user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      notifySuccess("Logged in successfully");

      if (typeof renderCallback === "function") renderCallback();

    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      errorBox.textContent = msg;
      markInvalid(form);
      notifyError(msg);
    }
  };
}
