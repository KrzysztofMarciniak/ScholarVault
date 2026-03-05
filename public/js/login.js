import { notifySuccess, notifyError } from "./notification.js";
import { renderForm, resetFormErrors, markInvalid } from "./form.js";

export function renderLoginForm(render) {

    const { form, errorBox } = renderForm({
        title: "Login",
        submitText: "Login",
        fields: [
            { name: "email", label: "Email", type: "email", required: true },
            { name: "password", label: "Password", type: "password", required: true }
        ]
    });

    form.onsubmit = async (e) => {

        e.preventDefault();

        resetFormErrors(form, errorBox);

        const email = form.email.value;
        const password = form.password.value;

        try {

            const res = await axios.post("/api/v1/login", { email, password });

            const token = res.data.token;
            const user = res.data.user;

            localStorage.setItem("api_token", token);
            localStorage.setItem("current_user", JSON.stringify(user));

            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

            notifySuccess("Logged in successfully");

            if (typeof render === "function") render();

        } catch (err) {

            const msg =
                err.response?.data?.message ||
                err.message ||
                "Login failed";

            errorBox.textContent = msg;

            markInvalid(form);

            notifyError(msg);
        }
    };
}
