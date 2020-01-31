'use strict';

const log = require('webpack-log');

function createLogger(options = {}) {
  return log({
    name: 'wds',
    level: options.logLevel || 'info',
    timestamp: options.logTime,
  });
}

module.exports = createLogger;
