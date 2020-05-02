'use strict';

const log = require('webpack/lib/logging/runtime');

function createLogger(level = 'info') {
  const name = 'webpack-dev-server';

  log.configureDefaultLogger({
    level,
  });

  return log.getLogger(name);
}

module.exports = createLogger;
