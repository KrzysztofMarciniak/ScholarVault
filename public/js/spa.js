// main.js (or app.js)
import { renderLoginForm } from './login.js';
import { renderRegisterForm } from './register.js';
import { logout } from './logout.js';
import { initThemeSwitcher } from './theme.js';
import { initUserMenu } from './user_menu.js';
import { renderSidebar } from './sidebar.js';

const app = document.getElementById("app");

initUserMenu();

function getAuth() {
    const token = localStorage.getItem("api_token");
    const user = JSON.parse(localStorage.getItem("current_user") || "null");
    return { token, user };
}

function ensureAxiosHeader(token) {
    if (typeof axios !== 'undefined') { // Safety check just in case
        if (token) {
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common["Authorization"];
        }
    }
}

function renderMenu(renderCallback) {
    const { token, user } = getAuth();
    ensureAxiosHeader(token);

    const menu = document.getElementById("menuList");
    if (!menu) return;

    menu.innerHTML = "";

    if (user) {
        const userLi = document.createElement("li");
        userLi.textContent = `${user.name} (${user.role || "User"})`;
        menu.appendChild(userLi);

        const logoutLi = document.createElement("li");
        const logoutBtn = document.createElement("button");
        logoutBtn.textContent = "Logout";
        logoutBtn.onclick = async () => {
            await logout(renderCallback);
        };

        logoutLi.appendChild(logoutBtn);
        menu.appendChild(logoutLi);
    } else {
        const loginLi = document.createElement("li");
        const loginBtn = document.createElement("button");
        loginBtn.textContent = "Login";
        loginBtn.onclick = () => renderLoginForm(renderCallback);
        loginLi.appendChild(loginBtn);

        const registerLi = document.createElement("li");
        const registerBtn = document.createElement("button");
        registerBtn.textContent = "Register";
        registerBtn.onclick = () => renderRegisterForm(renderCallback);
        registerLi.appendChild(registerBtn);

        menu.appendChild(loginLi);
        menu.appendChild(registerLi);
    }
}

export function render() {
    app.innerHTML = "";

    const content = document.createElement("div");
    content.id = "content";
    content.style.padding = "1rem";

    // Add margin to content if sidebar is fixed, so they don't overlap
    const { user } = getAuth();
    if (user) {
        content.classList.add("ml-56"); // Assuming Tailwind: leaves room for your 56-width sidebar
    }

    app.appendChild(content);

    renderMenu(render);

    // <-- RENDER THE SIDEBAR HERE! -->
    // You can pass your specific view-rendering functions in the callbacks object
    renderSidebar({
        adminDashboard: () => console.log("Rendering Admin Dashboard..."),
        adminUsers: () => console.log("Rendering Admin Users..."),
        adminArticles: () => console.log("Rendering Admin Articles..."),
        myArticles: () => console.log("Rendering Author Articles..."),
        submitArticle: () => console.log("Rendering Submit Article..."),
        assignedReviews: () => console.log("Rendering Assigned Reviews..."),
        reviewHistory: () => console.log("Rendering Review History...")
    });
}

window.render = render;

render();
initThemeSwitcher();
