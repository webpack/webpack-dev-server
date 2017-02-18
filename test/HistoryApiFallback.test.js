"use strict";

const path = require("path");
const request = require("supertest");
const helper = require("./helper");
const config = require("./fixtures/historyapifallback-config/webpack.config");
const config2 = require("./fixtures/historyapifallback-2-config/webpack.config");
const config3 = require("./fixtures/historyapifallback-3-config/webpack.config");

describe("HistoryApiFallback", function() {
	let server;
	let req;

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

		it("historyApiFallback should take preference above directory index", function(done) {
			req.get("/")
			.accept("html")
			.expect(200, /Foobar/, done);
		});

		it("request to directory", function(done) {
			req.get("/foo")
			.accept("html")
			.expect(200, /Foobar/, done);
		});

		it("contentBase file should take preference above historyApiFallback", function(done) {
			req.get("/random-file")
			.accept("html")
			.expect(200, /Random file/, done);
		});
	});

	describe("as object with contentBase set to false", function() {
		before(function(done) {
			server = helper.start(config3, {
				contentBase: false,
				historyApiFallback: {
					index: "/bar.html"
				}
			}, done);
			req = request(server.app);
		});

		it("historyApiFallback should work and ignore static content", function(done) {
			req.get("/index.html")
			.accept("html")
			.expect(200, /In-memory file/, done);
		});
	});

	describe("as object with contentBase and rewrites", function() {
		before(function(done) {
			server = helper.start(config2, {
				contentBase: path.join(__dirname, "fixtures/historyapifallback-2-config"),
				historyApiFallback: {
					rewrites: [
						{
							from: /other/,
							to: "/other.html"
						},
						{
							from: /.*/,
							to: "/bar.html"
						}
					]
				}
			}, done);
			req = request(server.app);
		});

		it("historyApiFallback respect rewrites for index", function(done) {
			req.get("/")
			.accept("html")
			.expect(200, /Foobar/, done);
		});

		it("historyApiFallback respect rewrites and shows index for unknown urls", function(done) {
			req.get("/acme")
			.accept("html")
			.expect(200, /Foobar/, done);
		});

		it("historyApiFallback respect any other specified rewrites", function(done) {
			req.get("/other")
			.accept("html")
			.expect(200, /Other file/, done);
		});
	});

	describe("in-memory files", function() {
		before(function(done) {
			server = helper.start(config3, {
				contentBase: path.join(__dirname, "fixtures/historyapifallback-3-config"),
				historyApiFallback: true
			}, done);
			req = request(server.app);
		});

		it("should take precedence over contentBase files", function(done) {
			req.get("/foo")
			.accept("html")
			.expect(200, /In-memory file/, done);
		});
	});
});
