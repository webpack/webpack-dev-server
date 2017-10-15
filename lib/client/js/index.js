'use strict';

/* global __resourceQuery WorkerGlobalScope self DEV_SERVER_OPTIONS */
/* eslint prefer-destructuring: off */

const log = require('./log');
const socket = require('./socket');
const overlay = require('./overlay');

const INFO = 'info';
const WARNING = 'warning';
const ERROR = 'error';
const NONE = 'none';

// this is piped in at runtime build via DefinePlugin in /lib/plugins.js
const devServerOptions = DEV_SERVER_OPTIONS; // eslint-disable-line no-unused-vars

// let hot = false;
let initial = true;
let currentHash = '';

// let useWarningOverlay = false;
// let useErrorOverlay = false;
// let useProgress = false;
// let urlParts;
let hotReload = true;
let isUnloading = false;

if (typeof devServerOptions.overlay === 'boolean') {
  devServerOptions.overlay = {
    errors: true,
    warnings: false
  };
} else if (typeof devServerOptions.overlay === 'undefined') {
  devServerOptions.overlay = {
    errors: false,
    warnings: false
  };
}

if (typeof window !== 'undefined') {
  const qs = window.location.search.toLowerCase();
  hotReload = qs.indexOf('hmr=false') === -1;
}

// function getCurrentScriptSource() {
//   // `document.currentScript` is the most accurate way to find the current script,
//   // but is not supported in all browsers.
//   if (document.currentScript) {
//     return document.currentScript.getAttribute('src');
//   }
//   // Fall back to getting all scripts in the document.
//   const scriptElements = document.scripts || [];
//   const currentScript = scriptElements[scriptElements.length - 1];
//   if (currentScript) {
//     return currentScript.getAttribute('src');
//   }
//   // Fail as there was no script to use.
//   throw new Error('webpack-dev-server: Failed to get current script source.');
// }

function reload() {
  if (isUnloading || !hotReload) {
    return;
  }
  if (devServerOptions.hot) {
    log.info('App updated, reloading');
    // eslint-disable-next-line global-require
    const hotEmitter = require('webpack/hot/emitter');

    hotEmitter.emit('webpackHotUpdate', currentHash);

    if (typeof self !== 'undefined' && self.window) {
      // broadcast update to window
      self.postMessage('webpackHotUpdate' + currentHash, '*');
    }
  } else {
    let rootWindow = self;
    // use parent window for reload (in case we're in an iframe with no valid src)
    const intervalId = self.setInterval(function findRootWindow() {
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
    log.info('Reloading app');
    rootWindow.location.reload();
  }
}

function publish(type, data) {
  if (typeof self !== 'undefined' &&
     (typeof WorkerGlobalScope === 'undefined' || !(self instanceof WorkerGlobalScope))) {
    self.postMessage({
      type: 'webpack' + type,
      data: data
    }, '*');
  }
}

log.patch();
log.setDefaultLevel(INFO);

self.addEventListener('beforeunload', function beforeUnload() {
  isUnloading = true;
});


// if (typeof __resourceQuery === 'string' && __resourceQuery) {
//   // If this bundle is inlined, use the resource query to get the correct url.
//   // urlParts = url.parse(__resourceQuery.substr(1));
// } else {
//   // Else, get the url from the <script> this file was called with.
//   let scriptHost = getCurrentScriptSource();
//   // eslint-disable-next-line no-useless-escape
//   scriptHost = scriptHost.replace(/\/[^\/]+$/, '');
//   // urlParts = url.parse((scriptHost || '/'), false, true);
// }

// if (!urlParts.port || urlParts.port === '0') {
//   urlParts.port = self.location.port;
// }

// let hostname = urlParts.hostname;
// let protocol = urlParts.protocol;

// check ipv4 and ipv6 `all hostname`
// if (hostname === '0.0.0.0' || hostname === '::') {
//   // why do we need this check?
//   // hostname n/a for file protocol (example, when using electron, ionic)
//   // see: https://github.com/webpack/webpack-dev-server/pull/384
//   // eslint-disable-next-line no-bitwise
//   if (self.location.hostname && !!~self.location.protocol.indexOf('http')) {
//     hostname = self.location.hostname;
//   }
// }
//
// // `hostname` can be empty when the script path is relative. In that case, specifying
// // a protocol would result in an invalid URL.
// // When https is used in the app, secure websockets are always necessary
// // because the browser doesn't accept non-secure websockets.
// if (hostname && (self.location.protocol === 'https:' || urlParts.hostname === '0.0.0.0')) {
//   protocol = self.location.protocol;
// }

const onSocketMsg = {
  close: function msgClose() {
    log.error('Disconnected!');
    publish('Close');
  },

  'content-changed': function contentChanged() {
    log.info('Content base changed. Reloading');
    self.location.reload();
  },

  error: function msgError(error) {
    log.error(error);
  },

  errors: function msgErrors(errors) {
    log.error('Errors while compiling. Reload prevented.');
    publish('Errors', errors);
    for (let i = 0; i < errors.length; i++) {
      log.error(errors[i]);
    }
    if (devServerOptions.overlay) {
      overlay.showMessage(errors);
    }
  },

  hash: function msgHash(hash) {
    currentHash = hash;
  },

  invalid: function msgInvalid() {
    log.info('App updated. Recompiling');
    // fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (overlay.warnings || overlay.errors) {
      overlay.clear();
    }
    publish('Invalid');
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
        log.error('Unknown clientLogLevel \'' + level + '\'');
    }
  },

  ok: function msgOk() {
    publish('Ok');
    if (devServerOptions.overlay.warnings || devServerOptions.overlay.errors) {
      overlay.clear();
    }
    if (initial) {
      return initial = false; // eslint-disable-line no-return-assign
    }
    reload();
  },

  'progress-update': function progressUpdate(data) {
    console.log('got update', devServerOptions.progress);
    if (devServerOptions.progress) {
      log.info('' + data.percent + '% - ' + data.msg + '.');
    }
  },

  'still-ok': function stillOk() {
    log.trace('Nothing changed');
    if (devServerOptions.overlay.warnings || devServerOptions.overlay.errors) {
      overlay.clear();
    }
    publish('still-ok');
  },

  warnings: function msgWarnings(warnings) {
    log.warn('Warnings while compiling.');
    publish('Warnings', warnings);
    for (let i = 0; i < warnings.length; i++) {
      log.warn(warnings[i]);
    }
    if (devServerOptions.overlay.warnings) {
      overlay.showMessage(warnings);
    }

    if (initial) {
      initial = false;
      return initial;
    }
    reload();
  }
};

socket(devServerOptions, onSocketMsg);
