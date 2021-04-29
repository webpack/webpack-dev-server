'use strict';

const pRetry = require('p-retry');
const portfinder = require('portfinder');

function runPortFinder() {
  return new Promise((resolve, reject) => {
    // default port
    portfinder.basePort = 8080;
    portfinder.getPort((error, port) => {
      if (error) {
        return reject(error);
      }

      return resolve(port);
    });
  });
}

function findPort(port) {
  if (port) {
    return Promise.resolve(port);
  }

  // Try to find unused port and listen on it for 3 times,
  // if port is not specified in options.
  const defaultPortRetry = parseInt(process.env.DEFAULT_PORT_RETRY, 10) || 3;

  return pRetry(runPortFinder, { retries: defaultPortRetry });
}

module.exports = findPort;
