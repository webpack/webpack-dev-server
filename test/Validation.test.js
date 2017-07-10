"use strict";

const config = require("./fixtures/simple-config/webpack.config");
const OptionsValidationError = require("../lib/OptionsValidationError");
const Server = require("../lib/Server");
const webpack = require("webpack");

describe("Validation", function() {
	let compiler;
	before(function() {
		compiler = webpack(config);
	});
	const testCases = [{
		name: "invalid `hot` configuration",
		config: { hot: "asdf" },
		message: [
			" - configuration.hot should be a boolean."
		]
	}, {
		name: "invalid `public` configuration",
		config: { public: 1 },
		message: [
			" - configuration.public should be a string."
		]
	}, {
		name: "invalid `allowedHosts` configuration",
		config: { allowedHosts: 1 },
		message: [
			" - configuration.allowedHosts should be an array:",
			"   [string]",
			"   Specifies which hosts are allowed to access the dev server."
		]
	}, {
		name: "invalid `contentBase` configuration",
		config: { contentBase: [0] },
		message: [
			" - configuration.contentBase should be one of these:",
			"   [string] | false | number | string",
			"   A directory to serve files non-webpack files from.",
			"   Details:",
			"    * configuration.contentBase[0] should be a string.",
			"    * configuration.contentBase should be false",
			"    * configuration.contentBase should be a number.",
			"    * configuration.contentBase should be a string."
		]
	}, {
		name: "non-existing key configuration",
		config: { asdf: true },
		message: [
			" - configuration has an unknown property 'asdf'. These properties are valid:",
			"   object { hot?, hotOnly?, lazy?, bonjour?, host?, allowedHosts?, filename?, publicPath?, port?, socket?, " +
			"watchOptions?, headers?, clientLogLevel?, overlay?, key?, cert?, ca?, pfx?, pfxPassphrase?, " +
			"inline?, disableHostCheck?, public?, https?, contentBase?, watchContentBase?, open?, useLocalIp?, openPage?, features?, " +
			"compress?, proxy?, historyApiFallback?, staticOptions?, setup?, stats?, reporter?, " +
			"noInfo?, quiet?, serverSideRender?, index?, log?, warn? }"
		]
	}];
	testCases.forEach(function(testCase) {
		it(`should fail validation for ${testCase.name}`, function() {
			try {
				new Server(compiler, testCase.config);
			} catch(e) {
				if(!(e instanceof OptionsValidationError))
					throw e;
				e.message.should.startWith("Invalid configuration object.");
				e.message.split("\n").slice(1).should.be.eql(testCase.message);
				return;
			}
			throw new Error("Validation didn't fail");
		})
	});

	describe("checkHost", function() {
		it("should always allow any host if options.disableHostCheck is set", function() {
			const options = {
				public: "test.host:80",
				disableHostCheck: true
			};
			const headers = {
				host: "bad.host"
			};
			const server = new Server(compiler, options);
			if(!server.checkHost(headers)) {
				throw new Error("Validation didn't fail");
			}
		});

		it("should allow any valid options.public when host is localhost", function() {
			const options = {
				public: "test.host:80"
			};
			const headers = {
				host: "localhost"
			};
			const server = new Server(compiler, options);
			if(!server.checkHost(headers)) {
				throw new Error("Validation didn't fail");
			}
		});

		it("should allow any valid options.public when host is 127.0.0.1", function() {
			const options = {
				public: "test.host:80"
			};
			const headers = {
				host: "127.0.0.1"
			};
			const server = new Server(compiler, options);
			if(!server.checkHost(headers)) {
				throw new Error("Validation didn't fail");
			}
		});

		it("should not allow hostnames that don't match options.public", function() {
			const options = {
				public: "test.host:80",
			};
			const headers = {
				host: "test.hostname:80"
			};
			const server = new Server(compiler, options);
			if(server.checkHost(headers)) {
				throw new Error("Validation didn't fail");
			}
		});

		describe("allowedHosts", function() {
			it("should allow hosts in allowedHosts", function() {
				const testHosts = [
					"test.host",
					"test2.host",
					"test3.host"
				];
				const options = { allowedHosts: testHosts };
				const server = new Server(compiler, options);

				testHosts.forEach(function(testHost) {
					const headers = { host: testHost };
					if(!server.checkHost(headers)) {
						throw new Error("Validation didn't fail");
					}
				});
			});
			it("should allow hosts that pass a wildcard in allowedHosts", function() {
				const options = { allowedHosts: [".example.com"] };
				const server = new Server(compiler, options);
				const testHosts = [
					"www.example.com",
					"subdomain.example.com",
					"example.com",
					"subsubcomain.subdomain.example.com",
					"example.com:80",
					"subdomain.example.com:80"
				];

				testHosts.forEach(function(testHost) {
					const headers = { host: testHost };
					if(!server.checkHost(headers)) {
						throw new Error("Validation didn't fail");
					}
				});
			});
		});
	})
});
