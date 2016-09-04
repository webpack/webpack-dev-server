/* global __resourceQuery */
var url = require('url');
var SockJS = require("sockjs-client");
var stripAnsi = require('strip-ansi');

function getCurrentScriptSource() {
	// `document.currentScript` is the most accurate way to find the current script,
	// but is not supported in all browsers.
	if(document.currentScript)
		return document.currentScript.getAttribute("src");
	// Fall back to getting all scripts in the document.
	var scriptElements = document.scripts || [];
	var currentScript = scriptElements[scriptElements.length - 1];
	if(currentScript)
		return currentScript.getAttribute("src");
	// Fail as there was no script to use.
	throw new Error("[WDS] Failed to get current script source");
}

var urlParts;
if(typeof __resourceQuery === "string" && __resourceQuery) {
	// If this bundle is inlined, use the resource query to get the correct url.
	urlParts = url.parse(__resourceQuery.substr(1));
} else {
	// Else, get the url from the <script> this file was called with.
	var scriptHost = getCurrentScriptSource();
	scriptHost = scriptHost.replace(/\/[^\/]+$/, "");
	urlParts = url.parse((scriptHost ? scriptHost : "/"), false, true);
}

var sock = null;
var hot = false;
var initial = true;
var connected = false;
var currentHash = "";
var logLevel = "info";

function log(level, msg) {
	if(logLevel === "info" && level === "info")
		return console.log(msg);
	if(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning")
		return console.warn(msg);
	if(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error")
		return console.error(msg);
}

var onSocketMsg = {
	hot: function() {
		hot = true;
		log("info", "[WDS] Hot Module Replacement enabled.");
	},
	invalid: function() {
		log("info", "[WDS] App updated. Recompiling...");
	},
	hash: function(hash) {
		currentHash = hash;
	},
	"still-ok": function() {
		log("info", "[WDS] Nothing changed.")
	},
	"log-level": function(level) {
		logLevel = level;
	},
	ok: function() {
		if(initial) return initial = false;
		reloadApp();
	},
	warnings: function(warnings) {
		log("info", "[WDS] Warnings while compiling.");
		for(var i = 0; i < warnings.length; i++)
			console.warn(stripAnsi(warnings[i]));
		if(initial) return initial = false;
		reloadApp();
	},
	errors: function(errors) {
		log("info", "[WDS] Errors while compiling.");
		for(var i = 0; i < errors.length; i++)
			console.error(stripAnsi(errors[i]));
		if(initial) return initial = false;
		reloadApp();
	},
	"proxy-error": function(errors) {
		log("info", "[WDS] Proxy error.");
		for(var i = 0; i < errors.length; i++)
			log("error", stripAnsi(errors[i]));
		if(initial) return initial = false;
	}
};

var newConnection = function() {
	sock = new SockJS(url.format({
		protocol: (window.location.protocol === "https:" || urlParts.hostname === '0.0.0.0') ? window.location.protocol : urlParts.protocol,
		auth: urlParts.auth,
		hostname: (urlParts.hostname === '0.0.0.0') ? window.location.hostname : urlParts.hostname,
		port: (urlParts.port === '0') ? window.location.port : urlParts.port,
		pathname: urlParts.path == null || urlParts.path === '/' ? "/sockjs-node" : urlParts.path
	}));

	sock.onclose = function() {
		if(connected)
			log("error", "[WDS] Disconnected!");

		connected = false;

		// Try to reconnect.
		sock = null;
		setTimeout(function() {
			newConnection();
		}, 2000);
	};

	sock.onmessage = function(e) {
		connected = true;
		// This assumes that all data sent via the websocket is JSON.
		var msg = JSON.parse(e.data);
		onSocketMsg[msg.type](msg.data);
	};
};

newConnection();

function reloadApp() {
	if(hot) {
		log("info", "[WDS] App hot update...");
		var hotEmitter = require("webpack/hot/emitter");
		hotEmitter.emit("webpackHotUpdate", currentHash);
		if(typeof window !== "undefined") {
			// broadcast update to window
			window.postMessage("webpackHotUpdate" + currentHash, "*");
		}
	} else {
		log("info", "[WDS] App updated. Reloading...");
		window.location.reload();
	}
}
