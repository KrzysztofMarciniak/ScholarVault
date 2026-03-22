// notifications_modal.js
import { getToken } from "./get_token.js";

/**
 * Notifications modal overlay (bell -> full-screen overlay).
 * Uses CSS variables from theme_switch.js for theme reactivity.
 */

let __notifStylesInjected = false;

function ensureNotifStyles() {
  if (__notifStylesInjected) return;

  const style = document.createElement("style");
  style.id = "notif-modal-theme";

  style.textContent = `
    .notif-root {
      position: fixed;
      inset: 0;
      z-index: 9999;
      pointer-events: none;
    }

    .notif-bell {
      position: fixed;
      top: 6rem;
      right: 1rem;
      z-index: 10001;
      width: 3rem;
      height: 3rem;
      display: grid;
      place-items: center;
      border-radius: 9999px;
      border: 2px solid var(--primary-color-b);
      background-color: var(--primary-color-a);
      color: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      cursor: pointer;
      pointer-events: auto;
      transition: all 0.3s ease;
    }

    .notif-bell:hover {
      background-color: var(--primary-color-b);
      border-color: var(--primary-color-a);
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }

    .notif-bell:active {
      transform: translateY(0);
    }

    .notif-bell:focus-visible {
      outline: 2px solid var(--primary-color-a);
      outline-offset: 2px;
    }

    .notif-badge {
      position: absolute;
      top: -0.25rem;
      right: -0.25rem;
      min-width: 1.1rem;
      height: 1.1rem;
      padding: 0 0.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      background: #dc2626;
      color: #fff;
      font-size: 0.7rem;
      line-height: 1;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .notif-overlay {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: none;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
    }

    .notif-overlay.is-open {
      display: flex;
    }

    .notif-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .notif-overlay.is-open .notif-backdrop {
      opacity: 1;
    }

    .notif-panel {
      position: relative;
      z-index: 1;
      width: min(100%, 48rem);
      max-height: 80vh;
      overflow: hidden;
      margin-top: 1rem;
      border-radius: 1rem;
      border: 2px solid var(--primary-color-b);
      background: var(--background-color);
      color: var(--text-color-a);
      box-shadow: 0 20px 50px rgba(0,0,0,0.28);
      transform: scale(0.96);
      opacity: 0;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    .notif-overlay.is-open .notif-panel {
      transform: scale(1);
      opacity: 1;
    }

    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 2px solid var(--primary-color-b);
      background: var(--text-color-b);
    }

    .notif-title {
      margin: 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color-a);
    }

    .notif-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .notif-link-btn,
    .notif-icon-btn {
      border: 1px solid var(--primary-color-b);
      background: transparent;
      color: var(--primary-color-a);
      cursor: pointer;
      padding: 0.35rem 0.75rem;
      border-radius: 0.5rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .notif-link-btn:hover,
    .notif-icon-btn:hover {
      background: var(--primary-color-a);
      color: white;
      border-color: var(--primary-color-a);
      transform: translateY(-1px);
    }

    .notif-link-btn:active,
    .notif-icon-btn:active {
      transform: translateY(0);
    }

    .notif-icon-btn {
      width: 2.25rem;
      height: 2.25rem;
      display: grid;
      place-items: center;
      padding: 0;
    }

    .notif-body {
      overflow-y: auto;
      max-height: calc(80vh - 7rem);
      padding: 1rem;
      background: var(--background-color);
    }

    .notif-list {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .notif-item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.85rem 0.9rem;
      border-radius: 0.75rem;
      border: 2px solid transparent;
      background: transparent;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .notif-item:hover {
      background: var(--text-color-b);
      border-color: var(--primary-color-b);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      transform: translateX(4px);
    }

    .notif-item.unread {
      border-color: var(--primary-color-b);
      background: var(--text-color-b);
    }

    .notif-item.read {
      border-color: transparent;
      background: transparent;
    }

    .notif-item-main {
      flex: 1;
      min-width: 0;
    }

    .notif-item-title-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .notif-item-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--text-color-a);
      word-break: break-word;
    }

    .notif-dot {
      width: 0.5rem;
      height: 0.5rem;
      border-radius: 9999px;
      background: var(--primary-color-a);
      flex: 0 0 auto;
    }

    .notif-item-message {
      margin-top: 0.35rem;
      font-size: 0.82rem;
      color: var(--text-color-a);
      opacity: 0.9;
      word-break: break-word;
    }

    .notif-item-time {
      margin-top: 0.5rem;
      font-size: 0.72rem;
      color: var(--text-color-a);
      opacity: 0.65;
    }

    .notif-item-side {
      flex: 0 0 auto;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .notif-footer {
      padding: 0.75rem 1rem;
      border-top: 2px solid var(--primary-color-b);
      background: var(--text-color-b);
      font-size: 0.75rem;
      color: var(--text-color-a);
      opacity: 0.8;
    }
  `;

  document.head.appendChild(style);
  __notifStylesInjected = true;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Usage: import and call initNotificationsModal() once on startup.
 */
export function initNotificationsModal() {
  if (document.getElementById("notifModalRoot")) return;

  ensureNotifStyles();

  const root = document.createElement("div");
  root.id = "notifModalRoot";
  root.className = "notif-root";
  document.body.appendChild(root);

  const bellBtn = document.createElement("button");
  bellBtn.id = "notifBell";
  bellBtn.type = "button";
  bellBtn.className = "notif-bell";
  bellBtn.setAttribute("aria-label", "Open notifications");
  bellBtn.setAttribute("aria-expanded", "false");
  bellBtn.innerHTML = `
    <i class="fa-solid fa-bell" aria-hidden="true"></i>
    <span id="notifBellBadge" class="notif-badge" hidden></span>
  `;
  root.appendChild(bellBtn);

  const overlay = document.createElement("div");
  overlay.id = "notifOverlay";
  overlay.className = "notif-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `
    <div id="notifBackdrop" class="notif-backdrop"></div>
    <div id="notifPanel" class="notif-panel" role="dialog" aria-modal="true" aria-labelledby="notifTitle">
      <header class="notif-header">
        <h2 id="notifTitle" class="notif-title">Notifications</h2>
        <div class="notif-actions">
          <button id="markAllBtn" type="button" class="notif-link-btn">Mark all read</button>
          <button id="closeNotifBtn" type="button" aria-label="Close notifications" class="notif-icon-btn">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      </header>

      <div id="notifListWrap" class="notif-body">
        <ul id="notifList" class="notif-list"></ul>
      </div>

      <footer class="notif-footer">
        Click a notification to mark it read. New items are shown at top.
      </footer>
    </div>
  `;
  root.appendChild(overlay);

  const badge = bellBtn.querySelector("#notifBellBadge");
  const panel = overlay.querySelector("#notifPanel");
  const backdrop = overlay.querySelector("#notifBackdrop");
  const notifList = overlay.querySelector("#notifList");
  const closeBtn = overlay.querySelector("#closeNotifBtn");
  const markAllBtn = overlay.querySelector("#markAllBtn");

  let notifications = [];
  let isOpen = false;
  let keyHandlerBound = false;

  async function fetchNotifications() {
    const token = getToken();
    if (!token) return { notifications: [], unread_count: 0 };

    const res = await fetch("/api/v1/notifications/check", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return { notifications: [], unread_count: 0 };
    return await res.json();
  }

  async function markRead(id) {
    const token = getToken();
    if (!token) return false;

    const res = await fetch(`/api/v1/notifications/read/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.ok;
  }

  async function markAllRead() {
    const token = getToken();
    if (!token) return false;

    const res = await fetch("/api/v1/notifications/read-all", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return res.ok;
  }

  function renderBadge(count) {
    if (count > 0) {
      badge.textContent = count > 9 ? "9+" : String(count);
      badge.hidden = false;
    } else {
      badge.textContent = "";
      badge.hidden = true;
    }
  }

  function refreshUI() {
    notifList.innerHTML = "";

    if (!notifications.length) {
      const li = document.createElement("li");
      li.className = "notif-item read";
      li.style.cursor = "default";
      li.innerHTML = `
        <div class="notif-item-main">
          <div class="notif-item-title-row">
            <span class="notif-item-title">No notifications</span>
          </div>
        </div>
      `;
      notifList.appendChild(li);
      renderBadge(0);
      return;
    }

    const unread = notifications.filter(n => !n.read_at).length;
    renderBadge(unread);

    notifications.forEach(n => {
      const li = document.createElement("li");
      li.className = `notif-item ${n.read_at ? "read" : "unread"}`;
      li.innerHTML = `
        <div class="notif-item-main">
          <div class="notif-item-title-row">
            <span class="notif-item-title">${escapeHtml(n.title)}</span>
            ${n.read_at ? "" : '<span class="notif-dot" aria-hidden="true"></span>'}
          </div>
          <div class="notif-item-message">${escapeHtml(n.message)}</div>
          <div class="notif-item-time">${n.created_at ? new Date(n.created_at).toLocaleString() : ""}</div>
        </div>
        <div class="notif-item-side">
          <button type="button" data-id="${n.id}" class="mark-read-btn notif-link-btn">Mark read</button>
        </div>
      `;

      li.addEventListener("click", async (ev) => {
        if (ev.target.closest(".mark-read-btn")) return;

        const ok = await markRead(n.id);
        if (ok) {
          n.read_at = new Date().toISOString();
          refreshUI();
          if (n.data?.article_id) {
            window.location.href = `/articles/${n.data.article_id}`;
          }
        }
      });

      notifList.appendChild(li);
    });

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

  function normalizeNotifications(items) {
    return (items ?? []).map(n => {
      if (typeof n.data === "string") {
        try {
          n.data = JSON.parse(n.data);
        } catch {
          n.data = null;
        }
      }
      return n;
    });
  }

  async function loadNotifications() {
    const payload = await fetchNotifications();
    notifications = normalizeNotifications(payload.notifications);
    refreshUI();
  }

  function openModal() {
    if (isOpen) return;

    isOpen = true;
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    bellBtn.setAttribute("aria-expanded", "true");

    if (!keyHandlerBound) {
      document.addEventListener("keydown", onKeyDown);
      keyHandlerBound = true;
    }

    loadNotifications().then(() => {
      const focusable = panel.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])");
      if (focusable.length) focusable[0].focus();
    });
  }

  function closeModal() {
    if (!isOpen) return;

    isOpen = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    bellBtn.setAttribute("aria-expanded", "false");

    if (keyHandlerBound) {
      document.removeEventListener("keydown", onKeyDown);
      keyHandlerBound = false;
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      closeModal();
      return;
    }

    if (e.key !== "Tab") return;

    const focusables = Array.from(
      panel.querySelectorAll("button, a, [tabindex]:not([tabindex='-1'])")
    ).filter(el => !el.hasAttribute("disabled"));

    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  backdrop.addEventListener("click", closeModal);
  closeBtn.addEventListener("click", closeModal);

  bellBtn.addEventListener("click", () => {
    if (isOpen) closeModal();
    else openModal();
  });

  markAllBtn.addEventListener("click", async () => {
    const ok = await markAllRead();
    if (ok) {
      notifications = notifications.map(n => ({ ...n, read_at: new Date().toISOString() }));
      refreshUI();
    }
  });

  renderBadge(0);

  return {
    async refresh() {
      const payload = await fetchNotifications();
      notifications = normalizeNotifications(payload.notifications);
      refreshUI();
    },
  };
}
