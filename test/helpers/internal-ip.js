"use strict";

const os = require("os");
const ipaddr = require("ipaddr.js");
const defaultGateway = require("default-gateway");

const findIp = (gateway) => {
  const gatewayIp = ipaddr.parse(gateway);

  // Look for the matching interface in all local interfaces.
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const { cidr } of addresses) {
      const net = ipaddr.parseCIDR(cidr);

      if (
        net[0] &&
        net[0].kind() === gatewayIp.kind() &&
        gatewayIp.match(net)
      ) {
        return net[0].toString();
      }
    }
  }
};

const asyncInternalIp = async (family) => {
  try {
    const { gateway } = await defaultGateway[family]();
    return findIp(gateway);
  } catch {
    // ignore
  }
};

const syncInternalIp = (family) => {
  try {
    const { gateway } = defaultGateway[family].sync();
    return findIp(gateway);
  } catch {
    // ignore
  }
};

module.exports = {
  asyncInternalIp,
  syncInternalIp,
};
