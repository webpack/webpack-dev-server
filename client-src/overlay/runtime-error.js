/**
 *
 * @param {Error} error
 */
function parseErrorToStacks(error) {
  if (!error || !(error instanceof Error)) {
    throw new Error(`parseErrorToStacks expects Error object`);
  }
  if (typeof error.stack === "string") {
    return error.stack
      .split("\n")
      .filter((stack) => stack !== `Error: ${error.message}`);
  }
}

/**
 * @callback ErrorCallback
 * @param {ErrorEvent} error
 * @returns {void}
 */

/**
 * @param {ErrorCallback} callback
 */
function listenToRuntimeError(callback) {
  window.addEventListener("error", callback);

  return function cleanup() {
    window.removeEventListener("error", callback);
  };
}

export { listenToRuntimeError, parseErrorToStacks };
