#!/usr/bin/env node

var path = require("path");
var url = require("url");

// Local version replaces global one
try {
	var localWebpackDevServer = require.resolve(path.join(process.cwd(), "node_modules", "webpack-dev-server", "bin", "webpack-dev-server.js"));
	if(__filename !== localWebpackDevServer) {
		return require(localWebpackDevServer);
	}
} catch(e) {}

var Server = require("../lib/Server");
var webpack = require("webpack");

var optimist = require("optimist")

	.usage("webpack-dev-server " + require("../package.json").version + "\n" +
			"Usage: https://github.com/webpack/docs/wiki/webpack-detailed-usage")

	.boolean("colors").alias("colors", "c").describe("colors")

	.boolean("lazy").describe("lazy")

	.boolean("info").describe("info").default("info", true)

	.boolean("quiet").describe("quiet")

	.boolean("inline").describe("inline", "Inlines the webpack-dev-server logic into the bundle.")

	.boolean("https").describe("https")

	.string("content-base").describe("content-base", "A directory or URL to serve HTML content from.")

	.string("content-base-target").describe("content-base-target", "Proxy requests to this target.")

	.boolean("history-api-fallback").describe("history-api-fallback", "Fallback to /index.html for Single Page Applications.")

	.describe("port", "The port").default("port", 8080)

	.describe("host", "The hostname/ip addresse the server will bind to").default("host", "localhost");

require("webpack/bin/config-optimist")(optimist);

var argv = optimist.argv;

var wpOpt = require("webpack/bin/convert-argv")(optimist, argv, { outputFilename: "/bundle.js" });

var options = wpOpt.devServer || {};

if(!options.publicPath) {
	options.publicPath = wpOpt.output && wpOpt.output.publicPath || "";
	if(!/^(https?:)?\/\//.test(options.publicPath) && options.publicPath[0] !== "/")
		options.publicPath = "/" + options.publicPath;
}

if(!options.outputPath)
	options.outputPath = "/";
if(!options.filename)
	options.filename = wpOpt.output && wpOpt.output.filename;
[].concat(wpOpt).forEach(function(wpOpt) {
	wpOpt.output.path = "/";
});
if(!options.hot)
	options.hot = argv["hot"];

if(argv["content-base"]) {
	options.contentBase = argv["content-base"];
	if(/^[0-9]$/.test(options.contentBase))
		options.contentBase = +options.contentBase;
	else if(!/^(https?:)?\/\//.test(options.contentBase))
		options.contentBase = path.resolve(options.contentBase);
} else if(argv["content-base-target"]) {
	options.contentBase = { target: argv["content-base-target"] };
} else if(!options.contentBase) {
	options.contentBase = process.cwd();
}
if(!options.stats) {
	options.stats = {
		cached: false,
		cachedAssets: false
	};
}

if(argv["colors"])
	options.stats.colors = true;

if(argv["lazy"])
	options.lazy = true;

if(!argv["info"])
	options.noInfo = true;

if(argv["quiet"])
	options.quiet = true;

if(argv["https"])
	options.https = true;

var protocol = options.https ? "https" : "http";

if(argv["inline"]) {
	var devClient = [require.resolve("../client/") + "?" + protocol + "://" + argv.host + ":" + argv.port];
	if(options.hot)
		devClient.push("webpack/hot/dev-server");
	[].concat(wpOpt).forEach(function(wpOpt) {
		if(typeof wpOpt.entry === "object") {
			Object.keys(wpOpt.entry).forEach(function(key) {
				wpOpt.entry[key] = devClient.concat(wpOpt.entry[key]);
			});
		} else {
			wpOpt.entry = devClient.concat(wpOpt.entry);
		}
	});
}

if(argv["history-api-fallback"])
	options.historyApiFallback = true;

new Server(webpack(wpOpt), options).listen(argv.port, function(err) {
	if(err) throw err;
	if(argv["inline"])
		console.log(protocol + "://" + argv.host + ":" + argv.port + "/");
	else
		console.log(protocol + "://" + argv.host + ":" + argv.port + "/webpack-dev-server/");
	console.log("webpack result is served from " + options.publicPath);
	if(typeof options.contentBase === "object")
		console.log("requests are proxied to " + options.contentBase.target);
	else
		console.log("content is served from " + options.contentBase);
	if(options.historyApiFallback)
		console.log("404s will fallback to /index.html");
});
