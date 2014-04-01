#!/usr/bin/env node

var path = require("path");
var Server = require("../lib/Server");
var webpack = require("webpack");

var optimist = require("optimist")

	.usage("webpack-dev-server " + require("../package.json").version + "\n" +
			"Usage: https://github.com/webpack/docs/wiki/webpack-detailed-usage")

	.boolean("colors").alias("colors", "c").describe("colors")

	.boolean("info").describe("info").default("info", true)

	.boolean("quiet").describe("quiet")

	.string("content-base").describe("content-base", "A directory or URL to serve HTML content from.")

	.string("proxy-from").describe("proxy-from", "A relative path from where you want to use the reverse proxy. Ex. /api/. You need also to provide proxy-to.")

	.string("proxy-target").describe("proxy-target", "The full path of the proxy target. Ex. http://localhost:3000. You need also to provide proxy-from")

	.describe("port", "The port").default("port", 8080);

require("webpack/bin/config-optimist")(optimist);

var argv = optimist.argv;

var options = {};

var wpOpt = require("webpack/bin/convert-argv")(optimist, argv, { outputFilename: "/bundle.js" });

options.publicPath = wpOpt.output.publicPath || "";
options.outputPath = wpOpt.output.path = "/";
options.filename = wpOpt.output.filename;
options.hot = wpOpt.hot;

if(options.publicPath[0] !== "/")
	options.publicPath = "/" + options.publicPath;

if(argv["content-base"]) {
	options.contentBase = argv["content-base"];
	if(!/^(https?:)?\/\//.test(options.contentBase))
		options.contentBase = path.resolve(options.contentBase);
} else {
	options.contentBase = process.cwd();
}

if(argv["proxy-from"] && argv["proxy-target"]) {
	options.reverseProxy = {
		from: argv["proxy-from"],
		target: argv["proxy-target"]
	};
}

if(argv["colors"])
	options.stats = { colors: true };

if(!argv["info"])
	options.noInfo = true;

if(argv["quiet"])
	options.quiet = true;

new Server(webpack(wpOpt), options).listen(argv.port, function(err) {
	if(err) throw err;
	console.log("http://localhost:" + argv.port + "/webpack-dev-server/");
	console.log("webpack result is served from " + options.publicPath);
	console.log("content is served from " + options.contentBase);
	if (options.reverseProxy) {
		console.log("reverse proxy forwards content from " + options.reverseProxy.from + " to " + options.reverseProxy.target);
	} else if (argv["proxy-from"] || argv["proxy-target"]) {
		console.log("WARNING: please provide both \"proxy-from\" and \"proxy-target\"");
	}
});