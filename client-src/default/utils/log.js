'use strict';

const log = require('loglevel').getLogger('webpack-dev-server');

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

// Set the default log level
log.setDefaultLevel(INFO);

function setLogLevel(level) {
  switch (level) {
    case INFO:
    case WARN:
    case ERROR:
    case DEBUG:
    case TRACE:
      log.setLevel(level);
      break;
    // deprecated
    case WARNING:
      // loglevel's warning name is different from webpack's
      log.setLevel('warn');
      break;
    // deprecated
    case NONE:
    case SILENT:
      log.disableAll();
      break;
    default:
      log.error(`[WDS] Unknown clientLogLevel '${level}'`);
  }
}

module.exports = {
  log,
  setLogLevel,
};
