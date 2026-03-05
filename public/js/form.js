export function renderForm({ title, fields, submitText }) {
    const content = document.getElementById("content");
    if (!content) {
        console.error("No #content element — call render() first");
        return null;
    }

    const fieldHTML = fields.map(f => `
        <label class="block mb-4">
            <span class="text-gray-700 dark:text-gray-200 font-medium">${f.label}</span>
            <input
                type="${f.type || "text"}"
                name="${f.name}"
                ${f.required ? "required" : ""}
                aria-describedby="formError"
                aria-invalid="false"
                class="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            >
        </label>
    `).join("");

    content.innerHTML = `
        <article class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md max-w-lg mx-auto mt-8">
            <h2 class="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">${title}</h2>

            <form id="dynamicForm" class="space-y-4">

                ${fieldHTML}

                <button type="submit"
                    class="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                >
                    ${submitText}
                </button>

                <small id="formError" class="text-red-600 dark:text-red-400 block mt-2"></small>

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
            el.classList.remove("border-red-500");
        }
    });
}

export function markInvalid(form) {
    [...form.elements].forEach(el => {
        if (el.tagName === "INPUT") {
            el.setAttribute("aria-invalid", "true");
            el.classList.add("border-red-500");
        }
    });
}
