/* global __resourceQuery WorkerGlobalScope */

// eslint-disable-next-line import/no-extraneous-dependencies
import webpackHotLog from 'webpack/hot/log';
import stripAnsi from './modules/strip-ansi';
import parseURL from './utils/parseURL';
import socket from './socket';
import overlay from './overlay';
import { log, setLogLevel } from './utils/log';
import sendMessage from './utils/sendMessage';
import reloadApp from './utils/reloadApp';
import createSocketURL from './utils/createSocketURL';

const status = {
  isUnloading: false,
  currentHash: '',
};
const defaultOptions = {
  hot: false,
  hotReload: true,
  liveReload: false,
  initial: true,
  progress: false,
  overlay: false,
};
const parsedResourceQuery = parseURL(__resourceQuery);
const options = defaultOptions;

// Handle Node.js legacy format and `new URL()`
if (parsedResourceQuery.query) {
  Object.assign(options, parsedResourceQuery.query);
} else if (parsedResourceQuery.searchParams) {
  const paramsToObject = (entries) => {
    const result = {};

    for (const [key, value] of entries) {
      result[key] = value;
    }

    return result;
  };

  Object.assign(
    options,
    paramsToObject(parsedResourceQuery.searchParams.entries())
  );
}

const socketURL = createSocketURL(parsedResourceQuery);

function setAllLogLevel(level) {
  // This is needed because the HMR logger operate separately from dev server logger
  webpackHotLog.setLogLevel(level);
  setLogLevel(level);
}

if (options.logging) {
  setAllLogLevel(options.logging);
}

self.addEventListener('beforeunload', () => {
  status.isUnloading = true;
});

if (typeof window !== 'undefined') {
  const qs = window.location.search.toLowerCase();

  options.hotReload = qs.indexOf('hotreload=false') === -1;
}

const onSocketMessage = {
  hot() {
    options.hot = true;

    log.info('Hot Module Replacement enabled.');
  },
  liveReload() {
    options.liveReload = true;

    log.info('Live Reloading enabled.');
  },
  invalid() {
    log.info('App updated. Recompiling...');

    // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.overlay) {
      overlay.clear();
    }

    sendMessage('Invalid');
  },
  hash(hash) {
    status.currentHash = hash;
  },
  logging: setAllLogLevel,
  overlay(value) {
    if (typeof document === 'undefined') {
      return;
    }

    options.overlay = value;
  },
  progress(progress) {
    options.progress = progress;
  },
  'progress-update': function progressUpdate(data) {
    if (options.progress) {
      log.info(`${data.percent}% - ${data.msg}.`);
    }

    sendMessage('Progress', data);
  },
  'still-ok': function stillOk() {
    log.info('Nothing changed.');

    if (options.overlay) {
      overlay.clear();
    }

    sendMessage('StillOk');
  },
  ok() {
    sendMessage('Ok');

    if (options.overlay) {
      overlay.clear();
    }

    if (options.initial) {
      return (options.initial = false);
    }

    reloadApp(options, status);
  },
  'content-changed': function contentChanged() {
    log.info('Content base changed. Reloading...');

    self.location.reload();
  },
  warnings(warnings) {
    log.warn('Warnings while compiling.');

    const strippedWarnings = warnings.map((warning) =>
      stripAnsi(warning.message ? warning.message : warning)
    );

    sendMessage('Warnings', strippedWarnings);

    for (let i = 0; i < strippedWarnings.length; i++) {
      log.warn(strippedWarnings[i]);
    }

    const needShowOverlay =
      typeof options.overlay === 'boolean'
        ? options.overlay
        : options.overlay && options.overlay.warnings;

    if (needShowOverlay) {
      overlay.showMessage(warnings);
    }

    if (options.initial) {
      return (options.initial = false);
    }

    reloadApp(options, status);
  },
  errors(errors) {
    log.error('Errors while compiling. Reload prevented.');

    const strippedErrors = errors.map((error) =>
      stripAnsi(error.message ? error.message : error)
    );

    sendMessage('Errors', strippedErrors);

    for (let i = 0; i < strippedErrors.length; i++) {
      log.error(strippedErrors[i]);
    }

    const needShowOverlay =
      typeof options.overlay === 'boolean'
        ? options.overlay
        : options.overlay && options.overlay.errors;

    if (needShowOverlay) {
      overlay.showMessage(errors);
    }

    options.initial = false;
  },
  error(error) {
    log.error(error);
  },
  close() {
    log.error('Disconnected!');

    sendMessage('Close');
  },
};

socket(socketURL, onSocketMessage);
