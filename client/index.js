var url = require('url');
var SockJS = require("sockjs-client");
var stripAnsi = require('strip-ansi');
var scriptElements = document.getElementsByTagName("script");

var urlParts = url.parse(typeof __resourceQuery === "string" && __resourceQuery ?
	__resourceQuery.substr(1) :
	scriptElements[scriptElements.length-1].getAttribute("src").replace(/\/[^\/]+$/, "")
);

var recInterval = null;
var sock = null;

var newConnection = function() {
	sock = new SockJS(url.format({
		protocol: urlParts.protocol,
		auth: urlParts.auth,
		hostname: (urlParts.hostname === '0.0.0.0') ? window.location.hostname : urlParts.hostname,
		port: urlParts.port,
		pathname: urlParts.path === '/' ? "/sockjs-node" : urlParts.path
	}));

	clearInterval(recInterval);

	sock.onclose = function() {
		console.error("[WDS] Disconnected!");

		// Try to reconnect.
		sock = null;
		recInterval = setInterval(function () {
			newConnection();
		}, 2000);
	};

	sock.onmessage = function(e) {
		// This assumes that all data sent via the websocket is JSON.
		var msg = JSON.parse(e.data);
		onSocketMsg[msg.type](msg.data);
	};
};

newConnection();

var hot = false;
var initial = true;
var currentHash = "";

function reloadApp() {
	if(hot) {
		console.log("[WDS] App hot update...");
		window.postMessage("webpackHotUpdate" + currentHash, "*");
	} else {
		console.log("[WDS] App updated. Reloading...");
		window.location.reload();
	}
}
