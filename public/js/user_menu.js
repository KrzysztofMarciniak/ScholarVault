export function initUserMenu() {

    const nav = document.querySelector("nav");
    if (!nav) return;

    const toggle = document.createElement("button");

    toggle.id = "userToggle";
    toggle.type = "button";

    toggle.setAttribute("aria-label","User menu");
    toggle.setAttribute("aria-expanded","false");

    toggle.className = [
        "fixed","top-4","right-4","z-50",
        "p-2","text-2xl",
        "rounded-full",
        "bg-white","dark:bg-gray-800",
        "shadow",
        "hover:bg-gray-100","dark:hover:bg-gray-700"
    ].join(" ");

    toggle.innerHTML = `<i class="fa-solid fa-user"></i>`;

    const menu = document.createElement("ul");

    menu.id = "menuList";

    menu.className = [
        "fixed",
        "top-12",
        "right-4",
        "w-48",
        "shadow-lg",
        "rounded-md",
        "hidden",
        "flex-col",
        "space-y-2",
        "p-4",
        "z-40",
        "bg-white",
        "dark:bg-gray-800"
    ].join(" ");

    nav.prepend(toggle);
    nav.appendChild(menu);

    function showMenu(visible) {

        if (visible) {

            menu.classList.remove("hidden");
            menu.classList.add("flex");

            toggle.setAttribute("aria-expanded","true");

        } else {

            menu.classList.add("hidden");
            menu.classList.remove("flex");

            toggle.setAttribute("aria-expanded","false");

        }

    }

    toggle.addEventListener("click", (e) => {

        e.stopPropagation();

        const open = toggle.getAttribute("aria-expanded") === "true";

        showMenu(!open);

    });

    document.addEventListener("click", (e) => {

        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            showMenu(false);
        }

    });

    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") showMenu(false);

    });

}
