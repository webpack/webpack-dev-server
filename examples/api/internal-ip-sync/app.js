"use strict";

const WebpackDevServer = require("../../../lib/Server");

const localIPv4 = WebpackDevServer.internalIPSync("v4");
const localIPv6 = WebpackDevServer.internalIPSync("v6");

console.log("Local IPv4 address:", localIPv4);
console.log("Local IPv6 address:", localIPv6);
