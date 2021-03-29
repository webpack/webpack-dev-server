'use strict';

/* global __resourceQuery WorkerGlobalScope */

const stripAnsi = require('./modules/strip-ansi');
const socket = require('./socket');
const overlay = require('./overlay');
const { log, setLogLevel } = require('./utils/log');
const sendMessage = require('./utils/sendMessage');
const reloadApp = require('./utils/reloadApp');
const createSocketUrl = require('./utils/createSocketUrl');

const status = {
  isUnloading: false,
  currentHash: '',
};
const options = {
  hot: false,
  hotReload: true,
  liveReload: false,
  initial: true,
  useWarningOverlay: false,
  useErrorOverlay: false,
  useProgress: false,
};
const socketUrl = createSocketUrl(__resourceQuery);

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

    // fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
    }

    sendMessage('Invalid');
  },
  hash(hash) {
    status.currentHash = hash;
  },
  'still-ok': function stillOk() {
    log.info('Nothing changed.');

    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
    }

    sendMessage('StillOk');
  },
  logging: function logging(level) {
    // this is needed because the HMR logger operate separately from
    // dev server logger
    const hotCtx = require.context('webpack/hot', false, /^\.\/log$/);

    if (hotCtx.keys().indexOf('./log') !== -1) {
      hotCtx('./log').setLogLevel(level);
    }

    setLogLevel(level);
  },
  overlay(value) {
    if (typeof document !== 'undefined') {
      if (typeof value === 'boolean') {
        options.useWarningOverlay = false;
        options.useErrorOverlay = value;
      } else if (value) {
        options.useWarningOverlay = value.warnings;
        options.useErrorOverlay = value.errors;
      }
    }
  },
  progress(progress) {
    if (typeof document !== 'undefined') {
      options.useProgress = progress;
    }
  },
  'progress-update': function progressUpdate(data) {
    if (options.useProgress) {
      log.info(`${data.percent}% - ${data.msg}.`);
    }

    sendMessage('Progress', data);
  },
  ok() {
    sendMessage('Ok');

    if (options.useWarningOverlay || options.useErrorOverlay) {
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

    if (options.useWarningOverlay) {
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

    if (options.useErrorOverlay) {
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

socket(socketUrl, onSocketMessage);
