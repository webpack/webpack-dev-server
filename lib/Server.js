var fs = require("fs");
var path = require("path");
var webpackDevMiddleware = require("webpack-dev-middleware");
var express = require("express");
var socketio = require("socket.io");
var StreamCache = require("stream-cache");

function Server(compiler, options) {

	// Default options
	if(!options) options = {};
	this.content = options.content && path.resolve(options.content) ||
					path.join(__dirname, "..", "client", "main.html");
	this.contentUrl = options.contentUrl;
	this.hot = options.hot;

	// Listening for events
	var invalidPlugin = function() {
		if(this.io) this.io.sockets.emit("invalid");
	}.bind(this);
	compiler.plugin("compile", invalidPlugin);
	compiler.plugin("invalid", invalidPlugin);
	compiler.plugin("done", function(stats) {
		if(!this.io) return;
		this._sendStats(this.io.sockets, stats.toJson());
		this._stats = stats;
	}.bind(this));

	// Prepare live html page
	var livePage = new StreamCache();
	fs.createReadStream(path.join(__dirname, "..", "client", "live.html")).pipe(livePage);

	// Prepare the live js file
	var liveJs = new StreamCache();
	fs.createReadStream(path.join(__dirname, "..", "client", "live.bundle.js")).pipe(liveJs);

	// Init express server
	var app = this.app = new express();

	app.configure(function() {
		// serve webpack bundle
		app.use(this.middleware = webpackDevMiddleware(compiler, options));
	}.bind(this));

	// route live requests
	app.get("/", function(req, res) {
		livePage.pipe(res);
	});
	app.get("/live.js", function(req, res) {
		liveJs.pipe(res);
	});

	// route content request
	app.get("/content.html", this.serveContent.bind(this));
}

// delegate listen call and init socket.io
Server.prototype.listen = function() {
	var listeningApp = this.listeningApp =
		this.app.listen.apply(this.app, arguments);
	this.io = socketio.listen(listeningApp, {
		"log level": 1
	});
	this.io.on("connection", function(socket) {
		if(this.hot) socket.emit("hot");
		if(!this._stats) return;
		this._sendStats(socket, this._stats.toJson());
	}.bind(this));
}

Server.prototype.serveContent = function(req, res) {
	if(this.contentUrl) {
		res.writeHead(302, {
			'Location': this.contentUrl
		});
		res.end();
	} else
		fs.createReadStream(this.content).pipe(res);
}

// send stats to a socket or multiple sockets
Server.prototype._sendStats = function(socket, stats) {
	if(stats.errors.length > 0)
		socket.emit("errors", stats.errors);
	else if(stats.warnings.length > 0)
		socket.emit("warnings", stats.warnings);
	else
		socket.emit("ok");
}

Server.prototype.invalidate = function() {
	if(this.middleware) this.middleware.invalidate();
}

module.exports = Server;