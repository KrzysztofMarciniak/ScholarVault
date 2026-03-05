import { notifySuccess, notifyError } from "./notification.js";
import { renderForm, resetFormErrors, markInvalid } from "./form.js";

export function renderRegisterForm(render) {

    const { form, errorBox } = renderForm({
        title: "Register",
        submitText: "Register",
        fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true },
            { name: "affiliation", label: "Affiliation", type: "text", required: false },
            { name: "orcid", label: "ORCID", type: "text", required: false },
            { name: "bio", label: "Biography", type: "textarea", required: false },
        ]
    });

    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();

        resetFormErrors(form, errorBox);

       const payload = {};

for (const field of form.elements) {
    if (!field.name) continue;

    const value = field.value.trim();

    if (value === "") continue;

    payload[field.name] = value;
}

        try {
            const res = await axios.post("/api/v1/register", payload);

            const token = res.data.token;
            const user = res.data.user;

            localStorage.setItem("api_token", token);
            localStorage.setItem("current_user", JSON.stringify(user));
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            notifySuccess("Account created successfully");

            if (typeof render === "function") render();

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
