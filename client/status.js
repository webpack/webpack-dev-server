//the code was copied from overlay.js and modified for status display
var ansiHTML = require("ansi-html");
var Entities = require("html-entities").AllHtmlEntities;
var entities = new Entities();

var title = "";

function createStatusIframe(onIframeLoad) {
	var iframe = document.createElement("iframe");
	iframe.id = "webpack-dev-server-client-status";
	iframe.src = "about:blank";
	iframe.style.position = "fixed";
	iframe.style.left = 0;
	iframe.style.top = 0;
	iframe.style.right = 0;
	iframe.style.bottom = 0;
	iframe.style.width = "100vw";
	iframe.style.height = "100vh";
	iframe.style.border = "none";
	iframe.style.zIndex = 9999999999;
	iframe.onload = onIframeLoad;
	return iframe;
}

function addStatusDivTo(iframe) {
	var div = iframe.contentDocument.createElement("div");
	div.id = "webpack-dev-server-client-status-div";
	div.style.position = "fixed";
	div.style.boxSizing = "border-box";
	div.style.left = "33%";
	div.style.top = "33%";
	div.style.right = "33%";
	div.style.bottom = "33%";
	div.style.backgroundColor = "white";
	div.style.color = "black";
	div.style.border = "1px solid black";
	div.style.borderRadius = "10px";
	div.style.fontFamily = "Menlo, Consolas, monospace";
	div.style.fontSize = "large";
	div.style.padding = "2rem";
	div.style.lineHeight = "1.2";
	div.style.whiteSpace = "pre-wrap";
	div.style.overflow = "auto";
	iframe.contentDocument.body.appendChild(div);
	return div;
}

var statusIframe = null;
var statusDiv = null;
var lastOnStatusDivReady = null;

function ensureStatusDivExists(onStatusDivReady) {
	if (statusDiv) {
		// Everything is ready, call the callback right away.
		onStatusDivReady(statusDiv);
		return;
	}

	// Creating an iframe may be asynchronous so we'll schedule the callback.
	// In case of multiple calls, last callback wins.
	lastOnStatusDivReady = onStatusDivReady;

	if (statusIframe) {
		// We're already creating it.
		return;
	}

	// Create iframe and, when it is ready, a div inside it.
	statusIframe = createStatusIframe(function onIframeLoad() {
		statusDiv = addStatusDivTo(statusIframe);
		// Now we can talk!
		lastOnStatusDivReady(statusDiv);
	});

	// Zalgo alert: onIframeLoad() will be called either synchronously
	// or asynchronously depending on the browser.
	// We delay adding it so `statusIframe` is set when `onIframeLoad` fires.
	document.body.appendChild(statusIframe);
}

function showStatus(status) {
	if(!statusDiv) title = document.title;
	document.title = status;
	ensureStatusDivExists(function onStatusDivReady(statusDiv) {
		statusDiv.innerHTML = "Status: " + ansiHTML(entities.encode(status));
	});
}

function destroyStatus() {
	if (!statusDiv) {
		// It is not there in the first place.
		return;
	}

	// Clean up and reset internal state.
	document.title = title;
	document.body.removeChild(statusIframe);
	statusDiv = null;
	statusIframe = null;
	lastOnStatusDivReady = null;
}

// Successful compilation.
exports.clear = function handleSuccess() {
	destroyStatus();
}

// Compilation with errors (e.g. syntax error or missing modules).
exports.showStatus = function handleStatus(status) {
	showStatus(status);
}
