// form.js
import { createButton } from "./button.js"; // ensure this file exists

/**
 * Render a dynamic form inside a container.
 *
 * @param {Object} options
 * @param {HTMLElement} options.container - container element to render into (required)
 * @param {string} [options.title] - optional inner title (ignored when container has header)
 * @param {Array} options.fields - array of fields {name, label, type, required}
 * @param {string} [options.submitText="Submit"]
 * @param {boolean} [options.useStyledSubmit=false] - use createButton() styling
 * @param {string} [options.submitVariant="primary"] - styled button variant
 * @param {string} [options.submitSize="md"] - styled button size
 * @param {string} [options.submitExtraClasses=""] - extra classes for styled button
 * @returns {{form: HTMLFormElement, errorBox: HTMLElement, submitBtn: HTMLButtonElement}}
 */
export function renderForm({
  container,
  title,
  fields = [],
  submitText = "Submit",
  useStyledSubmit = false,
  submitVariant = "primary",
  submitSize = "md",
  submitExtraClasses = ""
} = {}) {
  const content = container || document.getElementById("content");
  if (!content) {
    console.error("No container found for form");
    return null;
  }

  // Remove previous form and its error box inside this container
  const existingForm = content.querySelector("form");
  if (existingForm) existingForm.remove();
  const existingError = content.querySelector("#formError");
  if (existingError) existingError.remove();

  // Article wrapper
  const article = document.createElement("article");
  article.className = "p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md w-full";

  // Optional title (skip if container already has header)
  if (title) {
    const h2 = document.createElement("h2");
    h2.className = "text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100";
    h2.textContent = title;
    article.appendChild(h2);
  }

  // Form element
  const form = document.createElement("form");
  form.id = "dynamicForm";
  form.className = "space-y-4";

  // Fields
  fields.forEach(f => {
    const label = document.createElement("label");
    label.className = "block mb-4";

    const span = document.createElement("span");
    span.className = "text-gray-700 dark:text-gray-200 font-medium";
    span.textContent = f.label;
    label.appendChild(span);

    let input;
    if (f.type === "textarea") {
      input = document.createElement("textarea");
    } else {
      input = document.createElement("input");
      input.type = f.type || "text"; // ensures password -> type="password"
    }

    input.name = f.name;
    if (f.required) input.required = true;
    input.setAttribute("aria-describedby", "formError");
    input.setAttribute("aria-invalid", "false");
    input.className =
      "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50";

    label.appendChild(input);
    form.appendChild(label);
  });

  // Error box (returned separately)
  const errorBox = document.createElement("small");
  errorBox.id = "formError";
  errorBox.className = "text-red-600 dark:text-red-400 block mt-2";

  // Submit button (styled or native)
  let submitBtn = null;

  if (useStyledSubmit && typeof createButton === "function") {
    // Create styled button via createButton, then set it to type="submit"
    submitBtn = createButton(submitText || "Submit", null, {
      variant: submitVariant,
      size: submitSize,
      extraClasses: submitExtraClasses
    });
    // Ensure it behaves like a native submit (Enter key submits)
    submitBtn.type = "submit";
    // Add small margin-top by default so it looks separated
    submitBtn.classList.add("mt-4");
  } else {
    submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.className =
      "w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50";
    submitBtn.textContent = submitText || "Submit";
  }

  // Append elements
  form.appendChild(submitBtn);
  form.appendChild(errorBox);
  article.appendChild(form);
  content.appendChild(article);

  return { form, errorBox, submitBtn };
}

export function resetFormErrors(form, errorBox) {
  if (errorBox) errorBox.textContent = "";
  [...form.elements].forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.setAttribute("aria-invalid", "false");
      el.classList.remove("border-red-500");
    }
  });
}

export function markInvalid(form) {
  [...form.elements].forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.setAttribute("aria-invalid", "true");
      el.classList.add("border-red-500");
    }
  });
}
