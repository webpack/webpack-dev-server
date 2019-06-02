'use strict';

/* global __resourceQuery WorkerGlobalScope self */
/* eslint prefer-destructuring: off */
const querystring = require('querystring');
const url = require('url');
const stripAnsi = require('strip-ansi');
const socket = require('./socket');
const overlay = require('./overlay');
const { log, setLogLevel } = require('./utils/log');
const sendMessage = require('./utils/sendMessage');
const reloadApp = require('./utils/reloadApp');
const getCurrentScriptSource = require('./utils/getCurrentScriptSource');

let urlParts;
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

self.addEventListener('beforeunload', () => {
  status.isUnloading = true;
});

if (typeof window !== 'undefined') {
  const qs = window.location.search.toLowerCase();
  options.hotReload = qs.indexOf('hotreload=false') === -1;
}
if (typeof __resourceQuery === 'string' && __resourceQuery) {
  // If this bundle is inlined, use the resource query to get the correct url.
  urlParts = url.parse(__resourceQuery.substr(1));
} else {
  // Else, get the url from the <script> this file was called with.
  let scriptHost = getCurrentScriptSource();
  // eslint-disable-next-line no-useless-escape
  scriptHost = scriptHost.replace(/\/[^\/]+$/, '');
  urlParts = url.parse(scriptHost || '/', false, true);
}

if (!urlParts.port || urlParts.port === '0') {
  urlParts.port = self.location.port;
}

const onSocketMsg = {
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
      overlay.clear();
    }
    sendMessage('Invalid');
  },
  hash(hash) {
    status.currentHash = hash;
  },
  'still-ok': function stillOk() {
    log.info('[WDS] Nothing changed.');
    if (options.useWarningOverlay || options.useErrorOverlay) {
      overlay.clear();
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
      overlay.clear();
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
      overlay.showMessage(warnings);
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
      overlay.showMessage(errors);
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

let { hostname, protocol } = urlParts;

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
if (
  hostname &&
  (self.location.protocol === 'https:' || urlParts.hostname === '0.0.0.0')
) {
  protocol = self.location.protocol;
}

// default values of the sock url if they are not provided
let sockHost = hostname;
let sockPath = '/sockjs-node';
let sockPort = urlParts.port;
if (
  urlParts.path !== null &&
  // eslint-disable-next-line no-undefined
  urlParts.path !== undefined &&
  urlParts.path !== '/'
) {
  const parsedQuery = querystring.parse(urlParts.path);
  // all of these sock url params are optionally passed in through
  // __resourceQuery, so we need to fall back to the default if
  // they are not provided
  sockHost = parsedQuery.sockHost || sockHost;
  sockPath = parsedQuery.sockPath || sockPath;
  sockPort = parsedQuery.sockPort || sockPort;
}

const socketUrl = url.format({
  protocol,
  auth: urlParts.auth,
  hostname: sockHost,
  port: sockPort,
  // If sockPath is provided it'll be passed in via the __resourceQuery as a
  // query param so it has to be parsed out of the querystring in order for the
  // client to open the socket to the correct location.
  pathname: sockPath,
});

socket(socketUrl, onSocketMsg);
