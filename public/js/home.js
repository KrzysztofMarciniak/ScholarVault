export function renderHome() {
  import("./articles.js").then(mod => {
    if (typeof mod.renderArticles === "function") {
      mod.renderArticles();
    } else {
      console.error("renderArticles function not found in articles.js");
    }
  }).catch(err => {
    console.error("Failed to load articles.js:", err);
  });
}
