export function initHamburger() {

    const nav = document.querySelector("nav");
    if (!nav) return;

    const toggle = document.createElement("button");
    toggle.id = "menuToggle";
    toggle.setAttribute("aria-label", "Menu");
    toggle.textContent = "☰";

    const menu = document.createElement("ul");
    menu.id = "menuList";
    menu.style.display = "none";

    nav.prepend(toggle);
    nav.appendChild(menu);

    toggle.addEventListener("click", () => {
        menu.style.display =
            menu.style.display === "none" ? "block" : "none";
    });
}
