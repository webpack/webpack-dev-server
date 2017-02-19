"use strict";

module.exports = [
	{
		devtool: "source-map",
		target: "web",
		entry: "./web.js",
		output: {
			filename: "web.bundle.js",
			path: __dirname
		}
	},
	{
		devtool: "source-map",
		target: "webworker",
		entry: "./worker.js",
		output: {
			filename: "worker.bundle.js",
			path: __dirname
		}
	}
];
