var request = require("supertest");
var helper = require("./helper");
var config = require("./fixtures/historyapifallback-config/webpack.config");

describe("HistoryApiFallback", function() {
	var server;
	var req;

	afterEach(helper.close);

	describe("as boolean", function() {
		before(function(done) {
			server = helper.start(config, {
				historyApiFallback: true
			}, done);
			req = request(server.app);
		});

		it("request to directory", function(done) {
			req.get("/foo")
			.accept("html")
			.expect(200, /Heyyy/, done);
		});
	});

	describe("as object", function() {
		before(function(done) {
			server = helper.start(config, {
				historyApiFallback: {
					index: "/bar.html"
				}
			}, done);
			req = request(server.app);
		});

		it("request to directory", function(done) {
			req.get("/foo")
			.accept("html")
			.expect(200, /Foobar/, done);
		});
	});
});
