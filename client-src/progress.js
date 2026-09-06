import { hide, show } from "webpack-dev-middleware/client/indicator";

const source = "webpack-dev-server";

/**
 * @param {number} percent compilation progress
 * @param {string} message progress message
 * @returns {void}
 */
export function showProgress(percent, message) {
  if (
    typeof document === "undefined" ||
    typeof HTMLElement === "undefined" ||
    !HTMLElement.prototype.attachShadow
  ) {
    return;
  }

  if (percent >= 100) {
    hide(source);
  } else {
    show(`${percent}% - ${message}`, percent, source);
  }
}

/**
 * @returns {void}
 */
export function hideProgress() {
  hide(source);
}
