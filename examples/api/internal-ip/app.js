"use strict";

const WebpackDevServer = require("../../../lib/Server");

const logInternalIPs = async () => {
  const localIPv4 = await WebpackDevServer.internalIP("v4");
  const localIPv6 = await WebpackDevServer.internalIP("v6");

  console.log("Local IPv4 address:", localIPv4);
  console.log("Local IPv6 address:", localIPv6);
};

logInternalIPs();
