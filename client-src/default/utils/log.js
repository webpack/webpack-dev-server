'use strict';

const log = require('../../transpiled-modules/log');

const name = 'webpack-dev-server';
// default level is set on the client side, so it does not need
// to be set by the CLI or API
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
