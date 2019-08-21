'use strict';

const portfinder = require('portfinder');
const defaultPort = require('./defaultPort');
const tryParseInt = require('./tryParseInt');
const isObject = require('./isObject');

async function findPort(options) {
  const maybeInt = tryParseInt(options);

  if (maybeInt) {
    return maybeInt;
  }

  const defaultRetryNum = 3;
  const defaultRetry =
    tryParseInt(process.env.DEFAULT_PORT_RETRY) || defaultRetryNum;

  portfinder.basePort = defaultPort;
  portfinder.highestPort = portfinder.basePort + defaultRetry;

  if (isObject(options)) {
    const basePort = tryParseInt(options.basePort);
    const highestPort = tryParseInt(options.highestPort);

    if (basePort) {
      portfinder.basePort = basePort;
    }

    if (defaultRetry !== defaultRetryNum) {
      portfinder.highestPort = portfinder.basePort + defaultRetry;
    } else if (highestPort) {
      portfinder.highestPort = highestPort;
    }
  }

  return portfinder.getPortPromise();
}

module.exports = findPort;
