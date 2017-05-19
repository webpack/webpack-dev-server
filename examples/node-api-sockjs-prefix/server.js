"use strict";

const Webpack = require("webpack");
const path = require("path");
const WebpackDevServer = require("../../lib/Server");
const webpackConfig = require("./webpack.config");

const compiler = Webpack(webpackConfig);
const server = new WebpackDevServer(compiler, {
	stats: {
		colors: true
	},
	contentBase: path.resolve(__dirname),
	watchContentBase: true,
	sockjsPrefix: "/subapp",
	publicPath: "/subapp/",
	historyApiFallback: {
		disableDotRule: true,
		index: "/subapp/"
	},
});

server.listen(8080, "127.0.0.1", function() {
	console.log("Starting server on http://localhost:8080");
});
