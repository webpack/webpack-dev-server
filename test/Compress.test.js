var request = require("supertest");
var helper = require("./helper");
var config = require("./fixtures/simple-config/webpack.config");

describe("Compress", function() {
	var server;
	var req;

	before(function(done) {
		server = helper.start(config, {
			quiet: true,
			compress: true
		}, done);
		req = request(server.app);
	});

	after(helper.close);

	it("request to bundle file", function(done) {
		req.get("/bundle.js")
		.expect("Content-Encoding", "gzip")
		.expect(200, done);
	});
});
