// home.js
import { createContentContainer } from "./layout.js";

export function renderHome() {
  const content = createContentContainer({
    id: "content",
    clearApp: true,
    padded: true,
    margin: "2rem auto",
    border: "1px solid #ccc",
    extraClasses: "max-w-4xl text-center",
    title: "ScholarVault",
    icon: "fa-solid fa-flask" // Font Awesome icon for home page
  });

  // main welcome section
  const html = `
    <p class="text-gray-600 dark:text-gray-300 mb-8 text-lg">
      Your platform for managing scientific articles, users, and reviews.
    </p>

    <div class="flex flex-wrap justify-center gap-4">
      <button id="btnBrowseArticles" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
        <i class="fa-solid fa-book-open mr-2"></i> Browse Articles
      </button>
      <button id="btnSubmitArticle" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
        <i class="fa-solid fa-upload mr-2"></i> Submit Article
      </button>
      <button id="btnMyDashboard" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
        <i class="fa-solid fa-tachometer-alt mr-2"></i> My Dashboard
      </button>
    </div>
  `;

  // Replace or append to container (below header)
  const header = content.querySelector("[data-content-header]");
  if (header) {
    // clear existing content below header
    Array.from(content.children).forEach(c => { if (c !== header) c.remove(); });
    content.insertAdjacentHTML("beforeend", html);
  } else {
    content.innerHTML = html;
  }

  // Button handlers
  document.getElementById("btnBrowseArticles").onclick = () => {
    import("./articles.js").then(mod => mod.renderArticles());
  };
  document.getElementById("btnSubmitArticle").onclick = () => {
    import("./submit_article.js").then(mod => mod.renderSubmitForm());
  };
  document.getElementById("btnMyDashboard").onclick = () => {
    import("./dashboard.js").then(mod => mod.renderDashboard());
  };
}
