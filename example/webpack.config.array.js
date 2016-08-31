var webpack = require("webpack");
module.exports = [
	{
		context: __dirname,
		entry: "./app.js",
		module: {
			loaders: [
				{ test: /\.less$/, loader: "style!css!less" },
				{ test: /\.png$/, loader: "file?prefix=img/" }
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
			loaders: [
				{ test: /\.less$/, loader: "style!css!less" },
				{ test: /\.png$/, loader: "url?limit=100000" }
			]
		},
		plugins: [
			new webpack.optimize.UglifyJsPlugin()
		]
	}
]
