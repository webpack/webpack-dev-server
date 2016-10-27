"use strict";

var net = require("net");

var client = net.createConnection("./webpack.sock");
client.on("connect", function() {
	console.log("Successfully connected to socket, exiting");
	process.exit(1); // eslint-disable-line
});
