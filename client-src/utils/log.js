import logger from '../modules/logger';

const name = 'webpack-dev-server';
// default level is set on the client side, so it does not need
// to be set by the CLI or API
const defaultLevel = 'info';

function setLogLevel(level) {
  logger.configureDefaultLogger({ level });
}

setLogLevel(defaultLevel);

export default { log: logger.getLogger(name), setLogLevel };
