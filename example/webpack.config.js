module.exports = {
	context: __dirname,
	entry: "./app.js",
	module: {
		loaders: [
			{ test: /\.less$/, loader: "style!css!less" },
			{ test: /\.png$/, loader: "file" }
		]
	}
}