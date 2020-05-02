'use strict';

const name = 'webpack-dev-server';

function createLogger(compiler, level = 'info') {
  if (compiler == null) {
    const log = require('webpack/lib/logging/runtime');

    log.configureDefaultLogger({
      level,
    });

    return log.getLogger(name);
  }

  return compiler.getInfrastructureLogger(name);
}

module.exports = createLogger;
