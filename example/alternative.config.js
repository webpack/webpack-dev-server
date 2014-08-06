var webpack = require("webpack");
module.exports = {
	entry: "./app.js",
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