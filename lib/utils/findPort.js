'use strict';

const { getPortPromise } = require('portfinder');
const defaultPort = require('./defaultPort');
const defaultTo = require('./defaultTo');
const tryParseInt = require('./tryParseInt');

function findPort(port) {
  if (typeof port !== 'undefined') {
    return Promise.resolve(port);
  }

  // Try to find unused port and listen on it for 3 times,
  // if port is not specified in options.
  // Because NaN == null is false, defaultTo fails if parseInt returns NaN
  // so the tryParseInt function is introduced to handle NaN
  const defaultPortRetry = defaultTo(
    tryParseInt(process.env.DEFAULT_PORT_RETRY),
    3
  );

  return getPortPromise({
    port: defaultPort,
    stopPort: defaultPort + defaultPortRetry,
  });
}

module.exports = findPort;
