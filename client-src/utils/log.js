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

const logEnabledFeatures = (features, logLevel = "info") => {
  setLogLevel(logLevel);
  const enabledFeatures = Object.keys(features);
  if (!features || enabledFeatures.length === 0) {
    return;
  }

  let logString = "Server started:";

  // Server started: Hot Module Replacement enabled, Live Reloading enabled, Overlay disabled.
  for (let i = 0; i < enabledFeatures.length; i++) {
    const key = enabledFeatures[i];
    logString += ` ${key} ${features[key] ? "enabled" : "disabled"},`;
  }
  // replace last comma with a period
  logString = logString.slice(0, -1).concat(".");

  log.info(logString);
};

export { log, logEnabledFeatures, setLogLevel };
