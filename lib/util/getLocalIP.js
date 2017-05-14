"use strict";
const networkInterfaces = require("os").networkInterfaces();

module.exports = function getLocalIP() {
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
