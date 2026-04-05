// crud_citations.js
import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { notifySuccess, notifyError } from "./notification.js";
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

let currentArticleId = null;
let currentPage = 1;

/**
 * GET /api/v1/citations
 */
async function listCitationsApi(filters = {}) {
  const params = new URLSearchParams();

  params.set("page", String(filters.page || 1));
  params.set("per_page", String(filters.per_page || 15));

  if (filters.search) params.set("search", filters.search);
  if (filters.availability_status) params.set("availability_status", filters.availability_status);
  if (filters.article_id) params.set("article_id", String(filters.article_id));

  const res = await axios.get(`/api/v1/citations?${params.toString()}`);
  return res.data;
}

/**
 * GET /api/v1/citations/:id
 */
async function getCitationApi(id) {
  const res = await axios.get(`/api/v1/citations/${id}`);
  return res.data;
}

/**
 * POST /api/v1/citations
 */
async function createCitationApi(data) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.post("/api/v1/citations", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

/**
 * PATCH /api/v1/citations/:id
 */
async function updateCitationApi(id, data) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.patch(`/api/v1/citations/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

/**
 * DELETE /api/v1/citations/:id
 */
async function deleteCitationApi(id) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.delete(`/api/v1/citations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
}

/**
 * Render citation form (add/edit)
 */
function renderCitationForm(container, citation = null, articleId = null) {
  const isEdit = !!citation;
  const currentId = isEdit ? citation.article_id || articleId || currentArticleId : articleId || currentArticleId;

  const fields = [
    { name: "title", label: "Title", type: "text", required: true, value: citation?.title || "" },
    { name: "authors", label: "Authors", type: "text", required: false, value: citation?.authors || "" },
    { name: "doi", label: "DOI", type: "text", required: false, value: citation?.doi || "" },
    { name: "url", label: "URL", type: "url", required: false, value: citation?.url || "" },
    {
      name: "published_at",
      label: "Published Date",
      type: "date",
      required: false,
      value: citation?.published_at ? String(citation.published_at).split("T")[0] : "",
    },
    {
      name: "availability_status",
      label: "Availability Status",
      type: "select",
      required: true,
      value: citation?.availability_status || "doi_only",
      options: [
        { value: "doi_only", label: "DOI Link" },
        { value: "external_link", label: "External Link" },
        { value: "on_site", label: "Available on Site" },
      ],
    },
    {
      name: "on_site_path",
      label: "On-site Path (if applicable)",
      type: "text",
      required: false,
      value: citation?.on_site_path || "",
    },
  ];

  const { form, errorBox } = renderForm({
    container,
    title: "",
    fields,
    submitText: isEdit ? "Update Citation" : "Add Citation",
    useStyledSubmit: true,
    submitVariant: "primary",
    submitSize: "md",
    submitExtraClasses: "w-full mt-4",
  });

  if (!form) return null;

  form.onsubmit = async (e) => {
    e.preventDefault();
    resetFormErrors(form, errorBox);

    const formData = {
      title: form.title.value.trim(),
      authors: form.authors.value.trim() || null,
      doi: form.doi.value.trim() || null,
      url: form.url.value.trim() || null,
      published_at: form.published_at.value || null,
      availability_status: form.availability_status.value,
      on_site_path: form.on_site_path.value.trim() || null,
      article_id: currentId, // always include article_id
    };

    if (!formData.article_id) {
      const msg = "Missing article context. Select an article first.";
      errorBox.className = "mt-4 text-red-600 dark:text-red-400";
      errorBox.textContent = msg;
      notifyError(msg);
      return;
    }

    try {
      if (isEdit) {
        await updateCitationApi(citation.id, formData);
        notifySuccess("Citation updated successfully");
      } else {
        await createCitationApi(formData);
        notifySuccess("Citation created successfully");
      }

      window.dispatchEvent(
        new CustomEvent("citations:updated", {
          detail: { articleId: currentId },
        })
      );
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      errorBox.className = "mt-4 text-red-600 dark:text-red-400";
      errorBox.textContent = msg;
      notifyError(msg);
      markInvalid(form);
    }
  };

  return form;
}

/**
 * Render citations list
 * @param {number|null} articleId
 */
export async function renderCitations(articleId = null) {
  currentArticleId = articleId ?? currentArticleId;

  const container = createContentContainer({
    title: currentArticleId ? `Citations for Article #${currentArticleId}` : "Citations",
    icon: "fa-solid fa-book",
    padded: true,
    margin: "2rem auto",
    extraClasses: "max-w-4xl",
  });

  container.innerHTML = `
    <div class="mb-6 flex gap-3 flex-wrap items-end">
      <div class="flex-1 min-w-xs">
        <label class="block text-sm font-medium mb-2">Search</label>
        <input
          id="citSearch"
          type="text"
          placeholder="Search citations..."
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div class="min-w-xs">
        <label class="block text-sm font-medium mb-2">Status</label>
        <select
          id="citStatusFilter"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All</option>
          <option value="on_site">On Site</option>
          <option value="external_link">External Link</option>
          <option value="doi_only">DOI Only</option>
        </select>
      </div>

      <button
        id="citAddBtn"
        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
      >
        <i class="fa-solid fa-plus"></i> Add Citation
      </button>
    </div>

    ${
      currentArticleId
        ? `
          <div class="mb-4 px-4 py-3 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200">
            Showing citations for article ID <strong>${currentArticleId}</strong>
          </div>
        `
        : ""
    }

    <div id="citLoading" class="text-center py-8">
      <i class="fa-solid fa-spinner fa-spin"></i> Loading citations...
    </div>
    <div id="citList" class="space-y-3"></div>
    <div id="citPagination" class="flex justify-center gap-2 mt-6 flex-wrap"></div>
  `;

  const searchEl = container.querySelector("#citSearch");
  const statusEl = container.querySelector("#citStatusFilter");
  const addBtn = container.querySelector("#citAddBtn");
  const listEl = container.querySelector("#citList");
  const paginationEl = container.querySelector("#citPagination");
  const loadingEl = container.querySelector("#citLoading");

  async function loadCitations(page = 1) {
    currentPage = page;
    loadingEl.style.display = "block";
    listEl.innerHTML = "";
    paginationEl.innerHTML = "";

    try {
      const data = await listCitationsApi({
        page,
        search: searchEl.value.trim(),
        availability_status: statusEl.value,
        article_id: currentArticleId,
      });

      loadingEl.style.display = "none";
      const citations = data.data || [];

      if (!citations.length) {
        listEl.innerHTML = '<p class="text-center py-8 text-gray-600 dark:text-gray-400">No citations found.</p>';
        return;
      }

      citations.forEach((cit) => {
        const item = document.createElement("div");
        item.className =
          "p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:shadow-md transition";

        item.innerHTML = `
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">${cit.title || "Untitled"}</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${cit.authors || "Unknown authors"}</p>
              <span class="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                ${
                  cit.availability_status === "on_site"
                    ? "On Site"
                    : cit.availability_status === "external_link"
                      ? "External Link"
                      : "DOI"
                }
              </span>
            </div>
            <div class="flex gap-2">
              <button class="cit-edit px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition">
                <i class="fa-solid fa-edit"></i>
              </button>
              <button class="cit-delete px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;

        const editBtn = item.querySelector(".cit-edit");
        const deleteBtn = item.querySelector(".cit-delete");

        editBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          showEditModal(cit);
        });

        deleteBtn.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("Delete this citation?")) return;

          try {
            await deleteCitationApi(cit.id);
            notifySuccess("Citation deleted");
            loadCitations(currentPage);
          } catch (err) {
            notifyError(err.response?.data?.message || err.message || "Delete failed");
          }
        });

        listEl.appendChild(item);
      });

      if (data.last_page > 1) {
        for (let i = 1; i <= data.last_page; i++) {
          const btn = document.createElement("button");
          btn.textContent = i;
          btn.className = `px-3 py-1 rounded border transition ${
            i === data.current_page
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 dark:border-gray-600 hover:border-blue-600"
          }`;
          btn.addEventListener("click", () => loadCitations(i));
          paginationEl.appendChild(btn);
        }
      }
    } catch (err) {
      loadingEl.style.display = "none";
      listEl.innerHTML = `<p class="text-red-600">${err.message || "Failed to load citations"}</p>`;
    }
  }

  function showAddModal() {
    if (!currentArticleId) {
      notifyError("No article selected");
      return;
    }

    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
    <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Add Citation</h2>
    <div id="modalFormContainer"></div>
    <button id="exitBtn" class="absolute top-2 right-2 p-2 bg-red-400 hover:bg-red-500 text-white rounded-full transition">
      <i class="fa-solid fa-times"></i>
    </button>
  </div>
`;
    document.body.appendChild(modal);

    const formContainer = modal.querySelector("#modalFormContainer");
    renderCitationForm(formContainer, null, currentArticleId);

    // Exit button
    const exitBtn = modal.querySelector("#exitBtn");
    exitBtn.addEventListener("click", () => {
      modal.remove();
    });

    const onUpdated = (ev) => {
      if (ev?.detail?.articleId && currentArticleId && Number(ev.detail.articleId) !== Number(currentArticleId)) return;
      modal.remove();
      window.removeEventListener("citations:updated", onUpdated);
      loadCitations(1);
    };

    window.addEventListener("citations:updated", onUpdated);
  }

  function showEditModal(citation) {
    const modal = document.createElement("div");
    modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
    modal.innerHTML = `
  <div class="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto p-6">
    <h2 class="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Citation</h2>
    <div id="modalFormContainer"></div>
    <button id="exitBtn" class="absolute top-2 right-2 p-2 bg-red-400 hover:bg-red-500 text-white rounded-full transition">
      <i class="fa-solid fa-times"></i>
    </button>
  </div>
`;
    document.body.appendChild(modal);

    const formContainer = modal.querySelector("#modalFormContainer");
    renderCitationForm(formContainer, citation);

    // Exit button
    const exitBtn = modal.querySelector("#exitBtn");
    exitBtn.addEventListener("click", () => {
      modal.remove();
    });

    const onUpdated = (ev) => {
      if (ev?.detail?.articleId && currentArticleId && Number(ev.detail.articleId) !== Number(currentArticleId)) return;
      modal.remove();
      window.removeEventListener("citations:updated", onUpdated);
      loadCitations(currentPage);
    };

    window.addEventListener("citations:updated", onUpdated);
  }

  searchEl.addEventListener("change", () => loadCitations(1));
  statusEl.addEventListener("change", () => loadCitations(1));
  addBtn.addEventListener("click", showAddModal);

  await loadCitations(1);
}
