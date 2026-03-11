import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

/** Fetch paginated reviewers */
async function fetchReviewers({ page = 1, perPage = 10, search = "" } = {}) {
  const token = getToken();
  const params = new URLSearchParams({ page, per_page: perPage });
  if (search) params.set("search", search);

  const res = await fetch(`/api/v1/articles/admin/reviewers?${params.toString()}`, token ? {
    headers: { Authorization: `Bearer ${token}` }
  } : {});

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
  return payload;
}

/** Render reviewer list item with Font Awesome checkmark */
function createReviewerItem(reviewer, selectedReviewers) {
  const item = document.createElement("div");
  item.className = `
    cursor-pointer px-3 py-2 border-b hover:bg-gray-100 dark:hover:bg-gray-800
    transition rounded flex justify-between items-center
  `;

  const nameSpan = document.createElement("span");
  nameSpan.textContent = `${reviewer.name} (${reviewer.email})`;
  item.appendChild(nameSpan);

  const checkmark = document.createElement("i");
  checkmark.className = "fa-solid fa-check text-green-500 opacity-0";
  item.appendChild(checkmark);

  item.addEventListener("click", () => {
    const idx = selectedReviewers.findIndex(r => r.id === reviewer.id);
    if (idx === -1) {
      selectedReviewers.push(reviewer);
      item.classList.add("bg-blue-500", "text-white");
      checkmark.classList.remove("opacity-0");
    } else {
      selectedReviewers.splice(idx, 1);
      item.classList.remove("bg-blue-500", "text-white");
      checkmark.classList.add("opacity-0");
    }
  });

  return item;
}

/** Render assign reviewers page */
export async function renderAssignReviewers(article) {
  const container = createContentContainer({
    title: `Assign Reviewers for "${article.title}"`,
    icon: "fa-solid fa-user-check",
    extraClasses: "rounded-xl shadow-md bg-white dark:bg-gray-900 w-full",
    margin: "2rem auto"
  });

  container.innerHTML = `
    <div class="flex flex-col gap-2 w-full">
      <div class="flex gap-2 mb-2">
        <input id="reviewerSearch" type="text" placeholder="Search reviewers..." class="flex-1 px-2 py-1 border rounded">
        <button id="reviewerSearchBtn" class="px-3 py-1 bg-blue-500 text-white rounded">Search</button>
      </div>
      <div id="reviewerList" class="flex-1 overflow-y-auto border rounded p-2 max-h-[60vh]"></div>
      <div id="reviewerPagination" class="flex justify-center gap-2 mt-2"></div>
      <button id="assignReviewersBtn" class="mt-2 px-3 py-1 bg-green-500 text-white rounded">Assign Selected</button>
    </div>
  `;

  const listEl = container.querySelector("#reviewerList");
  const paginationEl = container.querySelector("#reviewerPagination");
  const searchEl = container.querySelector("#reviewerSearch");
  const searchBtn = container.querySelector("#reviewerSearchBtn");
  const assignBtn = container.querySelector("#assignReviewersBtn");

  const selectedReviewers = [];

  async function loadReviewers(page = 1) {
    listEl.innerHTML = `<div class="py-6 text-center text-gray-500 dark:text-gray-400">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i>Loading reviewers...
    </div>`;

    try {
      const data = await fetchReviewers({
        page,
        perPage: 10,
        search: searchEl.value.trim()
      });

      const reviewers = data.data ?? [];
      if (!reviewers.length) {
        listEl.innerHTML = `<p class="py-6 text-center text-gray-500 dark:text-gray-400">No reviewers found.</p>`;
        paginationEl.innerHTML = "";
        return;
      }

      listEl.innerHTML = "";
      reviewers.forEach(r => {
        const item = createReviewerItem(r, selectedReviewers);
        listEl.appendChild(item);
      });

      // Pagination buttons
      paginationEl.innerHTML = "";
      for (let i = 1; i <= data.last_page; i++) {
        const btn = document.createElement("button");
        btn.textContent = i;
        btn.className = `px-2 py-1 border rounded ${i === data.current_page ? "bg-blue-500 text-white" : ""}`;
        btn.addEventListener("click", () => loadReviewers(i));
        paginationEl.appendChild(btn);
      }

    } catch (err) {
      listEl.innerHTML = `<div class="py-6 text-red-600 dark:text-red-400">Failed to load reviewers: ${err.message}</div>`;
      console.error(err);
    }
  }

  searchBtn.addEventListener("click", () => loadReviewers(1));

  assignBtn.addEventListener("click", async () => {
    if (!selectedReviewers.length) {
      alert("Select at least one reviewer!");
      return;
    }

    const token = getToken();
    try {
      const res = await fetch(`/api/v1/articles/admin/reviewers/${article.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ reviewers: selectedReviewers.map(r => r.id) })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.message || payload.error || res.statusText);
      alert("Reviewers assigned successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to assign reviewers: " + err.message);
    }
  });

  await loadReviewers(1);
}
