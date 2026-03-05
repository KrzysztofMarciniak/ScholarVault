// user_store.js
export let currentUser = null;

export function getCurrentUser() {
  if (!currentUser) {
    const stored = localStorage.getItem("current_user");
    if (stored) {
      try { currentUser = JSON.parse(stored); } catch (e) { currentUser = null; }
    }
  }
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
  try { localStorage.setItem("current_user", JSON.stringify(user)); } catch (e) { /* ignore */ }
  updateUserMenu();
}

/**
 * Updates only the user info element inside the menu.
 * The menu must render an element with id="menuUserInfo" for this to work.
 */
export function updateUserMenu() {
  const el = document.getElementById("menuUserInfo");
  if (!el) return;
  const user = getCurrentUser();
  if (!user) {
    el.textContent = "";
    el.style.display = "none";
    return;
  }
  el.style.display = "";
  el.textContent = `${user.name} (${user.role || "User"})`;
}
