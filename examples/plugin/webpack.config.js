const{ WebpackDevServerPlugin } = require("../../lib/Server");

module.exports = {
	context: __dirname,
	entry: "./app.js",
	plugins: [
		new WebpackDevServerPlugin({
			hot: true
		})
	]
}
