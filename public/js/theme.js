// theme.js
export function initThemeSwitcher() {
    const themeLinks = document.querySelectorAll("[data-theme-switcher]");

    themeLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const theme = link.getAttribute("data-theme-switcher");
            const html = document.documentElement;

            if (theme === "auto") {
                html.removeAttribute("data-theme");
                localStorage.removeItem("theme");
            } else {
                html.setAttribute("data-theme", theme);
                localStorage.setItem("theme", theme);
            }
        });
    });

    // apply saved theme on load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }
}
