'use strict';

const log = require('webpack/lib/logging/runtime');

const name = 'webpack-dev-server';
const defaultLevel = 'info';

function setLogLevel(level) {
  log.configureDefaultLogger({
    level,
  });
}

setLogLevel(defaultLevel);

module.exports = {
  log: log.getLogger(name),
  setLogLevel,
};
