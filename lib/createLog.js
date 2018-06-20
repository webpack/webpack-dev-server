'use strict';

const weblog = require('webpack-log');

module.exports = function createLog(options) {
  let logLevel = options.logLevel || 'info';
  if (options.quiet === true) {
    logLevel = 'silent';
  }
  if (options.noInfo === true) {
    logLevel = 'warn';
  }

  return weblog({
    level: logLevel,
    name: 'wds',
    timestamp: options.logTime
  });
};
