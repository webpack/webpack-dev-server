"use strict";

const net = require("net");
const os = require("os");

const minPort = 1024;
const maxPort = 65535;

/**
 * Get local host addresses including both IPv4 and IPv6.
 * @return {Set<string|undefined>} Set of local host addresses.
 */
const getLocalHosts = () => {
  const interfaces = os.networkInterfaces();
  const results = new Set([undefined, "0.0.0.0", "::"]); // Default hosts for IPv4 and IPv6

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
 * Check if a port is available on a specific host.
 * @param {number} basePort - The port to check for availability.
 * @param {string|undefined} host - The host address to check on.
 * @return {Promise<number>} A promise resolving to the available port.
 */
const checkAvailablePort = (basePort, host) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", (err) => {
      server.close();
      reject(err);
    });

    server.listen(basePort, host, () => {
      const { port } = server.address();
      server.close(() => {
        resolve(port);
      });
    });
  });
};

/**
 * Get an available port within a range on any of the specified hosts.
 * @param {number} basePort - The base port to start searching from.
 * @param {string|undefined} host - The host address to search on.
 * @return {Promise<number>} A promise resolving to the available port.
 */
const getAvailablePort = async (basePort, host) => {
  const localhosts = getLocalHosts();
  let hosts;
  if (host && !localhosts.has(host)) {
    hosts = new Set([host]);
  } else {
    hosts = localhosts;
  }

  const nonExistentInterfaceErrors = new Set(["EADDRNOTAVAIL", "EINVAL"]);
  for (const host of hosts) {
    try {
      await checkAvailablePort(basePort, host);
    } catch (error) {
      if (!(error instanceof Error) || !nonExistentInterfaceErrors.has(error.code)) {
        throw error;
      }
    }
  }

  return basePort;
};

/**
 * Get an available port within a range on any of the specified hosts.
 * @param {number} basePort - The base port to start searching from.
 * @param {string=} host - The host address to search on.
 * @return {Promise<number>} A promise resolving to the available port.
 */
async function getPorts(basePort, host) {
  if (basePort < minPort || basePort > maxPort) {
    throw new Error(`Port number must lie between ${minPort} and ${maxPort}`);
  }

  let port = basePort;
  while (port <= maxPort) {
    try {
      const availablePort = await getAvailablePort(port, host);
      return availablePort;
    } catch (error) {
      if (!(error instanceof Error) || !["EADDRINUSE", "EACCES"].includes(error.code)) {
        throw error;
      }
      port += 1;
    }
  }

  throw new Error(`No available ports found in the range ${basePort} to ${maxPort}`);
}

module.exports = getPorts;
