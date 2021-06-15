'use strict';

const path = require('path');
const fs = require('graceful-fs');
const isAbsoluteUrl = require('is-absolute-url');
const getCompilerConfigArray = require('./getCompilerConfigArray');

function normalizeOptions(compiler, options, logger) {
  if (typeof options.allowedHosts === 'undefined') {
    // The "allowedHosts" option allows some default hosts picked from`options.host` or `webSocketURL.host` and `localhost`
    options.allowedHosts = ['auto'];
  } else if (typeof options.allowedHosts === 'string') {
    options.allowedHosts = [options.allowedHosts];
  }

  if (typeof options.bonjour === 'undefined') {
    options.bonjour = false;
  }

  if (typeof options.client === 'undefined') {
    options.client = {};
  }

  if (typeof options.client.hotEntry === 'undefined') {
    options.client.hotEntry = Boolean(
      typeof options.hot === 'boolean' || options.hot === 'only'
        ? options.hot
        : true
    );
  }

  if (typeof options.client.logging === 'undefined') {
    options.client.logging = 'info';
  }

  // The "needClientEntry" option no need to normalize

  if (typeof options.client.overlay === 'undefined') {
    options.client.overlay = true;
  } else if (typeof options.client.overlay !== 'boolean') {
    options.client.overlay = {
      errors: true,
      warnings: true,
      ...options.client.overlay,
    };
  }

  if (typeof options.client.progress === 'undefined') {
    options.client.progress = false;
  }

  // The "transport" no need to normalize

  if (typeof options.client.webSocketURL === 'undefined') {
    options.client.webSocketURL = {};
  } else if (typeof options.client.webSocketURL === 'string') {
    const parsedURL = new URL(options.client.webSocketURL);

    options.client.webSocketURL = {
      protocol: parsedURL.protocol,
      host: parsedURL.hostname,
      port: parsedURL.port.length > 0 ? Number(parsedURL.port) : '',
      path: parsedURL.pathname,
    };
  } else if (typeof options.client.webSocketURL.port === 'string') {
    options.client.webSocketURL.port = Number(options.client.webSocketURL.port);
  }

  if (typeof options.compress === 'undefined') {
    options.compress = true;
  }

  if (typeof options.devMiddleware === 'undefined') {
    options.devMiddleware = {};
  }

  // The "headers" option no need to normalize

  if (typeof options.historyApiFallback === 'undefined') {
    options.historyApiFallback = false;
  } else if (
    typeof options.historyApiFallback === 'boolean' &&
    options.historyApiFallback
  ) {
    options.historyApiFallback = {};
  }

  // The "host" option no need to normalize

  if (typeof options.hot === 'undefined') {
    options.hot = true;
  }

  if (typeof options.http2 === 'undefined') {
    options.http2 = false;
  }

  // if the user enables http2, we can safely enable https
  if ((options.http2 && !options.https) || options.https === true) {
    options.https = {
      requestCert: false,
    };
  }

  if (typeof options.https === 'undefined') {
    options.https = false;
  } else {
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

  if (options.liveReload === 'undefined') {
    options.liveReload = true;
  }

  // The "onAfterSetupMiddleware" option no need to normalize

  // The "onBeforeSetupMiddleware" option no need to normalize

  // The "onListening" option no need to normalize

  // TODO maybe improve this in future
  // The "open" option no need to normalize

  if (typeof options.port === 'undefined') {
    options.port = 'auto';
  } else if (typeof options.port === 'string' && options.port !== 'auto') {
    options.port = Number(options.port);
  }

  /**
   * Assume a proxy configuration specified as:
   * proxy: {
   *   'context': { options }
   * }
   *
   * OR
   *
   * proxy: {
   *   'context': 'target'
   * }
   */
  if (typeof options.proxy !== 'undefined') {
    if (!Array.isArray(options.proxy)) {
      if (Object.prototype.hasOwnProperty.call(options.proxy, 'target')) {
        options.proxy = [options.proxy];
      } else {
        options.proxy = Object.keys(options.proxy).map((context) => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof options.proxy[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: options.proxy[context],
            };
          } else {
            proxyOptions = Object.assign({}, options.proxy[context]);
            proxyOptions.context = correctedContext;
          }

          const getLogLevelForProxy = (level) => {
            if (level === 'none') {
              return 'silent';
            }

            if (level === 'log') {
              return 'info';
            }

            if (level === 'verbose') {
              return 'debug';
            }

            return level;
          };

          const configs = getCompilerConfigArray(compiler);
          const configWithDevServer =
            configs.find((config) => config.devServer) || configs[0];

          if (typeof proxyOptions.logLevel === 'undefined') {
            proxyOptions.logLevel = getLogLevelForProxy(
              configWithDevServer.infrastructureLogging.level
            );
          }

          if (typeof proxyOptions.logProvider === 'undefined') {
            proxyOptions.logProvider = () => logger;
          }

          return proxyOptions;
        });
      }
    }
  }

  if (typeof options.setupExitSignals === 'undefined') {
    options.setupExitSignals = true;
  }

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

  if (options.static.length > 0) {
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

  if (typeof options.watchFiles === 'string') {
    options.watchFiles = [{ paths: options.watchFiles, options: {} }];
  } else if (
    typeof options.watchFiles === 'object' &&
    options.watchFiles !== null &&
    !Array.isArray(options.watchFiles)
  ) {
    options.watchFiles = [
      {
        paths: options.watchFiles.paths,
        options: options.watchFiles.options || {},
      },
    ];
  } else if (Array.isArray(options.watchFiles)) {
    options.watchFiles = options.watchFiles.map((item) => {
      if (typeof item === 'string') {
        return { paths: item, options: {} };
      }

      return {
        paths: item.paths,
        options: item.options || {},
      };
    });
  } else {
    options.watchFiles = [];
  }

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

    if (typeof options.webSocketServer.options.port === 'string') {
      options.webSocketServer.options.port = Number(
        options.webSocketServer.options.port
      );
    }
  }
}

module.exports = normalizeOptions;
