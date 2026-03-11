// notifications_modal.js
import { getToken } from "./get_token.js";

/**
 * Notifications modal overlay (top-center bell -> full-screen overlay).
 * Usage: import and call initNotificationsModal() once on startup.
 */

export function initNotificationsModal() {
  // avoid double init
  if (document.getElementById("notifModalRoot")) return;

  // --- root elements ---
  const root = document.createElement("div");
  root.id = "notifModalRoot";
  document.body.appendChild(root);

  // bell icon (top-center)
  const bellBtn = document.createElement("button");
  bellBtn.id = "notifBell";
  bellBtn.type = "button";
  bellBtn.setAttribute("aria-label", "Open notifications");
bellBtn.className = [
  "fixed",
  "top-20",               // vertically center
  "right-4",                // stick to right with spacing
  "-translate-y-1/4",      // move slightly up/down (adjust as needed)
  "z-50",
  "p-3",
  "rounded-full",
  "bg-white dark:bg-slate-800",
  "shadow-lg",
  "text-2xl",
  "flex items-center justify-center",
  "focus:outline-none focus:ring"
].join(" ");
  bellBtn.innerHTML = `
    <i class="fa-solid fa-bell" aria-hidden="true"></i>
    <span id="notifBellBadge" class="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full px-1 hidden"></span>
  `;
  root.appendChild(bellBtn);

  const overlay = document.createElement("div");
  overlay.id = "notifOverlay";
  overlay.className = "fixed inset-0 z-40 hidden flex items-center justify-center";
overlay.innerHTML = `
  <div id="notifBackdrop" class="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
  <div id="notifPanel" role="dialog" aria-modal="true" aria-labelledby="notifTitle"
    class="relative w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-2xl transform scale-95 opacity-0 transition-all duration-300 mt-4"
    style="max-height:80vh;">
    <header class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
      <h2 id="notifTitle" class="text-lg font-semibold text-slate-900 dark:text-slate-100">Notifications</h2>
      <div class="flex items-center gap-2">
        <button id="markAllBtn" class="text-sm text-blue-600 hover:underline">Mark all read</button>
        <button id="closeNotifBtn" aria-label="Close notifications" class="p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </header>

    <div id="notifListWrap" class="overflow-y-auto p-4" style="max-height:calc(80vh - 72px);">
      <ul id="notifList" class="flex flex-col gap-2"></ul>
    </div>

    <footer class="p-3 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-slate-400">
      Click a notification to mark it read. New items are shown at top.
    </footer>
  </div>
`;
  root.appendChild(overlay);

  // DOM refs
  const badge = bellBtn.querySelector("#notifBellBadge");
  const panel = overlay.querySelector("#notifPanel");
  const backdrop = overlay.querySelector("#notifBackdrop");
  const notifList = overlay.querySelector("#notifList");
  const closeBtn = overlay.querySelector("#closeNotifBtn");
  const markAllBtn = overlay.querySelector("#markAllBtn");

  // internal state
  let notifications = [];

  // helper: fetch notifications via API
  async function fetchNotifications() {
    const token = getToken();
    if (!token) return { notifications: [], unread_count: 0 };

    const res = await fetch("/api/v1/notifications/check", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return { notifications: [], unread_count: 0 };
    return await res.json();
  }

  // helper: mark one notification read
  async function markRead(id) {
    const token = getToken();
    if (!token) return false;
    const res = await fetch(`/api/v1/notifications/read/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    return res.ok;
  }

  // helper: mark all read
  async function markAllRead() {
    const token = getToken();
    if (!token) return false;
    const res = await fetch("/api/v1/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
    });
    return res.ok;
  }

  // render badge
  function renderBadge(count) {
    if (count && count > 0) {
      badge.textContent = count > 9 ? "9+" : String(count);
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  }

  // render list items
  function renderList(items) {
    notifList.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.className = "p-4 text-center text-sm text-gray-500";
      li.innerHTML = `<i class="fa-regular fa-bell-slash mr-2"></i> No notifications`;
      notifList.appendChild(li);
      return;
    }

    items.forEach(n => {
      const li = document.createElement("li");
      li.className = [
        "flex", "items-start", "justify-between", "gap-3",
        "p-3", "rounded-lg", "border",
        n.read_at ? "border-transparent bg-transparent" : "border-blue-100 bg-blue-50 dark:bg-blue-900/20",
        "cursor-pointer", "hover:shadow-sm", "transition"
      ].join(" ");
      li.innerHTML = `
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-slate-900 dark:text-slate-100">${escapeHtml(n.title)}</span>
            ${n.read_at ? '' : '<span class="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>'}
          </div>
          <div class="text-xs text-gray-600 dark:text-gray-300 mt-1">${escapeHtml(n.message)}</div>
          <div class="text-xs text-gray-400 mt-2">${new Date(n.created_at).toLocaleString()}</div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button data-id="${n.id}" class="mark-read-btn text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400">Mark read</button>
        </div>
      `;
      // click whole row -> mark & optionally navigate (handled by buttons)
      li.addEventListener("click", async (ev) => {
        // avoid handling clicks on the mark-read button separately twice
        if (ev.target.closest(".mark-read-btn")) return;
        const ok = await markRead(n.id);
        if (ok) {
          n.read_at = new Date().toISOString();
          refreshUI();
          // if contains article id, navigate
          if (n.data?.article_id) window.location.href = `/articles/${n.data.article_id}`;
        }
      });

      notifList.appendChild(li);
    });

    // attach mark-read button handlers
    notifList.querySelectorAll(".mark-read-btn").forEach(btn => {
      btn.addEventListener("click", async (ev) => {
        ev.stopPropagation();
        const id = Number(btn.getAttribute("data-id"));
        const ok = await markRead(id);
        if (ok) {
          const idx = notifications.findIndex(x => x.id === id);
          if (idx !== -1) notifications[idx].read_at = new Date().toISOString();
          refreshUI();
        }
      });
    });
  }

  // safe HTML escape (small helper)
  function escapeHtml(str) {
    if (str == null) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // refresh UI from internal state
  function refreshUI() {
    renderList(notifications);
    const unread = notifications.filter(n => !n.read_at).length;
    renderBadge(unread);
  }

  // open modal with animation
  async function openModal() {
    overlay.classList.remove("hidden");
    // animate backdrop + panel
    requestAnimationFrame(() => {
      backdrop.classList.add("opacity-100");
      panel.classList.remove("scale-95", "opacity-0");
      panel.classList.add("scale-100", "opacity-100");
    });

    // fetch data once when opening
    const payload = await fetchNotifications();
    notifications = payload.notifications ?? [];
    // convert data JSON values (if strings)
    notifications = notifications.map(n => {
      if (typeof n.data === "string") {
        try { n.data = JSON.parse(n.data); } catch (e) { /* ignore */ }
      }
      return n;
    });
    refreshUI();

    // focus trap basics
    const focusable = panel.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])");
    if (focusable.length) focusable[0].focus();
    document.addEventListener("keydown", onKeyDown);
  }

  // close modal with animation
  function closeModal() {
    backdrop.classList.remove("opacity-100");
    panel.classList.remove("scale-100", "opacity-100");
    panel.classList.add("scale-95", "opacity-0");
    document.removeEventListener("keydown", onKeyDown);
    // wait transition then hide
    setTimeout(() => overlay.classList.add("hidden"), 250);
  }

  function onKeyDown(e) {
    if (e.key === "Escape") closeModal();
    // basic focus trap: if tab pressed keep inside panel
    if (e.key === "Tab") {
      const focusables = Array.from(panel.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])"))
        .filter(el => !el.hasAttribute("disabled"));
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  }

  // outside click closes
  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  // bell click toggles
  bellBtn.addEventListener("click", () => {
    if (overlay.classList.contains("hidden")) openModal();
    else closeModal();
  });

  // mark all handler
  markAllBtn.addEventListener("click", async () => {
    const ok = await markAllRead();
    if (ok) {
      notifications = notifications.map(n => ({ ...n, read_at: new Date().toISOString() }));
      refreshUI();
    }
  });

  // initial badge hidden
  renderBadge(0);

  // expose a simple public refresh to allow manual triggers when notifications change
  return {
    async refresh() {
      const payload = await fetchNotifications();
      notifications = payload.notifications ?? [];
      notifications = notifications.map(n => {
        if (typeof n.data === "string") {
          try { n.data = JSON.parse(n.data); } catch (e) {}
        }
        return n;
      });
      refreshUI();
    }
  };
}
