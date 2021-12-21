import logger from "../modules/logger/index.js";

const name = "webpack-dev-server";
// default level is set on the client side, so it does not need
// to be set by the CLI or API
const defaultLevel = "info";

// options new options, merge with old options
/**
 * @param {false | true | "none" | "error" | "warn" | "info" | "log" | "verbose"} level
 * @returns {void}
 */
function setLogLevel(level) {
  logger.configureDefaultLogger({ level });
}

setLogLevel(defaultLevel);

const log = logger.getLogger(name);

export { log, setLogLevel };
