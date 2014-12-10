var io = require("./web_modules/socket.io");
var scriptElements = document.getElementsByTagName("script");
io = io.connect(typeof __resourceQuery === "string" && __resourceQuery ?
	__resourceQuery.substr(1) :
	scriptElements[scriptElements.length-1].getAttribute("src").replace(/\/[^\/]+$/, "")
);

var hot = false;
var initial = true;
var currentHash = "";

io.on("hot", function() {
	hot = true;
	console.log("[WDS] Hot Module Replacement enabled.");
});

io.on("invalid", function() {
	console.log("[WDS] App updated. Recompiling...");
});

io.on("hash", function(hash) {
	currentHash = hash;
});

io.on("ok", function() {
	if(initial) return initial = false;
	reloadApp();
});

io.on("warnings", function(warnings) {
	console.log("[WDS] Warnings while compiling.");
	for(var i = 0; i < warnings.length; i++)
		console.warn(warnings[i]);
	if(initial) return initial = false;
	reloadApp();
});

io.on("errors", function(errors) {
	console.log("[WDS] Errors while compiling.");
	for(var i = 0; i < errors.length; i++)
		console.error(errors[i]);
	if(initial) return initial = false;
	reloadApp();
});

io.on("proxy-error", function(errors) {
	console.log("[WDS] Proxy error.");
	for(var i = 0; i < errors.length; i++)
		console.error(errors[i]);
	if(initial) return initial = false;
	reloadApp();
});

io.on("disconnect", function() {
	console.error("[WDS] Disconnected!");
});

function reloadApp() {
	if(hot) {
		console.log("[WDS] App hot update...");
		window.postMessage("webpackHotUpdate" + currentHash, "*");
	} else {
		console.log("[WDS] App updated. Reloading...");
		window.location.reload();
	}
}