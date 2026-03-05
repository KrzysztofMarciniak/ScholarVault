export function initUserMenu() {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const toggle = document.createElement("button");
    toggle.id = "userToggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "User menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = `<i class="fa-solid fa-user" aria-hidden="true"></i>`;
    toggle.className = [
        "fixed", "top-4", "right-4", "z-50",
        "p-2", "text-2xl", "rounded-full",
        "bg-white", "dark:bg-gray-800", "shadow",
        "focus:outline-none", "focus:ring", "focus:ring-offset-2"
    ].join(" ");
    const menu = document.createElement("ul");
    menu.id = "menuList";
    menu.className = "fixed top-12 right-4 shadow-lg rounded-md w-48 hidden flex-col space-y-2 p-4 z-40 bg-white dark:bg-gray-800";
    nav.prepend(toggle);
    nav.appendChild(menu);
    const showMenu = (visible) => {
        if (visible) {
            menu.classList.remove("hidden");
            menu.classList.add("flex");
            toggle.setAttribute("aria-expanded", "true");
        } else {
            menu.classList.add("hidden");
            menu.classList.remove("flex");
            toggle.setAttribute("aria-expanded", "false");
        }
    };
    toggle.addEventListener("click", (evt) => {
        evt.stopPropagation(); 
        const isOpen = toggle.getAttribute("aria-expanded") === "true";
        showMenu(!isOpen);
    });
    const onDocClick = (e) => {
        const target = e.target;
        if (!menu.contains(target) && !toggle.contains(target)) {
            showMenu(false);
        }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") showMenu(false);
    });
}
