// form.js (fixed: uses CSS variables, no theme object coupling)

import { createButton } from "./button.js";

/**
 * Render a dynamic form inside a container with theme-reactive support.
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
  if (!content) return null;

  const existingForm = content.querySelector("form");
  if (existingForm) existingForm.remove();
  const existingError = content.querySelector("#formError");
  if (existingError) existingError.remove();

  // wrapper
  const article = document.createElement("article");
  article.className = "form-article";

  if (title) {
    const h2 = document.createElement("h2");
    h2.textContent = title;
    h2.className = "form-title";
    article.appendChild(h2);
  }

  const form = document.createElement("form");
  form.id = "dynamicForm";
  form.className = "form-root";

  fields.forEach(f => {
    const label = document.createElement("label");
    label.className = "form-label";

    const span = document.createElement("span");
    span.textContent = f.label;
    span.className = "form-label-text";
    label.appendChild(span);

    const input = f.type === "textarea"
      ? document.createElement("textarea")
      : document.createElement("input");

    if (f.type !== "textarea") input.type = f.type || "text";

    input.name = f.name;
    if (f.required) input.required = true;

    input.setAttribute("aria-describedby", "formError");
    input.setAttribute("aria-invalid", "false");
    input.className = "form-input";

    label.appendChild(input);
    form.appendChild(label);
  });

  const errorBox = document.createElement("small");
  errorBox.id = "formError";
  errorBox.className = "form-error";

  let submitBtn;
  if (useStyledSubmit && typeof createButton === "function") {
    submitBtn = createButton(submitText || "Submit", null, {
      variant: submitVariant,
      size: submitSize,
      extraClasses: submitExtraClasses
    });
    submitBtn.type = "submit";
  } else {
    submitBtn = document.createElement("button");
    submitBtn.type = "submit";
    submitBtn.textContent = submitText || "Submit";
    submitBtn.className = "form-submit";
  }

  form.appendChild(submitBtn);
  form.appendChild(errorBox);
  article.appendChild(form);
  content.appendChild(article);

  return { form, errorBox, submitBtn, article };
}

/* ---------- helpers ---------- */

export function resetFormErrors(form, errorBox) {
  if (errorBox) errorBox.textContent = "";

  [...form.elements].forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.setAttribute("aria-invalid", "false");
      el.classList.remove("form-invalid");
    }
  });
}

export function markInvalid(form) {
  [...form.elements].forEach(el => {
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.setAttribute("aria-invalid", "true");
      el.classList.add("form-invalid");
    }
  });
}

/* ---------- CSS injection ---------- */

(function injectFormStyles() {
  if (document.getElementById("form-theme-css")) return;

  const style = document.createElement("style");
  style.id = "form-theme-css";

  style.textContent = `
    .form-article {
      background: var(--background-color);
      color: var(--text-color-a);
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      width: 100%;
    }

    .form-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      color: var(--text-color-a);
    }

    .form-root {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-label {
      display: block;
    }

    .form-label-text {
      font-weight: 500;
      color: var(--text-color-a);
    }

    .form-input {
      margin-top: 0.25rem;
      width: 100%;
      border-radius: 0.375rem;
      border: 1px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      padding: 0.5rem;
      box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
      transition: border-color 0.2s, background 0.2s, color 0.2s;
    }

    .form-input:focus {
      border-color: var(--primary-color-a);
      outline: none;
    }

    .form-submit {
      width: 100%;
      padding: 0.5rem 1rem;
      border-radius: 0.375rem;
      font-weight: 600;
      background: var(--primary-color-a);
      color: white;
      border: 1px solid var(--primary-color-a);
      transition: background 0.2s;
      cursor: pointer;
    }

    .form-submit:hover {
      opacity: 0.8;
    }

    .form-error {
      margin-top: 0.5rem;
      color: #f87171;
      display: block;
    }

    .form-invalid {
      border-color: #f87171 !important;
    }
  `;

  document.head.appendChild(style);
})();
