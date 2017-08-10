//the code was copied from overlay.js and modified for status display
var ansiHTML = require("ansi-html");
var Entities = require("html-entities").AllHtmlEntities;
var entities = new Entities();

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
	var status = iframe.contentDocument.createElement("div");
	div.id = "webpack-dev-server-client-status-div";
	div.style.position = "fixed";
	div.style.boxSizing = "border-box";
	div.style.top = "37.5%";
	div.style.right = "33.3%";
	div.style.bottom = "37.5%";
	div.style.left = "33.3%";
	//div.style.backgroundColor = "rgba(141, 214, 249, 0.5)"; //this would be the second webpack default color, doesn't look that great thou
	div.style.backgroundColor = "white";
	div.style.color = "black";
	div.style.border = "1px solid black";
	div.style.borderRadius = "0.25em";
	div.style.fontFamily = "Menlo, Consolas, monospace";
	div.style.fontSize = "large";
	div.style.padding = "2rem";
	div.style.lineHeight = "1.2";
	div.style.whiteSpace = "pre-wrap";
	div.style.overflow = "auto";

	status.id = "webpack-dev-server-client-status-div-status";

	div.status = status;
	div.appendChild(status);
	iframe.contentDocument.body.appendChild(div);
	return div;
}

function addProgressDivTo(statusDiv, iframe) {
	var div = iframe.contentDocument.createElement("div");
	var progress = iframe.contentDocument.createElement("div");
	var progressText = iframe.contentDocument.createElement("div");

	div.id = "webpack-dev-server-client-progress-div";
	div.style.position = "absolute";
	div.style.left = "2em";
	div.style.right = "2em";
	div.style.top = "60%";
	div.style.bottom = "30%";
	div.style.backgroundColor = "transparent";
	div.style.border = "2px solid black";
	div.style.display = "inline-block";

	progress.id = "webpack-dev-server-client-progress-div-progress";
	progress.style.position = "absolute";
	progress.style.left = "0";
	progress.style.bottom = "0";
	progress.style.width = "0%";
	progress.style.height = "100%";
	progress.style.backgroundColor = "#1D78C1";

	progressText.id = "webpack-dev-server-client-progress-div-text";
	progressText.style.position = "absolute";
	progressText.style.left = "2em";
	progressText.style.right = "2em";
	progressText.style.top = "50%";
	progressText.style.bottom = "40%";
	progressText.style.backgroundColor = "transparent";
	progressText.style.textAlign = "center";

	div.progress = progress;
	div.progressText = progressText;
	div.appendChild(progress);
	statusDiv.appendChild(progressText);
	statusDiv.appendChild(div);
	return div;
}

var statusIframe = null;
var statusDiv = null;
var lastOnStatusDivReady = null;
var progressDiv = null;
var title = null;

function ensureStatusDivExists(onStatusDivReady) {
	if(statusDiv) {
		// Everything is ready, call the callback right away.
		onStatusDivReady(statusDiv);
		return;
	}

	// Creating an iframe may be asynchronous so we'll schedule the callback.
	// In case of multiple calls, last callback wins.
	lastOnStatusDivReady = onStatusDivReady;

	if(statusIframe) {
		// We're already creating it.
		return;
	}

	// Create iframe and, when it is ready, a div inside it.
	statusIframe = createStatusIframe(function onIframeLoad() {
		statusDiv = addStatusDivTo(statusIframe);
		progressDiv = addProgressDivTo(statusDiv, statusIframe);
		// Now we can talk!
		lastOnStatusDivReady(statusDiv);
	});

	// Zalgo alert: onIframeLoad() will be called either synchronously
	// or asynchronously depending on the browser.
	// We delay adding it so `statusIframe` is set when `onIframeLoad` fires.
	document.body.appendChild(statusIframe);
}

function showStatus(status) {
	ensureStatusDivExists(function onStatusDivReady(statusDiv) {
		statusDiv.status.innerHTML = "Status: " + ansiHTML(entities.encode(status));
	});
}

function clearProgress() {
	progressDiv.style.display = "none";
	progressDiv.progressText.innerHTML = "";
	if(title !== null) document.title = title;
}

function updateProgress(percent) {
	ensureStatusDivExists(function onStatusDivReady() {
		progressDiv.style.display = "inline-block";
		progressDiv.progress.style.width = percent + "%";
		progressDiv.progressText.innerHTML = percent + "% completed";
		if(title === null || !document.title.startsWith("Compiling")) {
			title = document.title;
		}
		document.title = "Compiling: " + percent + "% completed";
	});
}

function destroyStatus() {
	if(!statusDiv) {
		// It is not there in the first place.
		return;
	}

	// Clean up and reset internal state.
	document.body.removeChild(statusIframe);
	statusDiv = null;
	statusIframe = null;
	lastOnStatusDivReady = null;
	progressDiv = null;
	if(title !== null) document.title = title;
	title = null;
}

// Successful compilation.
exports.clear = function handleSuccess() {
	destroyStatus();
}

// Compilation with errors (e.g. syntax error or missing modules).
exports.showStatus = function handleStatus(status) {
	showStatus(status);
	clearProgress();
}

exports.updateStatus = function handleUpdate(data) {
	if(data.msg) {
		showStatus(data.msg);
		updateProgress(data.percent);
	}
}
