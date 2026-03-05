export function renderForm({ title, fields, submitText }) {

    const content = document.getElementById("content");
    if (!content) {
        console.error("No #content element — call render() first");
        return null;
    }

    const fieldHTML = fields.map(f => `
        <label>
            ${f.label}
            <input
                type="${f.type || "text"}"
                name="${f.name}"
                ${f.required ? "required" : ""}
                aria-describedby="formError"
                aria-invalid="false"
            >
        </label>
    `).join("");

    content.innerHTML = `
        <article>
            <h2>${title}</h2>

            <form id="dynamicForm">

                ${fieldHTML}

                <button type="submit">${submitText}</button>

                <small id="formError"></small>

            </form>
        </article>
    `;

    const form = document.getElementById("dynamicForm");
    const errorBox = document.getElementById("formError");

    return { form, errorBox };
}

export function resetFormErrors(form, errorBox) {

    errorBox.textContent = "";

    [...form.elements].forEach(el => {
        if (el.tagName === "INPUT") {
            el.setAttribute("aria-invalid", "false");
        }
    });
}

export function markInvalid(form) {

    [...form.elements].forEach(el => {
        if (el.tagName === "INPUT") {
            el.setAttribute("aria-invalid", "true");
        }
    });
}
