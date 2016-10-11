module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		contentBase: [
			"assets",
			"css",
		]
	}
}
