"use strict";
const url = require("url");
const internalIp = require("internal-ip");

module.exports = function createDomain(options, listeningApp) {
	const protocol = options.https ? "https" : "http";

	// the formatted domain (url without path) of the webpack server
	return options.public ? `${protocol}://${options.public}` : url.format({
		protocol: protocol,
		hostname: options.useLocalIp ? internalIp.v4() : options.host,
		port: options.socket ? 0 : (listeningApp ? listeningApp.address().port : 0)
	});
};
