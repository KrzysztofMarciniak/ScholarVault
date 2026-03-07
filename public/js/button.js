// button.js

/**
 * Create a styled button with variants
 * @param {string} label - Button text
 * @param {Function} onClick - Click handler
 * @param {Object} options
 * @param {"primary"|"secondary"|"success"|"danger"|"neutral"} options.variant - Color variant
 * @param {"sm"|"md"|"lg"} options.size - Size of the button
 * @param {string} options.extraClasses - Additional tailwind classes
 * @returns {HTMLButtonElement}
 */
export function createButton(label, onClick, {
  variant = "primary",
  size = "md",
  extraClasses = "",
} = {}) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.type = "button";

  const base = `
    font-semibold rounded-lg shadow-md transition-all
    focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-opacity-50
    flex items-center justify-center
  `;

  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-5 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    primary: `
      bg-gradient-to-br from-blue-600 to-blue-500 text-white
      hover:from-blue-700 hover:to-blue-600
      active:scale-95
      focus:ring-blue-400
    `,
    secondary: `
      bg-gradient-to-br from-gray-600 to-gray-500 text-white
      hover:from-gray-700 hover:to-gray-600
      active:scale-95
      focus:ring-gray-400
    `,
    success: `
      bg-gradient-to-br from-green-600 to-green-500 text-white
      hover:from-green-700 hover:to-green-600
      active:scale-95
      focus:ring-green-400
    `,
    danger: `
      bg-gradient-to-br from-red-600 to-red-500 text-white
      hover:from-red-700 hover:to-red-600
      active:scale-95
      focus:ring-red-400
    `,
    neutral: `
      bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700
      hover:bg-gray-100 dark:hover:bg-gray-700
      active:scale-95
      focus:ring-gray-400
    `
  };

  btn.className = `${base} ${sizeClasses[size]} ${variants[variant]} ${extraClasses}`;

  btn.onclick = onClick;

  return btn;
}
