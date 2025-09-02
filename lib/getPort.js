"use strict";

/*
 * Based on the packages get-port https://www.npmjs.com/package/get-port
 * and portfinder https://www.npmjs.com/package/portfinder
 * The code structure is similar to get-port, but it searches
 * ports deterministically like portfinder
 */
const net = require("node:net");
const os = require("node:os");

const minPort = 1024;
const maxPort = 65_535;

/**
 * @returns {Set<string | undefined>} local hosts
 */
const getLocalHosts = () => {
  const interfaces = os.networkInterfaces();

  // Add undefined value for createServer function to use default host,
  // and default IPv4 host in case createServer defaults to IPv6.

  const results = new Set([undefined, "0.0.0.0"]);

  for (const _interface of Object.values(interfaces)) {
    if (_interface) {
      for (const config of _interface) {
        results.add(config.address);
      }
    }
  }

  return results;
};

/**
 * @param {number} basePort base port
 * @param {string | undefined} host host
 * @returns {Promise<number>} resolved port
 */
const checkAvailablePort = (basePort, host) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);

    server.listen(basePort, host, () => {
      // Next line should return AddressInfo because we're calling it after listen() and before close()
      const { port } = /** @type {import("net").AddressInfo} */ (
        server.address()
      );
      server.close(() => {
        resolve(port);
      });
    });
  });

/**
 * @param {number} port port
 * @param {Set<string|undefined>} hosts hosts
 * @returns {Promise<number>} resolved port
 */
const getAvailablePort = async (port, hosts) => {
  /**
   * Errors that mean that host is not available.
   * @type {Set<string | undefined>}
   */
  const nonExistentInterfaceErrors = new Set(["EADDRNOTAVAIL", "EINVAL"]);
  /* Check if the post is available on every local host name */
  for (const host of hosts) {
    try {
      await checkAvailablePort(port, host);
    } catch (error) {
      /* We throw an error only if the interface exists */
      if (
        !nonExistentInterfaceErrors.has(
          /** @type {NodeJS.ErrnoException} */ (error).code,
        )
      ) {
        throw error;
      }
    }
  }

  return port;
};

/**
 * @param {number} basePort base port
 * @param {string=} host host
 * @returns {Promise<number>} resolved port
 */
async function getPorts(basePort, host) {
  if (basePort < minPort || basePort > maxPort) {
    throw new Error(`Port number must lie between ${minPort} and ${maxPort}`);
  }

  let port = basePort;

  const localhosts = getLocalHosts();
  const hosts =
    host && !localhosts.has(host)
      ? new Set([host])
      : /* If the host is equivalent to localhost
       we need to check every equivalent host
       else the port might falsely appear as available
       on some operating systems  */
        localhosts;
  /** @type {Set<string | undefined>} */
  const portUnavailableErrors = new Set(["EADDRINUSE", "EACCES"]);
  while (port <= maxPort) {
    try {
      const availablePort = await getAvailablePort(port, hosts);
      return availablePort;
    } catch (error) {
      /* Try next port if port is busy; throw for any other error */
      if (
        !portUnavailableErrors.has(
          /** @type {NodeJS.ErrnoException} */ (error).code,
        )
      ) {
        throw error;
      }
      port += 1;
    }
  }

  throw new Error("No available ports found");
}

module.exports = getPorts;
