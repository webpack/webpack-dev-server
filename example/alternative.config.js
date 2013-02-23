module.exports = {
	entry: "./app.js",
	module: {
		loaders: [
			{ test: /\.less$/, loader: "style!css!less" },
			{ test: /\.png$/, loader: "url?limit=100000" }
		]
	},
	optimize: {
		minimize: true
	}
}