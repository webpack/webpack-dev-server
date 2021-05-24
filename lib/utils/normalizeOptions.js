'use strict';

const path = require('path');
const fs = require('graceful-fs');
const isAbsoluteUrl = require('is-absolute-url');
const getCompilerConfigArray = require('./getCompilerConfigArray');

function normalizeOptions(compiler, options, logger) {
  // TODO: improve this to not use .find for compiler watchOptions
  const configArr = getCompilerConfigArray(compiler);
  const watchOptionsConfig = configArr.find(
    (config) => config.watch !== false && config.watchOptions
  );
  const watchOptions = watchOptionsConfig
    ? watchOptionsConfig.watchOptions
    : {};

  const defaultOptionsForStatic = {
    directory: path.join(process.cwd(), 'public'),
    staticOptions: {},
    publicPath: ['/'],
    serveIndex: { icons: true },
    // Respect options from compiler watchOptions
    watch: watchOptions,
  };

  if (typeof options.static === 'undefined') {
    options.static = [defaultOptionsForStatic];
  } else if (typeof options.static === 'boolean') {
    options.static = options.static ? [defaultOptionsForStatic] : false;
  } else if (typeof options.static === 'string') {
    options.static = [
      { ...defaultOptionsForStatic, directory: options.static },
    ];
  } else if (Array.isArray(options.static)) {
    options.static = options.static.map((item) => {
      if (typeof item === 'string') {
        return { ...defaultOptionsForStatic, directory: item };
      }

      return { ...defaultOptionsForStatic, ...item };
    });
  } else {
    options.static = [{ ...defaultOptionsForStatic, ...options.static }];
  }

  if (options.static) {
    options.static.forEach((staticOption) => {
      if (isAbsoluteUrl(staticOption.directory)) {
        throw new Error('Using a URL as static.directory is not supported');
      }

      // ensure that publicPath is an array
      if (typeof staticOption.publicPath === 'string') {
        staticOption.publicPath = [staticOption.publicPath];
      }

      // ensure that watch is an object if true
      if (staticOption.watch === true) {
        staticOption.watch = defaultOptionsForStatic.watch;
      }

      // ensure that serveIndex is an object if true
      if (staticOption.serveIndex === true) {
        staticOption.serveIndex = defaultOptionsForStatic.serveIndex;
      }
    });
  }

  options.hot =
    typeof options.hot === 'boolean' || options.hot === 'only'
      ? options.hot
      : true;
  options.liveReload =
    typeof options.liveReload !== 'undefined' ? options.liveReload : true;

  const defaultWebSocketServerType = 'ws';
  const defaultWebSocketServerOptions = { path: '/ws' };

  if (typeof options.webSocketServer === 'undefined') {
    options.webSocketServer = {
      type: defaultWebSocketServerType,
      options: defaultWebSocketServerOptions,
    };
  } else if (
    typeof options.webSocketServer === 'string' ||
    typeof options.webSocketServer === 'function'
  ) {
    options.webSocketServer = {
      type: options.webSocketServer,
      options: defaultWebSocketServerOptions,
    };
  } else {
    options.webSocketServer = {
      type: options.webSocketServer.type || defaultWebSocketServerType,
      options: {
        ...defaultWebSocketServerOptions,
        ...options.webSocketServer.options,
      },
    };
  }

  if (!options.client) {
    options.client = {};
  }

  // Enable client overlay by default
  if (typeof options.client.overlay === 'undefined') {
    options.client.overlay = true;
  }

  // client.hotEntry
  if (typeof options.client.hotEntry === 'undefined') {
    options.client.hotEntry = options.hot;
  }

  options.devMiddleware = options.devMiddleware || {};

  if (typeof options.firewall === 'undefined') {
    // firewall is enabled by default
    options.firewall = true;
  }

  if (typeof options.setupExitSignals === 'undefined') {
    options.setupExitSignals = true;
  }

  if (typeof options.compress === 'undefined') {
    options.compress = true;
  }

  // if the user enables http2, we can safely enable https
  if ((options.http2 && !options.https) || options.https === true) {
    options.https = {
      requestCert: false,
    };
  }

  if (options.https) {
    const getCertificate = require('./getCertificate');

    for (const property of ['cacert', 'pfx', 'key', 'cert']) {
      const value = options.https[property];
      const isBuffer = value instanceof Buffer;

      if (value && !isBuffer) {
        let stats = null;

        try {
          stats = fs.lstatSync(fs.realpathSync(value)).isFile();
        } catch (error) {
          // ignore error
        }

        // It is file
        options.https[property] = stats
          ? fs.readFileSync(path.resolve(value))
          : value;
      }
    }

    let fakeCert;

    if (!options.https.key || !options.https.cert) {
      fakeCert = getCertificate(logger);
    }

    options.https.key = options.https.key || fakeCert;
    options.https.cert = options.https.cert || fakeCert;
  }
}

module.exports = normalizeOptions;
