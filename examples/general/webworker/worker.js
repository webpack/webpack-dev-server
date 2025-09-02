"use strict";

/* eslint-env worker */

globalThis.onmessage = function onMessage(e) {
  console.log("[WORKER]", e);
  self.postMessage({
    hello: 222,
  });
};
