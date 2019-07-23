'use strict';

const log = require('webpack/lib/logging/runtime');

function createLogger(options = {}) {
  let level = options.logLevel || 'info';

  if (options.noInfo === true) {
    level = 'warn';
  }

  if (options.quiet === true) {
    // TODO: need to fix webpack-dev-middleware because wdm doesn't accept `none`
    // webpack/lib/logging/runtime require `none`
    level = 'none';
  }

  log.configureDefaultLogger({
    level,
    debug: false,
  });

  return {
    log: log.getLogger('WDS'),
    level,
  };
}

module.exports = createLogger;
