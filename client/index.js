var url = require("url");
var path = require("path");
var io = require("socket.io");
var scriptElements = document.getElementsByTagName("script");

var urlparts;
var options = {};

urlparts = url.parse(
	scriptElements[scriptElements.length-1].getAttribute("src")
);

// Append tailing slash so that url.resolve works correctly
urlparts.pathname = path.dirname(urlparts.pathname) + '/';

if (typeof __resourceQuery === "string" && __resourceQuery) {
	urlparts = url.parse(url.resolve(url.format(urlparts), __resourceQuery.substr(1)));
} else if (urlparts.search) {
	urlparts.search = '';
	urlparts = url.parse(url.resolve(url.format(urlparts), urlparts.query));
} else {
	// Since we didn't resolve the slash has to be removed
	urlparts.pathname = urlparts.pathname.substr(-1);
}

if (urlparts.path !== '/') {
	// socket.io does not accept a leading slash
	options.resource = urlparts.path.substr(1);
	urlparts.pathname = '';
	urlparts.search = '';
}

io = io.connect(url.format(urlparts), options);

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
