"use strict";

const Server = require("../lib/Server");
const webpack = require("webpack");

let server;

module.exports = {
	start: function(config, options, done) {
		if(options.quiet === undefined) {
			options.quiet = true;
		}
		const compiler = webpack(config);
		server = new Server(compiler, options);

		server.listen(8080, "localhost", function(err) {
			if(err) return done(err);
			done();
		});

		return server;
	},
	close: function(done) {
		if(server) {
			server.close(function() {
				server = null;
				done();
			});
		} else {
			done();
		}
	}
};
