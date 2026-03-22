// theme_switch.js

export const themes = {
  light: {
    primaryColorA: "#5576aa",
    primaryColorB: "#0f766e",
    backgroundColor: "#f0fdfa",
    textColorA: "#0f172a",
    textColorB: "#cfe8e6"
  },

  dark: {
    primaryColorA: "#1e293b",
    primaryColorB: "#2dd4bf",
    backgroundColor: "#0f172a",
    textColorA: "#a9a9a9",
    textColorB: "#e0f7fa"
  },

  leaf: {
    primaryColorA: "#166534",
    primaryColorB: "#10b981",
    backgroundColor: "#f0fdf4",
    textColorA: "#111827",
    textColorB: "#dcfce7"
  },

  heart: {
    primaryColorA: "#991b1b",
    primaryColorB: "#dc2626",
    backgroundColor: "#fff1f2",
    textColorA: "#111827",
    textColorB: "#ffe4e6"
  },

  "white office": {
    primaryColorA: "#2563eb",
    primaryColorB: "#1e40af",
    backgroundColor: "#ffffff",
    textColorA: "#1f2937",
    textColorB: "#e5e7eb"
  },

  "dark office": {
    primaryColorA: "#3b82f6",
    primaryColorB: "#60a5fa",
    backgroundColor: "#1f2937",
    textColorA: "#f3f4f6",
    textColorB: "#374151"
  }
};

const themeIcons = {
  light: "fa-solid fa-sun",
  dark: "fa-solid fa-moon",
  leaf: "fa-solid fa-leaf",
  heart: "fa-solid fa-heart",
  "white office": "fa-solid fa-building",
  "dark office": "fa-solid fa-building"
};

export function getCurrentTheme() {
  return localStorage.getItem("theme") || "light";
}

export function applyTheme(themeName) {
  const t = themes[themeName] || themes.light;
  const root = document.documentElement;

  for (const [key, value] of Object.entries(t)) {
    const cssVar = `--${key.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`;
    root.style.setProperty(cssVar, value);
  }

  root.style.backgroundColor = t.backgroundColor;
  root.style.color = t.textColorA;

  localStorage.setItem("theme", themeName);
}

export function initThemeSwitcher() {
  const current = getCurrentTheme();
  applyTheme(current);

  document.getElementById("themeToggle")?.remove();
  document.getElementById("themeMenu")?.remove();

  const btn = document.createElement("button");
  btn.id = "themeToggle";
  btn.type = "button";

  Object.assign(btn.style, {
    position: "fixed",
    bottom: "1rem",
    right: "1rem",
    zIndex: "50",
    padding: "0.75rem",
    borderRadius: "9999px",
    border: "2px solid var(--primary-color-a)",
    background: "var(--primary-color-a)",
    color: "white",
    cursor: "pointer"
  });

  btn.innerHTML = `<i class="fa-solid fa-palette"></i>`;

  const menu = document.createElement("div");
  menu.id = "themeMenu";

  Object.assign(menu.style, {
    position: "fixed",
    bottom: "4rem",
    right: "1rem",
    zIndex: "50",
    background: "var(--background-color)",
    color: "var(--text-color-a)",
    border: "2px solid var(--primary-color-a)",
    borderRadius: "0.75rem",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
    display: "none",
    flexDirection: "row",
    gap: "0.5rem",
    padding: "0.5rem",
    minWidth: "auto",
    flexWrap: "wrap",
    maxWidth: "200px",
    justifyContent: "center"
  });

  Object.keys(themes).forEach(name => {
    const item = document.createElement("button");
    item.type = "button";
    item.title = name;
    item.setAttribute("aria-label", `Switch to ${name} theme`);

    Object.assign(item.style, {
      width: "2.25rem",
      height: "2.25rem",
      borderRadius: "9999px",
      border: "1px solid var(--primary-color-a)",
      background: "transparent",
      cursor: "pointer",
      display: "grid",
      placeItems: "center",
      color: "var(--text-color-a)"
    });

    item.innerHTML = `<i class="${themeIcons[name] || "fa-solid fa-circle"}"></i>`;

    item.onmouseenter = () => {
      item.style.background = "var(--primary-color-a)";
      item.style.color = "white";
    };
    item.onmouseleave = () => {
      item.style.background = "transparent";
      item.style.color = "var(--text-color-a)";
    };

    item.onclick = () => {
      applyTheme(name);
    };

    menu.appendChild(item);
  });

  btn.onclick = () => {
    menu.style.display = menu.style.display === "none" ? "flex" : "none";
  };

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) {
      menu.style.display = "none";
    }
  });

  document.body.appendChild(btn);
  document.body.appendChild(menu);
}
