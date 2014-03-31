var fs = require("fs");
var path = require("path");
var webpackDevMiddleware = require("webpack-dev-middleware");
var express = require("express");
var socketio = require("socket.io");
var StreamCache = require("stream-cache");
var mime = require("mime");

function Server(compiler, options) {

	// Default options
	if(!options) options = {};
	this.contentBase = options.contentBase || process.cwd();
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
	var livePage = this.livePage = new StreamCache();
	fs.createReadStream(path.join(__dirname, "..", "client", "live.html")).pipe(livePage);

	// Prepare the live js file
	var liveJs = new StreamCache();
	fs.createReadStream(path.join(__dirname, "..", "client", "live.bundle.js")).pipe(liveJs);

	// Prepare the inlined js file
	var inlinedJs = new StreamCache();
	fs.createReadStream(path.join(__dirname, "..", "client", "index.bundle.js")).pipe(inlinedJs);

	// Init express server
	var app = this.app = new express();

	app.configure(function() {
		// serve webpack bundle
		app.use(this.middleware = webpackDevMiddleware(compiler, options));
	}.bind(this));

	app.get("/__webpack_dev_server__/live.bundle.js", function(req, res) {
		liveJs.pipe(res);
	});

	app.get("/webpack-dev-server.js", function(req, res) {
		inlinedJs.pipe(res);
	});

	app.get("/webpack-dev-server/*", function(req, res) {
		this.livePage.pipe(res);
	}.bind(this));

	// route content request
	app.get("*", this.serveContent.bind(this));
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

Server.prototype.serveContent = function(req, res, next) {
	var _path = req.path;
	if(_path === "/") _path = "";
	var target = this.contentBase + _path;
	if(/^(https?:)?\/\//.test(target)) {
		res.writeHead(302, {
			'Location': target + (req._parsedUrl.search || "")
		});
		res.end();
	} else {
		fs.stat(target, function(err, stat) {
			function checkFile(filename) {
				try {
					return this.middleware.fileSystem.statSync(filename).isFile();
				} catch(e) { return false; }
			}
			if(!err && stat.isFile()) {
				res.setHeader("Content-Type", mime.lookup(_path));
				fs.createReadStream(target).pipe(res);
			} else if(!err && stat.isDirectory()) {
				res.writeHead(302, {
					'Location': req.path + (/\/$/.test(_path) || !_path ? "index.html" : "/") + (req._parsedUrl.search || "")
				});
				res.end();
			} else if(checkFile.call(this, this.middleware.getFilenameFromUrl(_path + ".js"))) {
				// Serve a page that executes the javascript
				res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="');
				res.write(_path);
				res.write('.js');
				res.write(req._parsedUrl.search || "");
				res.end('"></script></body></html>');
			} else next();
		}.bind(this));
	}
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