module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		overlay: {
			errors: true,
			warnings: true
		}
	}
}
