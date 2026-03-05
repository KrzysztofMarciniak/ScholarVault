let container = null;

function ensureContainer() {

    if (container) return;

    container = document.createElement("div");
    container.id = "notifications";

    container.className =
        "fixed top-4 right-4 z-50 w-80 space-y-2";

    document.body.appendChild(container);
}

function create(message, type = "info", timeout = 4000) {

    ensureContainer();

    const note = document.createElement("div");

    const base =
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg transition-opacity";

    const styles = {
        success:
            "bg-green-50 border-green-400 text-green-800",

        error:
            "bg-red-50 border-red-400 text-red-800",

        info:
            "bg-gray-50 border-gray-300 text-gray-800"
    };

    note.className = `${base} ${styles[type] || styles.info}`;

    note.innerHTML = `
        <span class="flex-1 text-sm font-medium">
            ${message}
        </span>

        <button class="ml-2 text-xl leading-none opacity-60 hover:opacity-100">
            &times;
        </button>
    `;

    note.querySelector("button").onclick = () => note.remove();

    container.appendChild(note);

    setTimeout(() => {
        note.style.opacity = "0";
        setTimeout(() => note.remove(), 300);
    }, timeout);
}

export function notifySuccess(msg) {
    create(msg, "success");
}

export function notifyError(msg) {
    create(msg, "error");
}

export function notifyInfo(msg) {
    create(msg, "info");
}
