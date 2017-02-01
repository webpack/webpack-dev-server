/* eslint-env worker */
"use strict";

self.onmessage = function(e) {
	console.log("[WORKER]", e);
	self.postMessage({
		hello: 222
	});
};
