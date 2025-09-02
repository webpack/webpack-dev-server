/* global WorkerGlobalScope */

/** @typedef {import("../index").EXPECTED_ANY} EXPECTED_ANY */

// Send messages to the outside, so plugins can consume it.
/**
 * @param {string} type type
 * @param {EXPECTED_ANY=} data data
 */
function sendMsg(type, data) {
  if (
    typeof self !== "undefined" &&
    (typeof WorkerGlobalScope === "undefined" ||
      !(self instanceof WorkerGlobalScope))
  ) {
    self.postMessage({ type: `webpack${type}`, data }, "*");
  }
}

export default sendMsg;
