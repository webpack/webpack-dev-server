var path = require("path");
var request = require("supertest");
var helper = require("./helper");
var config = require("./fixtures/historyapifallback-config/webpack.config");
var config2 = require("./fixtures/historyapifallback-2-config/webpack.config");

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

	describe("as object with contentBase", function() {
		before(function(done) {
			server = helper.start(config2, {
				contentBase: path.join(__dirname, "fixtures/historyapifallback-2-config"),
				historyApiFallback: {
					index: "/bar.html"
				}
			}, done);
			req = request(server.app);
		});

		it("historyApiFallback should take preference above magicHtml", function(done) {
			req.get("/")
			.accept("html")
			.expect(200, /Foobar/, done);
		});
	});
});
