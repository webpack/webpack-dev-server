'use strict';

const logger = require('webpack/lib/logging/runtime');

const INFO = 'info';
const WARN = 'warn';
const ERROR = 'error';
const DEBUG = 'debug';
const TRACE = 'trace';
const SILENT = 'silent';

// deprecated
// TODO: remove these at major released
// https://github.com/webpack/webpack-dev-server/pull/1825
const WARNING = 'warning';
const NONE = 'none';

let log;

updateLogger(INFO);

function updateLogger(level) {
  logger.configureDefaultLogger({
    level,
    debug: false,
  });

  log = logger.getLogger('WDS');
}

function setLogLevel(level) {
  switch (level) {
    case INFO:
    case WARN:
    case ERROR:
    case DEBUG:
    case TRACE:
      updateLogger(level);
      break;
    // deprecated
    case WARNING:
      // loglevel's warning name is different from webpack's
      updateLogger(WARN);
      break;
    // deprecated
    case NONE:
    case SILENT:
      updateLogger(NONE);
      break;
    default:
      updateLogger(ERROR);
      log.error(`Unknown clientLogLevel '${level}'`);
  }
}

module.exports = {
  log,
  setLogLevel,
};
