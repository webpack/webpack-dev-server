"use strict";

const Webpack = require("webpack");
const WebpackDevServer = require("../../lib/Server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
	stats: {
		colors: true
	},
	setup: function(app) {
		app.use(function(req, res, next) {
			console.log(`Using middleware for ${req.url}`);
			next();
		});
	}
});

server.listen(8080, "127.0.0.1", function() {
	console.log("Starting server on http://localhost:8080");
});
