import { getLogger } from 'loglevel';

export const log = getLogger('webpack-dev-server');

const INFO = 'info';
const WARN = 'warn';
const ERROR = 'error';
const DEBUG = 'debug';
const TRACE = 'trace';
const SILENT = 'silent';

// Set the default log level
log.setDefaultLevel(INFO);

export function setLogLevel(level) {
  switch (level) {
    case INFO:
    case WARN:
    case ERROR:
    case DEBUG:
    case TRACE:
      log.setLevel(level);
      break;
    case SILENT:
      log.disableAll();
      break;
    default:
      log.error(`[WDS] Unknown clientLogLevel '${level}'`);
  }
}
