"use strict";

const request = require("supertest");
const helper = require("./helper");
const config = require("./fixtures/simple-config/webpack.config");

describe("Compress", function() {
	let server;
	let req;

	before(function(done) {
		server = helper.start(config, {
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
