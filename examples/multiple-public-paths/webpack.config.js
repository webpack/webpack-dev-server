module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		publicPath: ["/public-1/", "/public-2/"]
	}
}
