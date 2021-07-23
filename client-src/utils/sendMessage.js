/* global __resourceQuery WorkerGlobalScope */

// Send messages to the outside, so plugins can consume it.
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
