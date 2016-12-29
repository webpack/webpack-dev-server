"use strict";

const should = require("should");
const helper = require("./helper");
const config = require("./fixtures/simple-config/webpack.config");

describe("Lazy", function() {
	afterEach(helper.close);

	it("without filename option it should throw an error", function() {
		should.throws(function() {
			helper.start(config, {
				lazy: true
			});
		}, /'filename' option must be set/);
	});

	it("with filename option should not throw an error", function(done) {
		helper.start(config, {
			lazy: true,
			filename: "bundle.js"
		}, done);
	});
});
