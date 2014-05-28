var io = require("socket.io");
var scriptElements = document.getElementsByTagName("script");
io = io.connect(typeof __resourceQuery === "string" && __resourceQuery ?
	__resourceQuery.substr(1) :
	scriptElements[scriptElements.length-1].getAttribute("src").replace(/\/[^\/]+$/, "")
);

var hot = false;
var initial = true;

io.on("hot", function() {
	hot = true;
	console.log("webpack-dev-server: Hot Module Replacement enabled.");
});

io.on("invalid", function() {
	console.log("webpack-dev-server: App updated. Recompiling...");
});

io.on("ok", function() {
	if(initial) return initial = false;
	reloadApp();
});

io.on("warnings", function(warnings) {
	console.log("webpack-dev-server: Warnings while compiling.");
	for(var i = 0; i < warnings.length; i++)
		console.warn(warnings[i]);
	if(initial) return initial = false;
	reloadApp();
});

io.on("errors", function(errors) {
	console.log("webpack-dev-server: Errors while compiling.");
	for(var i = 0; i < errors.length; i++)
		console.error(errors[i]);
	if(initial) return initial = false;
	reloadApp();
});

io.on("disconnect", function() {
	console.error("webpack-dev-server: Disconnected!");
});

function reloadApp() {
	if(hot) {
		console.log("webpack-dev-server: App hot update...");
		window.postMessage("webpackHotUpdate", "*");
	} else {
		console.log("webpack-dev-server: App updated. Reloading...");
		window.location.reload();
	}
}