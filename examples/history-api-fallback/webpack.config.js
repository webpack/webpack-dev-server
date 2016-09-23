module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		historyApiFallback: {
			disableDotRule: true
		}
	}
}
