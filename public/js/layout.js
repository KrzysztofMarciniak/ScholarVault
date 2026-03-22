/**
 * Creates or retrieves a content container within a given app root,
 * styled with Tailwind and (optionally) a Font Awesome header.
 *
 * @param {Object} options
 * @param {string} [options.appSelector="#app"]
 * @param {string} [options.id="content"]
 * @param {boolean} [options.clearApp=true]
 * @param {boolean} [options.padded=true]
 * @param {string} [options.margin="0"]
 * @param {string} [options.border="none"]
 * @param {string} [options.extraClasses=""]
 * @param {string|null} [options.title=null] - header text
 * @param {string|null} [options.icon=null] - Font Awesome class(s), e.g. "fa-solid fa-tachometer-alt"
 * @returns {HTMLElement}
 */

let __contentStylesInjected = false;

function ensureContentStyles() {
  if (__contentStylesInjected) return;

  const style = document.createElement("style");
  style.id = "content-container-theme";

  style.textContent = `
    .content-container {
      width: 100%;
      max-width: 72rem;
      min-height: 200px;

      margin-left: auto;
      margin-right: auto;

      display: flex;
      flex-direction: column;
      gap: 1rem;

      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15);


     background-color: var(--background-color);
     color: var(--text-color-a);

      transition: background-color 0.2s, color 0.2s;
    }

    .content-container.padded {
      padding: 1.5rem;
    }

    .content-container.no-padding {
      padding: 0;
    }

    .content-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      font-size: 1.125rem;
      font-weight: 600;

      user-select: none;
      color: var(--text-color-a);
    }

    .content-header i {
      color: var(--primary-color-a);
      font-size: 1.1rem;
    }
  `;

  document.head.appendChild(style);
  __contentStylesInjected = true;
}

export function createContentContainer({
  appSelector = "#app",
  id = "content",
  clearApp = true,
  padded = true,
  margin = "0",
  border = "none",
  extraClasses = "",
  title = null,
  icon = null,
} = {}) {
  ensureContentStyles();

  const app = document.querySelector(appSelector);
  if (!app) throw new Error(`App container not found for selector: ${appSelector}`);

  if (clearApp) app.innerHTML = "";

  let content = document.getElementById(id);
  const wasExisting = Boolean(content);

  if (!content) {
    content = document.createElement("section");
    content.id = id;
    content.setAttribute("role", "region");
    content.setAttribute("aria-label", id);
  }

  const baseClasses = [
    "content-container",
  ];

  if (padded) baseClasses.push("padded");
  else baseClasses.push("no-padding");

  const all = new Set([...baseClasses, ...extraClasses.split(/\s+/).filter(Boolean)]);
  content.className = Array.from(all).join(" ");

  Object.assign(content.style, {
    margin,
    border,
    flex: "1",
  });

  const existingHeader = content.querySelector("[data-content-header]");
  if (title || icon) {
    const header = existingHeader || document.createElement("header");
    header.setAttribute("data-content-header", "");
    header.setAttribute("role", "banner");
    header.className = "content-header";

    if (icon) {
      let iconEl = header.querySelector("i[data-fa-icon]");
      if (!iconEl) {
        iconEl = document.createElement("i");
        iconEl.setAttribute("data-fa-icon", "");
        iconEl.setAttribute("aria-hidden", "true");
        iconEl.className = "";
        header.prepend(iconEl);
      }
      iconEl.className = icon;
    } else {
      const ic = header.querySelector("i[data-fa-icon]");
      if (ic) ic.remove();
    }

    let titleEl = header.querySelector("span[data-content-title]");
    if (!titleEl) {
      titleEl = document.createElement("span");
      titleEl.setAttribute("data-content-title", "");
      header.appendChild(titleEl);
    }
    titleEl.textContent = title || "";

    if (!existingHeader) content.prepend(header);
  } else if (existingHeader) {
    existingHeader.remove();
  }

  if (content.parentElement !== app) {
    if (content.parentElement) content.remove();
    app.appendChild(content);
  } else if (!wasExisting) {
  }

  return content;
}
