"use strict";
const net = require("net");
const should = require("should");
const getLocalIP = require("../lib/util/getLocalIP");

describe("getLocalIP", function() {
	it("should be a function", function() {
		should(getLocalIP).be.a.Function();
	});

	it("should return a IPv4 address", function() {
		should(net.isIPv4(getLocalIP())).be.exactly(true);
	})
})
