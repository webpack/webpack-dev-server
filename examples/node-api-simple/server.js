var Webpack = require('webpack');
var WebpackDevServer = require("../../lib/Server");
var webpackConfig = require("./webpack.config");

var compiler = Webpack(webpackConfig);
var server = new WebpackDevServer(compiler, {
	stats: {
		colors: true
	}
});

server.listen(8080, "127.0.0.1", function() {
	console.log("Starting server on http://localhost:8080");
});
