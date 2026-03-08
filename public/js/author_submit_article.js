import { renderForm, resetFormErrors, markInvalid } from "./form.js";
import { notifySuccess, notifyError } from "./notification.js";
import { createContentContainer } from "./layout.js";
import { getToken } from "./get_token.js";

/**
 * POST /api/v1/articles
 */
async function submitArticleApi(formData) {

  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const res = await axios.post(
    "/api/v1/articles",
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return res.data;
}

/**
 * Render article submission form
 */
export function renderSubmitArticle() {

  const container = createContentContainer({
    title: "Submit Article",
    icon: "fa-solid fa-file-arrow-up",
    padded: true,
    margin: "2rem auto",
    extraClasses: "max-w-xl bg-white dark:bg-gray-900 rounded-xl shadow-md"
  });

  const fields = [
    { name: "title", label: "Title", type: "text", required: true },
    { name: "abstract", label: "Abstract", type: "textarea", required: true },
    { name: "file", label: "Article File (PDF or TeX)", type: "file", required: true },
    { name: "keywords", label: "Keywords (comma separated)", type: "text", required: false }
  ];

  const { form, errorBox } = renderForm({
    container,
    title: "",
    fields,
    submitText: "Submit Article",
    useStyledSubmit: true,
    submitVariant: "primary",
    submitSize: "md",
    submitExtraClasses: "w-full mt-4"
  });

  if (!form) return;

  form.onsubmit = async (e) => {

    e.preventDefault();
    resetFormErrors(form, errorBox);

    const title = form.title.value.trim();
    const abstract = form.abstract.value.trim();
    const file = form.file.files[0];
    const keywordsRaw = form.keywords.value.trim();

    if (!file) {
      errorBox.textContent = "Article file is required.";
      markInvalid(form);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("abstract", abstract);
    formData.append("file", file);

    if (keywordsRaw) {
      const keywords = keywordsRaw
        .split(",")
        .map(k => k.trim())
        .filter(Boolean);

      keywords.forEach((k, i) => formData.append(`keywords[${i}]`, k));
    }

    try {

      const res = await submitArticleApi(formData);
      const article = res.article || res.data || res;

      errorBox.className = "mt-4 text-green-600 dark:text-green-400";
      errorBox.textContent = `Article "${article.title}" submitted successfully.`;

      notifySuccess("Article submitted successfully");

      form.reset();

    } catch (err) {

      const msg = err.response?.data?.message || err.message || "Article submission failed";

      errorBox.className = "mt-4 text-red-600 dark:text-red-400";
      errorBox.textContent = msg;

      notifyError(msg);
      markInvalid(form);

    }

  };

}
