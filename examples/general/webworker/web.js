"use strict";

/* eslint-env browser */

const worker = new Worker("worker.bundle.js");
worker.onmessage = function onMessage(e) {
  console.log("[MAIN]", e);
};
worker.postMessage({
  hello: 111,
});
