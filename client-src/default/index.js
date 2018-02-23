'use strict';

/* global __resourceQuery WorkerGlobalScope self */
/* eslint prefer-destructuring: off */

const url = require('url');
const stripAnsi = require('strip-ansi');
const log = require('loglevel').getLogger('webpack-dev-server');
const socket = require('./socket');
const overlay = require('./overlay');

function getCurrentScriptSource() {
  // `document.currentScript` is the most accurate way to find the current script,
  // but is not supported in all browsers.
  if (document.currentScript) { return document.currentScript.getAttribute('src'); }
  // Fall back to getting all scripts in the document.
  const scriptElements = document.scripts || [];
  const currentScript = scriptElements[scriptElements.length - 1];
  if (currentScript) { return currentScript.getAttribute('src'); }
  // Fail as there was no script to use.
  throw new Error('[WDS] Failed to get current script source.');
}

let urlParts;
let hotReload = true;
if (typeof window !== 'undefined') {
  const qs = window.location.search.toLowerCase();
  hotReload = qs.indexOf('hotreload=false') === -1;
}
if (typeof __resourceQuery === 'string' && __resourceQuery) {
  // If this bundle is inlined, use the resource query to get the correct url.
  urlParts = url.parse(__resourceQuery.substr(1));
} else {
  // Else, get the url from the <script> this file was called with.
  let scriptHost = getCurrentScriptSource();
  // eslint-disable-next-line no-useless-escape
  scriptHost = scriptHost.replace(/\/[^\/]+$/, '');
  urlParts = url.parse((scriptHost || '/'), false, true);
}

if (!urlParts.port || urlParts.port === '0') {
  urlParts.port = self.location.port;
}

let hot = false;
let initial = true;
let currentHash = '';
let useWarningOverlay = false;
let useErrorOverlay = false;
let useProgress = false;

const INFO = 'info';
const WARNING = 'warning';
const ERROR = 'error';
const NONE = 'none';

// Set the default log level
log.setDefaultLevel(INFO);

// Send messages to the outside, so plugins can consume it.
function sendMsg(type, data) {
  if (
    typeof self !== 'undefined' &&
  (typeof WorkerGlobalScope === 'undefined' ||
  !(self instanceof WorkerGlobalScope))
  ) {
    self.postMessage({
      type: `webpack${type}`,
      data
    }, '*');
  }
}

const onSocketMsg = {
  hot() {
    hot = true;
    log.info('[WDS] Hot Module Replacement enabled.');
  },
  invalid() {
    log.info('[WDS] App updated. Recompiling...');
    // fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (useWarningOverlay || useErrorOverlay) overlay.clear();
    sendMsg('Invalid');
  },
  hash(hash) {
    currentHash = hash;
  },
  'still-ok': function stillOk() {
    log.info('[WDS] Nothing changed.');
    if (useWarningOverlay || useErrorOverlay) overlay.clear();
    sendMsg('StillOk');
  },
  'log-level': function logLevel(level) {
    const hotCtx = require.context('webpack/hot', false, /^\.\/log$/);
    if (hotCtx.keys().indexOf('./log') !== -1) {
      hotCtx('./log').setLogLevel(level);
    }
    switch (level) {
      case INFO:
      case ERROR:
        log.setLevel(level);
        break;
      case WARNING:
        // loglevel's warning name is different from webpack's
        log.setLevel('warn');
        break;
      case NONE:
        log.disableAll();
        break;
      default:
        log.error(`[WDS] Unknown clientLogLevel '${level}'`);
    }
  },
  overlay(value) {
    if (typeof document !== 'undefined') {
      if (typeof (value) === 'boolean') {
        useWarningOverlay = false;
        useErrorOverlay = value;
      } else if (value) {
        useWarningOverlay = value.warnings;
        useErrorOverlay = value.errors;
      }
    }
  },
  progress(progress) {
    if (typeof document !== 'undefined') {
      useProgress = progress;
    }
  },
  'progress-update': function progressUpdate(data) {
    if (useProgress) log.info(`[WDS] ${data.percent}% - ${data.msg}.`);
  },
  ok() {
    sendMsg('Ok');
    if (useWarningOverlay || useErrorOverlay) overlay.clear();
    if (initial) return initial = false; // eslint-disable-line no-return-assign
    reloadApp();
  },
  'content-changed': function contentChanged() {
    log.info('[WDS] Content base changed. Reloading...');
    self.location.reload();
  },
  warnings(warnings) {
    log.warn('[WDS] Warnings while compiling.');
    const strippedWarnings = warnings.map(warning => stripAnsi(warning));
    sendMsg('Warnings', strippedWarnings);
    for (let i = 0; i < strippedWarnings.length; i++) { log.warn(strippedWarnings[i]); }
    if (useWarningOverlay) overlay.showMessage(warnings);

    if (initial) return initial = false; // eslint-disable-line no-return-assign
    reloadApp();
  },
  errors(errors) {
    log.error('[WDS] Errors while compiling. Reload prevented.');
    const strippedErrors = errors.map(error => stripAnsi(error));
    sendMsg('Errors', strippedErrors);
    for (let i = 0; i < strippedErrors.length; i++) { log.error(strippedErrors[i]); }
    if (useErrorOverlay) overlay.showMessage(errors);
    initial = false;
  },
  error(error) {
    log.error(error);
  },
  close() {
    log.error('[WDS] Disconnected!');
    sendMsg('Close');
  }
};

let hostname = urlParts.hostname;
let protocol = urlParts.protocol;


// check ipv4 and ipv6 `all hostname`
if (hostname === '0.0.0.0' || hostname === '::') {
  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  // eslint-disable-next-line no-bitwise
  if (self.location.hostname && !!~self.location.protocol.indexOf('http')) {
    hostname = self.location.hostname;
  }
}

// `hostname` can be empty when the script path is relative. In that case, specifying
// a protocol would result in an invalid URL.
// When https is used in the app, secure websockets are always necessary
// because the browser doesn't accept non-secure websockets.
if (hostname && (self.location.protocol === 'https:' || urlParts.hostname === '0.0.0.0')) {
  protocol = self.location.protocol;
}

const socketUrl = url.format({
  protocol,
  auth: urlParts.auth,
  hostname,
  port: urlParts.port,
  pathname: urlParts.path == null || urlParts.path === '/' ? '/sockjs-node' : urlParts.path
});

socket(socketUrl, onSocketMsg);

let isUnloading = false;
self.addEventListener('beforeunload', () => {
  isUnloading = true;
});

function reloadApp() {
  if (isUnloading || !hotReload) {
    return;
  }
  if (hot) {
    log.info('[WDS] App hot update...');
    // eslint-disable-next-line global-require
    const hotEmitter = require('webpack/hot/emitter');
    hotEmitter.emit('webpackHotUpdate', currentHash);
    if (typeof self !== 'undefined' && self.window) {
      // broadcast update to window
      self.postMessage(`webpackHotUpdate${currentHash}`, '*');
    }
  } else {
    let rootWindow = self;
    // use parent window for reload (in case we're in an iframe with no valid src)
    const intervalId = self.setInterval(() => {
      if (rootWindow.location.protocol !== 'about:') {
        // reload immediately if protocol is valid
        applyReload(rootWindow, intervalId);
      } else {
        rootWindow = rootWindow.parent;
        if (rootWindow.parent === rootWindow) {
          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
          applyReload(rootWindow, intervalId);
        }
      }
    });
  }

  function applyReload(rootWindow, intervalId) {
    clearInterval(intervalId);
    log.info('[WDS] App updated. Reloading...');
    rootWindow.location.reload();
  }
}
