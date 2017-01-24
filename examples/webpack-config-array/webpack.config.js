"use strict";

const webpack = require("webpack");
module.exports = [
	{
		context: __dirname,
		entry: "./app.js",
		module: {
			rules: [
				{
					test: /\.less$/,
					use: [
						"style",
						"css",
						"less"
					]
				},
				{
					test: /\.png$/,
					loader: "file",
					options: { prefix: "img/" }
				}
			]
		}
	},
	{
		context: __dirname,
		entry: "./app.js",
		output: {
			filename: "bundle2.js"
		},
		module: {
			rules: [
				{
					test: /\.less$/,
					use: [
						"style",
						"css",
						"less"
					]
				},
				{
					test: /\.png$/,
					loader: "url",
					options: { limit: 100000 }
				}
			]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin()
		]
	}
]
