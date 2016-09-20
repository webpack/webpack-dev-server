module.exports = {
	context: __dirname,
	entry: "./app.js",
	devServer: {
		proxy: {
			"/api": "http://127.0.0.1:50545",
		}
	}
}
