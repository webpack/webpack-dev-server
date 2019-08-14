'use strict';

const portfinder = require('portfinder');
const defaultPort = require('./defaultPort');
const tryParseInt = require('./tryParseInt');

async function findPort(options) {
  if (tryParseInt(options)) {
    return tryParseInt(options);
  }

  const defaultRetry = tryParseInt(process.env.DEFAULT_PORT_RETRY) || 3;

  portfinder.basePort = defaultPort;
  portfinder.highestPort = portfinder.basePort + defaultRetry;

  if (Object.prototype.toString.call(options) === '[object Object]') {
    const basePort = tryParseInt(options.basePort);
    const highestPort = tryParseInt(options.highestPort);
    const retry = tryParseInt(options.retry);

    if (basePort) {
      portfinder.basePort = basePort;
    }

    if (retry) {
      portfinder.highestPort = portfinder.basePort + retry;
    } else if (highestPort) {
      portfinder.highestPort = options.highestPort;
    }
  }

  return portfinder.getPortPromise();
}

module.exports = findPort;
