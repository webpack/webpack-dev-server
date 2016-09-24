var Server = require("../lib/Server");
var webpack = require("webpack");

var server;

module.exports = {
	start: function(config, options, done) {
		var compiler = webpack(config);
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
