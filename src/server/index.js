
const server = require('webpack-dev-server')

const path = require('path')
const url = require("url");
// const open = require("open");
const fs = require("fs");

// const express = require('express')
const webpack = require('webpack')
// const devpack = require('webpack-dev-middleware')
require('isomorphic-fetch')

let debug = require('debug')('magic--:server')
let error = require('debug')('magic--:error')


module.exports = function(config, port){
  // debug("starting server with config" + JSON.stringify(config, undefined, 2))
  //
  // let app = express();
  // let compiler = webpack(config);
  //
  // app.use(devpack(compiler, {
  //   noInfo: true,
  //   publicPath: config.output.publicPath
  // }))
  // //
  // // app.get('*', function(req, res) {
  // //   res.sendFile(path.join(__dirname, 'index.html'))
  // // })
  //
  // app.listen(port, 'localhost', function(err) {
  //   if (err) return error(err)
  //   console.log(`Listening at http://localhost:${port}`);
  // });
  // require('fs').writeFileSync('./src/server/webpack.config.js', JSON.stringify(config, undefined,2))













// --- webpack-dev-server-cmd



// Local version replaces global one
// try {
// 	var localWebpackDevServer = require.resolve(path.join(process.cwd(), "node_modules", "webpack-dev-server", "bin", "webpack-dev-server.js"));
// 	if(__filename !== localWebpackDevServer) {
// 		return require(localWebpackDevServer);
// 	}
// } catch(e) {}



var ADVANCED_GROUP = "Advanced options:";
var DISPLAY_GROUP = "Stats options:";
var SSL_GROUP = "SSL options:";
var CONNECTION_GROUP = "Connection options:";
var RESPONSE_GROUP = "Response options:";


var argv = {watch:true, progress:true, colors:true, port:'4000', https:false, inline:true, 'content-base':'dist/', compress:true, host:'localhost' }

var wpOpt = config

function processOptions(wpOpt) {
	//process Promise
	if(typeof wpOpt.then === "function") {
		wpOpt.then(processOptions).catch(function(err) {
			if (err) console.error("wtf" + err.stack || err);
			process.exit(); // eslint-disable-line
		});
		return;
	}

	var firstWpOpt = Array.isArray(wpOpt) ? wpOpt[0] : wpOpt;

	var options = wpOpt.devServer || firstWpOpt.devServer || {};

	if(argv.host !== "localhost" || !options.host)
		options.host = argv.host;

	if(argv.public)
		options.public = argv.public;

	if(argv.port !== 8080 || !options.port)
		options.port = argv.port;

	if(!options.publicPath) {
		options.publicPath = firstWpOpt.output && firstWpOpt.output.publicPath || "";
		if(!/^(https?:)?\/\//.test(options.publicPath) && options.publicPath[0] !== "/")
			options.publicPath = "/" + options.publicPath;
	}

	if(!options.outputPath)
		options.outputPath = "/";
	if(!options.filename)
		options.filename = firstWpOpt.output && firstWpOpt.output.filename;
	[].concat(wpOpt).forEach(function(wpOpt) {
		wpOpt.output.path = "/";
	});

	if(!options.watchOptions)
		options.watchOptions = firstWpOpt.watchOptions;

	if(argv["stdin"]) {
		process.stdin.on('end', function() {
			process.exit(0);
		});
		process.stdin.resume();
	}

	if(!options.watchDelay && !options.watchOptions) // TODO remove in next major version
		options.watchDelay = firstWpOpt.watchDelay;

	if(!options.hot)
		options.hot = argv["hot"];

	if(!options.hotOnly)
		options.hotOnly = argv["hot-only"];

	if(argv["content-base"]) {
		options.contentBase = argv["content-base"];
		if(/^[0-9]$/.test(options.contentBase))
			options.contentBase = +options.contentBase;
		else if(!/^(https?:)?\/\//.test(options.contentBase))
			options.contentBase = path.resolve(options.contentBase);
	} else if(argv["content-base-target"]) {
		options.contentBase = {
			target: argv["content-base-target"]
		};
	} else if(!options.contentBase) {
		options.contentBase = process.cwd();
	}

	if(!options.stats) {
		options.stats = {
			cached: false,
			cachedAssets: false
		};
	}

	if(typeof options.stats === "object" && typeof options.stats.colors === "undefined")
		options.stats.colors = require("supports-color");

	if(argv["lazy"])
		options.lazy = true;

	if(!argv["info"])
		options.noInfo = true;

	if(argv["quiet"])
		options.quiet = true;

	if(argv["https"])
		options.https = true;

	if(argv["cert"])
		options.cert = fs.readFileSync(path.resolve(argv["cert"]));

	if(argv["key"])
		options.key = fs.readFileSync(path.resolve(argv["key"]));

	if(argv["cacert"])
		options.cacert = fs.readFileSync(path.resolve(argv["cacert"]));

	if(argv["inline"] === false)
		options.inline = false;

	if(argv["history-api-fallback"])
		options.historyApiFallback = true;

	if(argv["compress"])
		options.compress = true;

	if(argv["open"])
		options.open = true;

	var protocol = options.https ? "https" : "http";

	if(options.inline !== false) {
		var devClient = [require.resolve("./client/") + "?" + protocol + "://" + (options.public || (options.host + ":" + options.port))];

		if(options.hotOnly)
			devClient.push("webpack/hot/only-dev-server");
		else if(options.hot)
			devClient.push("webpack/hot/dev-server");

	}



  // --- webpack-dev-server server

    var Server = require("./Server");


	new Server(webpack(wpOpt), options).listen(options.port, options.host, function(err) {
		if(err) throw err;

		var uri = protocol + "://" + options.host + ":" + options.port + "/";
		if(options.inline === false)
			uri += "webpack-dev-server/";
		console.log(" " + uri);

		console.log("webpack result is served from " + options.publicPath);
		if(Array.isArray(options.contentBase))
			console.log("content is served from " + options.contentBase.join(", "));
		else if(typeof options.contentBase === "object")
			console.log("requests are proxied to " + options.contentBase.target);
		else
			console.log("content is served from " + options.contentBase);
		if(options.historyApiFallback)
			console.log("404s will fallback to %s", options.historyApiFallback.index || "/index.html");
		if(options.open)
			open(uri);
	});
}

processOptions(wpOpt);



}
