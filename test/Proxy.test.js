"use strict";

const request = require("supertest");
const path = require("path");
const express = require("express");
const helper = require("./helper");
const config = require("./fixtures/proxy-config/webpack.config");

const contentBase = path.join(__dirname, "fixtures/proxy-config");

const proxyOption = {
	"/proxy1": {
		target: "http://localhost:9000",
	},
	"/api/proxy2": {
		target: "http://localhost:9001",
		pathRewrite: { "^/api": "" },
	},
	"/foo": {
		bypass: function(req) {
			if(/\.html$/.test(req.path)) {
				return "/index.html";
			}
		},
	},
};

const proxyOptionOfArray = [
	{ context: "/proxy1", target: proxyOption["/proxy1"].target },
	function() {
		return {
			context: "/api/proxy2",
			target: "http://localhost:9001",
			pathRewrite: { "^/api": "" },
		};
	},
];

function startProxyServers() {
	const listeners = [];
	const proxy1 = express();
	const proxy2 = express();
	proxy1.get("/proxy1", function(req, res) {
		res.send("from proxy1");
	});
	proxy1.get("/api", function(req, res) {
		res.send("api response from proxy1");
	});
	proxy2.get("/proxy2", function(req, res) {
		res.send("from proxy2");
	});
	listeners.push(proxy1.listen(9000));
	listeners.push(proxy2.listen(9001));
	// return a function to shutdown proxy servers
	return function() {
		listeners.forEach(function(listener) {
			listener.close();
		});
	};
}

describe("Proxy", function() {
	context("proxy options is a object", function() {
		let server;
		let req;
		let closeProxyServers;

		before(function(done) {
			closeProxyServers = startProxyServers();
			server = helper.start(config, {
				contentBase,
				proxy: proxyOption,
			}, done);
			req = request(server.app);
		});

		after(function(done) {
			helper.close(function() {
				closeProxyServers();
				done();
			});
		});

		describe("target", function() {
			it("respects a proxy option when a request path is matched", function(done) {
				req.get("/proxy1")
				.expect(200, "from proxy1", done);
			});
		});

		describe("pathRewrite", function() {
			it("respects a pathRewrite option", function(done) {
				req.get("/api/proxy2")
				.expect(200, "from proxy2", done);
			});
		});

		describe("bypass", function() {
			it("can rewrite a request path", function(done) {
				req.get("/foo/bar.html")
				.expect(200, /Hello/, done);
			});

			it("can rewrite a request path regardless of the target defined a bypass option", function(done) {
				req.get("/baz/hoge.html")
				.expect(200, /Hello/, done);
			});

			it("should pass through a proxy when a bypass function returns null", function(done) {
				req.get("/foo.js")
				.expect(200, /Hey/, done);
			});
		});
	});

	context("proxy option is an array", function() {
		let server;
		let req;
		let closeProxyServers;

		before(function(done) {
			closeProxyServers = startProxyServers();
			server = helper.start(config, {
				contentBase,
				proxy: proxyOptionOfArray,
			}, done);
			req = request(server.app);
		});

		after(function(done) {
			helper.close(function() {
				closeProxyServers();
				done();
			});
		});

		it("respects a proxy option", function(done) {
			req.get("/proxy1")
			.expect(200, "from proxy1", done);
		});

		it("respects a proxy option of function", function(done) {
			req.get("/api/proxy2")
			.expect(200, "from proxy2", done);
		});
	});
});
