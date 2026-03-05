// register.js
import { notifySuccess, notifyError } from "./notification.js";
import { renderForm, resetFormErrors, markInvalid } from "./form.js";

export function renderRegisterForm(render) {

    // define the fields
    const { form, errorBox } = renderForm({
        title: "Register",
        submitText: "Register",
        fields: [
            { name: "name", label: "Name", type: "text", required: false },
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true }
        ]
    });

    if (!form) return; // safety check

    form.onsubmit = async (e) => {
        e.preventDefault();

        resetFormErrors(form, errorBox);

        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;

        try {

            const res = await axios.post("/api/v1/register", { name, email, password });

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
