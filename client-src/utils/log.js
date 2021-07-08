'use strict';

const logger = require('../modules/logger');

const name = 'webpack-dev-server';
// default level is set on the client side, so it does not need
// to be set by the CLI or API
const defaultLevel = 'info';

function setLogLevel(level) {
  logger.configureDefaultLogger({ level });
}

setLogLevel(defaultLevel);

module.exports = { log: logger.getLogger(name), setLogLevel };
