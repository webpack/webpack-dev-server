/* eslint-env browser */
"use strict";

const worker = new Worker("worker.bundle.js");
worker.onmessage = function(e) {
	console.log("[MAIN]", e);
};
worker.postMessage({
	hello: 111
});
