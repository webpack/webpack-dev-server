"use strict";
const url = require("url");
const networkInterfaces = require("os").networkInterfaces();

function getLocalIP() {
	let host;

	for(const key in networkInterfaces) {
		const obj = networkInterfaces[key];

		for(let i = 0, len = obj.length; i < len; i++) {
			if(obj[i].family === "IPv4" && obj[i].address !== "127.0.0.1") {
				host = obj[i].address;
				break;
			}
		}
	}

	return host;
}

module.exports = function createDomain(options) {
	const protocol = options.https ? "https" : "http";

	// the formatted domain (url without path) of the webpack server
	return options.public ? `${protocol}://${options.public}` : url.format({
		protocol: protocol,
		hostname: options.lan ? getLocalIP() : options.host,
		port: options.socket ? 0 : options.port.toString()
	});
};
