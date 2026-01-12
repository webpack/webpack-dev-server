"use strict";

const WebpackDevServer = require("../../../lib/Server");

const logInternalIPs = async () => {
  const localIPv4 = WebpackDevServer.findIp("v4", false);
  const localIPv6 = WebpackDevServer.findIp("v6", false);

  console.log("Local IPv4 address:", localIPv4);
  console.log("Local IPv6 address:", localIPv6);
};

logInternalIPs();
