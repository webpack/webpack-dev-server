module.exports = {
	context: __dirname,
	entry: ["../client?http://localhost:8080", "./app.js"],
	module: {
		loaders: [
			{ test: /\.less$/, loader: "style!css!less" },
			{ test: /\.png$/, loader: "file" }
		]
	}
}