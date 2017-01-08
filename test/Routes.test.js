"use strict";

const request = require("supertest");
const fs = require("fs");
const path = require("path");
const helper = require("./helper");
const config = require("./fixtures/simple-config/webpack.config");

const directoryIndex = fs.readFileSync(path.join(__dirname, "fixtures/directory-index.txt"), "utf-8");
const magicHtml = fs.readFileSync(path.join(__dirname, "fixtures/magic-html.txt"), "utf-8");

describe("Routes", function() {
	let server;
	let req;

	before(function(done) {
		server = helper.start(config, {
			headers: { "X-Foo": "1" }
		}, done);
		req = request(server.app);
	});

	after(helper.close);

	it("GET request to inline bundle", function(done) {
		req.get("/webpack-dev-server.js")
		.expect("Content-Type", "application/javascript")
		.expect(200, done);
	});

	it("GET request to live bundle", function(done) {
		req.get("/__webpack_dev_server__/live.bundle.js")
		.expect("Content-Type", "application/javascript")
		.expect(200, done);
	});

	it("GET request to sockjs bundle", function(done) {
		req.get("/__webpack_dev_server__/sockjs.bundle.js")
		.expect("Content-Type", "application/javascript")
		.expect(200, done);
	});

	it("GET request to live html", function(done) {
		req.get("/webpack-dev-server/")
		.expect("Content-Type", "text/html")
		.expect(200, /__webpack_dev_server__/, done);
	});

	it("GET request to directory index", function(done) {
		req.get("/webpack-dev-server")
		.expect("Content-Type", "text/html")
		.expect(200, directoryIndex.trim(), done);
	});

	it("GET request to magic html", function(done) {
		req.get("/bundle")
		.expect(200, magicHtml.trim(), done);
	});

	it("GET request with headers", function(done) {
		req.get("/bundle")
		.expect("X-Foo", "1")
		.expect(200, done);
	});
});
