/* eslint prefer-destructuring: off */
import stripAnsi from 'strip-ansi';
import socket from './socket';
import {
  clear as clearOverlay,
  showMessage as showMessageOverlay,
} from './overlay';
import { log, setLogLevel } from './utils/log';
import sendMessage from './utils/sendMessage';
import reloadApp from './utils/reloadApp';
import createSocketUrl from './utils/createSocketUrl';

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
    log.info('[WDS] Hot Module Replacement enabled.');
  },
  liveReload() {
    options.liveReload = true;
    log.info('[WDS] Live Reloading enabled.');
  },
  invalid() {
    log.info('[WDS] App updated. Recompiling...');
    // fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.useWarningOverlay || options.useErrorOverlay) {
      clearOverlay();
    }
    sendMessage('Invalid');
  },
  hash(hash) {
    status.currentHash = hash;
  },
  'still-ok': function stillOk() {
    log.info('[WDS] Nothing changed.');
    if (options.useWarningOverlay || options.useErrorOverlay) {
      clearOverlay();
    }
    sendMessage('StillOk');
  },
  'log-level': function logLevel(level) {
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
      log.info(`[WDS] ${data.percent}% - ${data.msg}.`);
    }
    sendMessage('Progress', data);
  },
  ok() {
    sendMessage('Ok');
    if (options.useWarningOverlay || options.useErrorOverlay) {
      clearOverlay();
    }
    if (options.initial) {
      return (options.initial = false);
    } // eslint-disable-line no-return-assign
    reloadApp(options, status);
  },
  'content-changed': function contentChanged() {
    log.info('[WDS] Content base changed. Reloading...');
    self.location.reload();
  },
  warnings(warnings) {
    log.warn('[WDS] Warnings while compiling.');
    const strippedWarnings = warnings.map((warning) => stripAnsi(warning));
    sendMessage('Warnings', strippedWarnings);
    for (let i = 0; i < strippedWarnings.length; i++) {
      log.warn(strippedWarnings[i]);
    }
    if (options.useWarningOverlay) {
      showMessageOverlay(warnings);
    }

    if (options.initial) {
      return (options.initial = false);
    } // eslint-disable-line no-return-assign
    reloadApp(options, status);
  },
  errors(errors) {
    log.error('[WDS] Errors while compiling. Reload prevented.');
    const strippedErrors = errors.map((error) => stripAnsi(error));
    sendMessage('Errors', strippedErrors);
    for (let i = 0; i < strippedErrors.length; i++) {
      log.error(strippedErrors[i]);
    }
    if (options.useErrorOverlay) {
      showMessageOverlay(errors);
    }
    options.initial = false;
  },
  error(error) {
    log.error(error);
  },
  close() {
    log.error('[WDS] Disconnected!');
    sendMessage('Close');
  },
};

socket(socketUrl, onSocketMessage);
