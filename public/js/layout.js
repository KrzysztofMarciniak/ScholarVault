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
    "w-full",
    "mx-auto",
    "max-w-6xl",
    "min-h-[200px]",
    "rounded-2xl",
    "shadow-lg",
    "flex",
    "flex-col",
    "gap-4",
    "transition",
    "duration-200",
    "bg-white",
    "dark:bg-slate-800",
    "text-slate-900",
    "dark:text-slate-100",
  ];

  if (padded) baseClasses.push("p-6");
  else baseClasses.push("p-0");

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
    header.className = "flex items-center gap-3 text-lg font-semibold select-none";

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
