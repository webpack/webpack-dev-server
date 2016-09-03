var Webpack = require('webpack');
var WebpackDevServer = require("../../lib/Server");
var webpackConfig = require("./webpack.config");

var compiler = Webpack(webpackConfig);
var server = new WebpackDevServer(compiler, {
	stats: {
		colors: true
	},
	setup: function(app) {
		app.use(function(req, res, next) {
			console.log("Using middleware for " + req.url);
			next();
		});
	}
});

server.listen(8080, "127.0.0.1", function() {
	console.log("Starting server on http://localhost:8080");
});
