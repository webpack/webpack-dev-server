"use strict";

/* eslint-env worker */

self.onmessage = function onMessage(e) {
  console.log("[WORKER]", e);
  self.postMessage({
    hello: 222,
  });
};
