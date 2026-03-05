export function initHamburger() {
    const nav = document.querySelector("nav");
    if (!nav) return;

    // Create toggle button
    const toggle = document.createElement("button");
    toggle.id = "menuToggle";
    toggle.setAttribute("aria-label", "Menu");
    toggle.textContent = "☰";
    toggle.className = "fixed top-4 right-4 z-50 p-2 text-2xl rounded-md focus:outline-none";

    // Create menu list
    const menu = document.createElement("ul");
    menu.id = "menuList";
    menu.className = "fixed top-12 right-4 shadow-lg rounded-md w-48 hidden flex-col space-y-2 p-4 z-40";

    // Insert into nav
    nav.prepend(toggle);
    nav.appendChild(menu);

    // Toggle menu visibility
    toggle.addEventListener("click", () => {
        menu.classList.toggle("hidden");
        menu.classList.toggle("flex");
    });
}
