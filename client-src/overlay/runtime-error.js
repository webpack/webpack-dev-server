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

function listenToSomething() {}

export { listenToRuntimeError, listenToSomething };
