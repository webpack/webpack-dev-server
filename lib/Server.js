var fs = require("fs");
var path = require("path");
var webpackDevMiddleware = require("webpack-dev-middleware");
var express = require("express");
var socketio = require("socket.io");
var StreamCache = require("stream-cache");
var httpProxy = require("http-proxy");
var proxy = new httpProxy.createProxyServer();
var serveIndex = require("serve-index");
var historyApiFallback = require("connect-history-api-fallback");

function Server(compiler, options) {

	// Default options
	if(!options) options = {};
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

	// serve webpack bundle
	app.use(this.middleware = webpackDevMiddleware(compiler, options));

	app.get("/__webpack_dev_server__/live.bundle.js", function(req, res) {
		res.setHeader("Content-Type", "application/javascript");
		liveJs.pipe(res);
	});

	app.get("/webpack-dev-server.js", function(req, res) {
		res.setHeader("Content-Type", "application/javascript");
		inlinedJs.pipe(res);
	});

	app.get("/webpack-dev-server/*", function(req, res) {
		res.setHeader("Content-Type", "text/html");
		this.livePage.pipe(res);
	}.bind(this));

	app.get("/webpack-dev-server", function(req, res) {
		res.setHeader("Content-Type", "text/html");
		res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>');
		var path = this.middleware.getFilenameFromUrl(options.publicPath || "/");
		var fs = this.middleware.fileSystem;
		function writeDirectory(baseUrl, basePath) {
			var content = fs.readdirSync(basePath);
			res.write("<ul>");
			content.forEach(function(item) {
				var p = basePath + "/" + item;
				if(fs.statSync(p).isFile()) {
					res.write('<li><a href="');
					res.write(baseUrl + item);
					res.write('">');
					res.write(item);
					res.write('</a></li>');
					if(/\.js$/.test(item)) {
						var htmlItem = item.substr(0, item.length - 3);
						res.write('<li><a href="');
						res.write(baseUrl + htmlItem);
						res.write('">');
						res.write(htmlItem);
						res.write('</a> (magic html for ');
						res.write(item);
						res.write(') (<a href="');
						res.write(baseUrl.replace(/(^(https?:\/\/[^\/]+)?\/)/, "$1webpack-dev-server/") + htmlItem);
						res.write('">webpack-dev-server</a>)</li>');
					}
				} else {
					res.write('<li>');
					res.write(item);
					res.write('<br>');
					writeDirectory(baseUrl + item + "/", p);
					res.write('</li>');
				}
			});
			res.write("</ul>");
		}
		writeDirectory(options.publicPath || "/", path);
		res.end('</body></html>');
	}.bind(this));

	if (options.historyApiFallback) {
		// Fall back to /index.html if nothing else matches.
		app.use(historyApiFallback);
	}

	if(options.contentBase !== false) {
		var contentBase = options.contentBase || process.cwd();

		if(typeof contentBase === "object") {
			// Proxy every request to contentBase.target
			app.all("*", function(req, res) {
				proxy.web(req, res, contentBase, function(err) {
					var msg = "cannot proxy to " + contentBase.target + " (" + err.message + ")";
					this.io.sockets.emit("proxy-error", [msg]);
				}.bind(this));
			}.bind(this));
		} else if(/^(https?:)?\/\//.test(contentBase)) {
			// Redirect every request to contentBase
			app.get("*", function(req, res) {
				res.writeHead(302, {
					'Location': contentBase + req.path + (req._parsedUrl.search || "")
				});
				res.end();
			}.bind(this));
		} else if(typeof contentBase === "number") {
			// Redirect every request to the port contentBase
			app.get("*", function(req, res) {
				res.writeHead(302, {
					'Location': "//localhost:" + contentBase + req.path + (req._parsedUrl.search || "")
				});
				res.end();
			}.bind(this));
		} else {
			// route content request
			app.get("*", this.serveMagicHtml.bind(this), express.static(contentBase), serveIndex(contentBase));
		}
	}
}

Server.prototype.use = function() {
	this.app.use.apply(this.app, arguments);
}

// delegate listen call and init socket.io
Server.prototype.listen = function() {
	var listeningApp = this.listeningApp =
		this.app.listen.apply(this.app, arguments);
	this.io = socketio.listen(listeningApp, {
		"log level": 1
	});
	this.io.sockets.on("connection", function(socket) {
		if(this.hot) socket.emit("hot");
		if(!this._stats) return;
		this._sendStats(socket, this._stats.toJson(), true);
	}.bind(this));
}

Server.prototype.serveMagicHtml = function(req, res, next) {
	var _path = req.path;
	try {
		if(!this.middleware.fileSystem.statSync(this.middleware.getFilenameFromUrl(_path + ".js")).isFile())
			return next();
		// Serve a page that executes the javascript
		res.write('<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="');
		res.write(_path);
		res.write('.js');
		res.write(req._parsedUrl.search || "");
		res.end('"></script></body></html>');
	} catch(e) { return next(); }
}

// send stats to a socket or multiple sockets
Server.prototype._sendStats = function(socket, stats, force) {
	if(!force && stats && stats.assets && stats.assets.every(function(asset) {
		return !asset.emitted;
	})) return;
	socket.emit("hash", stats.hash);
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
