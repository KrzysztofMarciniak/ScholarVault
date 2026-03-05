// get_token.js

/**
 * Get the current API token from localStorage
 * @returns {string | null}
 */
export function getToken() {
  return localStorage.getItem("api_token");
}
