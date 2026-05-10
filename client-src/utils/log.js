import defaultLogger from "../modules/logger/index.js";

const name = "webpack-dev-server";
// default level is set on the client side, so it does not need
// to be set by the CLI or API
const defaultLevel = "info";

// options new options, merge with old options
/**
 * @param {false | true | "none" | "error" | "warn" | "info" | "log" | "verbose"} level level
 * @param {object} logger internal-only override for tests; defaults to the
 * real webpack runtime logger
 * @returns {void}
 */
function setLogLevel(level, logger = defaultLogger) {
  logger.configureDefaultLogger({ level });
}

setLogLevel(defaultLevel);

const log = defaultLogger.getLogger(name);

export { log, setLogLevel };
