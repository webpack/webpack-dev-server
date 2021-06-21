'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');
const ipaddr = require('ipaddr.js');
const internalIp = require('internal-ip');
const killable = require('killable');
const express = require('express');
const { validate } = require('schema-utils');
const normalizeOptions = require('./utils/normalizeOptions');
const colors = require('./utils/colors');
const routes = require('./utils/routes');
const getSocketServerImplementation = require('./utils/getSocketServerImplementation');
const getCompilerConfigArray = require('./utils/getCompilerConfigArray');
const getStatsOption = require('./utils/getStatsOption');
const schema = require('./options.json');

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = true;
}

class Server {
  constructor(options = {}, compiler) {
    // TODO: remove this after plugin support is published
    if (options.hooks) {
      [options, compiler] = [compiler, options];
    }

    validate(schema, options, 'webpack Dev Server');

    this.compiler = compiler;
    this.options = options;
    this.logger = this.compiler.getInfrastructureLogger('webpack-dev-server');
    this.webSocketConnections = [];
    this.staticWatchers = [];
    // Keep track of websocket proxies for external websocket upgrade.
    this.webSocketProxies = [];
    // this value of web socket can be overwritten for tests
    this.webSocketHeartbeatInterval = 30000;

    normalizeOptions(
      this.compiler,
      this.options,
      this.logger,
      Server.findCacheDir()
    );

    this.applyDevServerPlugin();

    this.webSocketServerImplementation = getSocketServerImplementation(
      this.options
    );

    if (this.options.client.progress) {
      this.setupProgressPlugin();
    }

    this.setupHooks();
    this.setupApp();
    this.setupHostHeaderCheck();
    this.setupDevMiddleware();

    // Should be after `webpack-dev-middleware`, otherwise other middlewares might rewrite response
    routes(this);

    this.setupWatchFiles();
    this.setupFeatures();
    this.createServer();

    killable(this.server);

    if (this.options.setupExitSignals) {
      const signals = ['SIGINT', 'SIGTERM'];

      signals.forEach((signal) => {
        process.on(signal, () => {
          this.close(() => {
            // eslint-disable-next-line no-process-exit
            process.exit();
          });
        });
      });
    }

    // Proxy WebSocket without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    // eslint-disable-next-line func-names
    this.webSocketProxies.forEach(function (webSocketProxy) {
      this.server.on('upgrade', webSocketProxy.upgrade);
    }, this);
  }

  static get DEFAULT_STATS() {
    return {
      all: false,
      hash: true,
      assets: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    };
  }

  static getHostname(hostname) {
    if (hostname === 'local-ip') {
      return internalIp.v4.sync() || internalIp.v6.sync() || '0.0.0.0';
    } else if (hostname === 'local-ipv4') {
      return internalIp.v4.sync() || '0.0.0.0';
    } else if (hostname === 'local-ipv6') {
      return internalIp.v6.sync() || '::';
    }

    return hostname;
  }

  static getFreePort(port) {
    const pRetry = require('p-retry');
    const portfinder = require('portfinder');

    if (port && port !== 'auto') {
      return Promise.resolve(port);
    }

    function runPortFinder() {
      return new Promise((resolve, reject) => {
        // Default port
        portfinder.basePort = process.env.WEBPACK_DEV_SERVER_BASE_PORT || 8080;
        portfinder.getPort((error, foundPort) => {
          if (error) {
            return reject(error);
          }

          return resolve(foundPort);
        });
      });
    }

    // Try to find unused port and listen on it for 3 times,
    // if port is not specified in options.
    const defaultPortRetry =
      parseInt(process.env.WEBPACK_DEV_SERVER_PORT_RETRY, 10) || 3;

    return pRetry(runPortFinder, { retries: defaultPortRetry });
  }

  static findCacheDir() {
    const cwd = process.cwd();

    let dir = cwd;

    for (;;) {
      try {
        if (fs.statSync(path.join(dir, 'package.json')).isFile()) break;
        // eslint-disable-next-line no-empty
      } catch (e) {}

      const parent = path.dirname(dir);

      if (dir === parent) {
        // eslint-disable-next-line no-undefined
        dir = undefined;
        break;
      }

      dir = parent;
    }

    if (!dir) {
      return path.resolve(cwd, '.cache/webpack-dev-server');
    } else if (process.versions.pnp === '1') {
      return path.resolve(dir, '.pnp/.cache/webpack-dev-server');
    } else if (process.versions.pnp === '3') {
      return path.resolve(dir, '.yarn/.cache/webpack-dev-server');
    }

    return path.resolve(dir, 'node_modules/.cache/webpack-dev-server');
  }

  applyDevServerPlugin() {
    const DevServerPlugin = require('./utils/DevServerPlugin');

    const compilers = this.compiler.compilers || [this.compiler];

    // eslint-disable-next-line no-shadow
    compilers.forEach((compiler) => {
      new DevServerPlugin(this.options).apply(compiler);
    });
  }

  setupProgressPlugin() {
    const { ProgressPlugin } = this.compiler.webpack || require('webpack');

    new ProgressPlugin((percent, msg, addInfo, pluginName) => {
      percent = Math.floor(percent * 100);

      if (percent === 100) {
        msg = 'Compilation completed';
      }

      if (addInfo) {
        msg = `${msg} (${addInfo})`;
      }

      this.sendMessage(this.webSocketConnections, 'progress-update', {
        percent,
        msg,
        pluginName,
      });

      if (this.server) {
        this.server.emit('progress-update', { percent, msg, pluginName });
      }
    }).apply(this.compiler);
  }

  setupApp() {
    // Init express server
    // eslint-disable-next-line new-cap
    this.app = new express();
  }

  setupHooks() {
    // Listening for events
    const invalidPlugin = () => {
      this.sendMessage(this.webSocketConnections, 'invalid');
    };

    const addHooks = (compiler) => {
      const { compile, invalid, done } = compiler.hooks;

      compile.tap('webpack-dev-server', invalidPlugin);
      invalid.tap('webpack-dev-server', invalidPlugin);
      done.tap('webpack-dev-server', (stats) => {
        this.sendStats(this.webSocketConnections, this.getStats(stats));
        this.stats = stats;
      });
    };

    if (this.compiler.compilers) {
      this.compiler.compilers.forEach(addHooks);
    } else {
      addHooks(this.compiler);
    }
  }

  setupHostHeaderCheck() {
    this.app.all('*', (req, res, next) => {
      if (this.checkHostHeader(req.headers)) {
        return next();
      }

      res.send('Invalid Host header');
    });
  }

  setupDevMiddleware() {
    const webpackDevMiddleware = require('webpack-dev-middleware');

    // middleware for serving webpack bundle
    this.middleware = webpackDevMiddleware(
      this.compiler,
      this.options.devMiddleware
    );
  }

  setupCompressFeature() {
    const compress = require('compression');

    this.app.use(compress());
  }

  setupProxyFeature() {
    const { createProxyMiddleware } = require('http-proxy-middleware');

    const getProxyMiddleware = (proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;

      // It is possible to use the `bypass` method without a `target`.
      // However, the proxy middleware has no use in this case, and will fail to instantiate.
      if (proxyConfig.target) {
        return createProxyMiddleware(context, proxyConfig);
      }
    };
    /**
     * Assume a proxy configuration specified as:
     * proxy: [
     *   {
     *     context: ...,
     *     ...options...
     *   },
     *   // or:
     *   function() {
     *     return {
     *       context: ...,
     *       ...options...
     *     };
     *   }
     * ]
     */
    this.options.proxy.forEach((proxyConfigOrCallback) => {
      let proxyMiddleware;

      let proxyConfig =
        typeof proxyConfigOrCallback === 'function'
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws) {
        this.webSocketProxies.push(proxyMiddleware);
      }

      const handle = async (req, res, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback(req, res, next);

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        // - Check if we have a bypass function defined
        // - In case the bypass function is defined we'll retrieve the
        // bypassUrl from it otherwise bypassUrl would be null
        const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
        const bypassUrl = isByPassFuncDefined
          ? await proxyConfig.bypass(req, res, proxyConfig)
          : null;

        if (typeof bypassUrl === 'boolean') {
          // skip the proxy
          req.url = null;
          next();
        } else if (typeof bypassUrl === 'string') {
          // byPass to that url
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      };

      this.app.use(handle);
      // Also forward error requests to the proxy so it can handle them.
      this.app.use((error, req, res, next) => handle(req, res, next));
    });
  }

  setupHistoryApiFallbackFeature() {
    const historyApiFallback = require('connect-history-api-fallback');

    const options =
      typeof this.options.historyApiFallback !== 'boolean'
        ? this.options.historyApiFallback
        : {};

    let logger;

    if (typeof options.verbose === 'undefined') {
      logger = this.logger.log.bind(
        this.logger,
        '[connect-history-api-fallback]'
      );
    }

    // Fall back to /index.html if nothing else matches.
    this.app.use(historyApiFallback({ logger, ...options }));
  }

  setupStaticFeature() {
    this.options.static.forEach((staticOption) => {
      staticOption.publicPath.forEach((publicPath) => {
        this.app.use(
          publicPath,
          express.static(staticOption.directory, staticOption.staticOptions)
        );
      });
    });
  }

  setupStaticServeIndexFeature() {
    const serveIndex = require('serve-index');

    this.options.static.forEach((staticOption) => {
      staticOption.publicPath.forEach((publicPath) => {
        if (staticOption.serveIndex) {
          this.app.use(publicPath, (req, res, next) => {
            // serve-index doesn't fallthrough non-get/head request to next middleware
            if (req.method !== 'GET' && req.method !== 'HEAD') {
              return next();
            }

            serveIndex(staticOption.directory, staticOption.serveIndex)(
              req,
              res,
              next
            );
          });
        }
      });
    });
  }

  setupStaticWatchFeature() {
    this.options.static.forEach((staticOption) => {
      if (staticOption.watch) {
        this.watchFiles(staticOption.directory, staticOption.watch);
      }
    });
  }

  setupOnBeforeSetupMiddlewareFeature() {
    this.options.onBeforeSetupMiddleware(this);
  }

  setupWatchFiles() {
    if (this.options.watchFiles) {
      const { watchFiles } = this.options;

      if (typeof watchFiles === 'string') {
        this.watchFiles(watchFiles, {});
      } else if (Array.isArray(watchFiles)) {
        watchFiles.forEach((file) => {
          if (typeof file === 'string') {
            this.watchFiles(file, {});
          } else {
            this.watchFiles(file.paths, file.options || {});
          }
        });
      } else {
        // { paths: [...], options: {} }
        this.watchFiles(watchFiles.paths, watchFiles.options || {});
      }
    }
  }

  setupMiddleware() {
    this.app.use(this.middleware);
  }

  setupOnAfterSetupMiddlewareFeature() {
    this.options.onAfterSetupMiddleware(this);
  }

  setupHeadersFeature() {
    this.app.all('*', this.setContentHeaders.bind(this));
  }

  setupMagicHtmlFeature() {
    this.app.get('*', this.serveMagicHtml.bind(this));
  }

  setupFeatures() {
    const features = {
      compress: () => {
        if (this.options.compress) {
          this.setupCompressFeature();
        }
      },
      proxy: () => {
        if (this.options.proxy) {
          this.setupProxyFeature();
        }
      },
      historyApiFallback: () => {
        if (this.options.historyApiFallback) {
          this.setupHistoryApiFallbackFeature();
        }
      },
      static: () => {
        this.setupStaticFeature();
      },
      staticServeIndex: () => {
        this.setupStaticServeIndexFeature();
      },
      staticWatch: () => {
        this.setupStaticWatchFeature();
      },
      onBeforeSetupMiddleware: () => {
        if (typeof this.options.onBeforeSetupMiddleware === 'function') {
          this.setupOnBeforeSetupMiddlewareFeature();
        }
      },
      onAfterSetupMiddleware: () => {
        if (typeof this.options.onAfterSetupMiddleware === 'function') {
          this.setupOnAfterSetupMiddlewareFeature();
        }
      },
      middleware: () => {
        // include our middleware to ensure
        // it is able to handle '/index.html' request after redirect
        this.setupMiddleware();
      },
      headers: () => {
        this.setupHeadersFeature();
      },
      magicHtml: () => {
        this.setupMagicHtmlFeature();
      },
    };

    const runnableFeatures = [];

    // compress is placed last and uses unshift so that it will be the first middleware used
    if (this.options.compress) {
      runnableFeatures.push('compress');
    }

    if (this.options.onBeforeSetupMiddleware) {
      runnableFeatures.push('onBeforeSetupMiddleware');
    }

    runnableFeatures.push('headers', 'middleware');

    if (this.options.proxy) {
      runnableFeatures.push('proxy', 'middleware');
    }

    if (this.options.static) {
      runnableFeatures.push('static');
    }

    if (this.options.historyApiFallback) {
      runnableFeatures.push('historyApiFallback', 'middleware');

      if (this.options.static) {
        runnableFeatures.push('static');
      }
    }

    if (this.options.static) {
      runnableFeatures.push('staticServeIndex', 'staticWatch');
    }

    runnableFeatures.push('magicHtml');

    if (this.options.onAfterSetupMiddleware) {
      runnableFeatures.push('onAfterSetupMiddleware');
    }

    runnableFeatures.forEach((feature) => {
      features[feature]();
    });
  }

  createServer() {
    const https = require('https');
    const http = require('http');

    if (this.options.https) {
      if (this.options.http2) {
        // TODO: we need to replace spdy with http2 which is an internal module
        this.server = require('spdy').createServer(
          {
            ...this.options.https,
            spdy: {
              protocols: ['h2', 'http/1.1'],
            },
          },
          this.app
        );
      } else {
        this.server = https.createServer(this.options.https, this.app);
      }
    } else {
      this.server = http.createServer(this.app);
    }

    this.server.on('error', (error) => {
      throw error;
    });
  }

  createWebSocketServer() {
    // eslint-disable-next-line new-cap
    this.webSocketServer = new this.webSocketServerImplementation(this);

    this.webSocketServer.onConnection((connection, headers) => {
      if (!connection) {
        return;
      }

      if (!headers) {
        this.logger.warn(
          'webSocketServer implementation must pass headers to the callback of onConnection(f) ' +
            'via f(connection, headers) in order for clients to pass a headers security check'
        );
      }

      if (
        !headers ||
        !this.checkHostHeader(headers) ||
        !this.checkOriginHeader(headers)
      ) {
        this.sendMessage([connection], 'error', 'Invalid Host/Origin header');

        this.webSocketServer.closeConnection(connection);

        return;
      }

      this.webSocketConnections.push(connection);

      this.webSocketServer.onConnectionClose(connection, () => {
        const idx = this.webSocketConnections.indexOf(connection);

        if (idx >= 0) {
          this.webSocketConnections.splice(idx, 1);
        }
      });

      if (this.options.hot === true || this.options.hot === 'only') {
        this.sendMessage([connection], 'hot');
      }

      if (this.options.liveReload) {
        this.sendMessage([connection], 'liveReload');
      }

      if (this.options.client.progress) {
        this.sendMessage(
          [connection],
          'progress',
          this.options.client.progress
        );
      }

      if (this.options.client.overlay) {
        this.sendMessage([connection], 'overlay', this.options.client.overlay);
      }

      if (!this.stats) {
        return;
      }

      this.sendStats([connection], this.getStats(this.stats), true);
    });
  }

  openBrowser(uri) {
    const isAbsoluteUrl = require('is-absolute-url');
    const open = require('open');

    // https://github.com/webpack/webpack-dev-server/issues/1990
    const defaultOpenOptions = { wait: false };
    const openTasks = [];

    const getOpenTask = (item) => {
      if (typeof item === 'boolean') {
        return [{ target: uri, options: defaultOpenOptions }];
      }

      if (typeof item === 'string') {
        return [{ target: item, options: defaultOpenOptions }];
      }

      let targets;

      if (item.target) {
        targets = Array.isArray(item.target) ? item.target : [item.target];
      } else {
        targets = [uri];
      }

      return targets.map((target) => {
        const openOptions = defaultOpenOptions;

        if (item.app) {
          if (typeof item.app === 'string') {
            openOptions.app = { name: item.app };
          } else {
            openOptions.app = item.app;
          }
        }

        return { target, options: openOptions };
      });
    };

    if (Array.isArray(this.options.open)) {
      this.options.open.forEach((item) => {
        openTasks.push(...getOpenTask(item));
      });
    } else {
      openTasks.push(...getOpenTask(this.options.open));
    }

    Promise.all(
      openTasks.map((openTask) => {
        let openTarget;

        if (openTask.target) {
          if (typeof openTask.target === 'boolean') {
            openTarget = uri;
          } else {
            openTarget = isAbsoluteUrl(openTask.target)
              ? openTask.target
              : new URL(openTask.target, uri).toString();
          }
        } else {
          openTarget = uri;
        }

        return open(openTarget, openTask.options).catch(() => {
          this.logger.warn(
            `Unable to open "${openTarget}" page${
              // eslint-disable-next-line no-nested-ternary
              openTask.options.app
                ? ` in "${openTask.options.app.name}" app${
                    openTask.options.app.arguments
                      ? ` with "${openTask.options.app.arguments.join(
                          ' '
                        )}" arguments`
                      : ''
                  }`
                : ''
            }. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app".`
          );
        });
      })
    );
  }

  runBonjour() {
    const bonjour = require('bonjour')();
    const os = require('os');

    bonjour.publish({
      name: `Webpack Dev Server ${os.hostname()}:${this.options.port}`,
      port: this.options.port,
      type: this.options.https ? 'https' : 'http',
      subtypes: ['webpack'],
      ...this.options.bonjour,
    });

    process.on('exit', () => {
      bonjour.unpublishAll(() => {
        bonjour.destroy();
      });
    });
  }

  logStatus() {
    const getColorsOption = (configArray) => {
      const statsOption = getStatsOption(configArray);

      let colorsEnabled = false;

      if (typeof statsOption === 'object' && statsOption.colors) {
        colorsEnabled = statsOption.colors;
      }

      return colorsEnabled;
    };

    const useColor = getColorsOption(getCompilerConfigArray(this.compiler));
    const protocol = this.options.https ? 'https' : 'http';
    const { address, port } = this.server.address();
    const prettyPrintUrl = (newHostname) =>
      url.format({ protocol, hostname: newHostname, port, pathname: '/' });

    let server;
    let localhost;
    let loopbackIPv4;
    let loopbackIPv6;
    let networkUrlIPv4;
    let networkUrlIPv6;

    if (this.options.host) {
      if (this.options.host === 'localhost') {
        localhost = prettyPrintUrl('localhost');
      } else {
        let isIP;

        try {
          isIP = ipaddr.parse(this.options.host);
        } catch (error) {
          // Ignore
        }

        if (!isIP) {
          server = prettyPrintUrl(this.options.host);
        }
      }
    }

    const parsedIP = ipaddr.parse(address);

    if (parsedIP.range() === 'unspecified') {
      localhost = prettyPrintUrl('localhost');

      const networkIPv4 = internalIp.v4.sync();

      if (networkIPv4) {
        networkUrlIPv4 = prettyPrintUrl(networkIPv4);
      }

      const networkIPv6 = internalIp.v6.sync();

      if (networkIPv6) {
        networkUrlIPv6 = prettyPrintUrl(networkIPv6);
      }
    } else if (parsedIP.range() === 'loopback') {
      if (parsedIP.kind() === 'ipv4') {
        loopbackIPv4 = prettyPrintUrl(parsedIP.toString());
      } else if (parsedIP.kind() === 'ipv6') {
        loopbackIPv6 = prettyPrintUrl(parsedIP.toString());
      }
    } else {
      networkUrlIPv4 =
        parsedIP.kind() === 'ipv6' && parsedIP.isIPv4MappedAddress()
          ? prettyPrintUrl(parsedIP.toIPv4Address().toString())
          : prettyPrintUrl(address);

      if (parsedIP.kind() === 'ipv6') {
        networkUrlIPv6 = prettyPrintUrl(address);
      }
    }

    this.logger.info('Project is running at:');

    if (server) {
      this.logger.info(`Server: ${colors.info(useColor, server)}`);
    }

    if (localhost || loopbackIPv4 || loopbackIPv6) {
      const loopbacks = []
        .concat(localhost ? [colors.info(useColor, localhost)] : [])
        .concat(loopbackIPv4 ? [colors.info(useColor, loopbackIPv4)] : [])
        .concat(loopbackIPv6 ? [colors.info(useColor, loopbackIPv6)] : []);

      this.logger.info(`Loopback: ${loopbacks.join(', ')}`);
    }

    if (networkUrlIPv4) {
      this.logger.info(
        `On Your Network (IPv4): ${colors.info(useColor, networkUrlIPv4)}`
      );
    }

    if (networkUrlIPv6) {
      this.logger.info(
        `On Your Network (IPv6): ${colors.info(useColor, networkUrlIPv6)}`
      );
    }

    if (this.options.static && this.options.static.length > 0) {
      this.logger.info(
        `Content not from webpack is served from '${colors.info(
          useColor,
          this.options.static
            .map((staticOption) => staticOption.directory)
            .join(', ')
        )}' directory`
      );
    }

    if (this.options.historyApiFallback) {
      this.logger.info(
        `404s will fallback to '${colors.info(
          useColor,
          this.options.historyApiFallback.index || '/index.html'
        )}'`
      );
    }

    if (this.options.bonjour) {
      const bonjourProtocol =
        this.options.bonjour.type || this.options.https ? 'https' : 'http';

      this.logger.info(
        `Broadcasting "${bonjourProtocol}" with subtype of "webpack" via ZeroConf DNS (Bonjour)`
      );
    }

    if (this.options.open) {
      const openTarget = prettyPrintUrl(this.options.host || 'localhost');

      this.openBrowser(openTarget);
    }
  }

  listen(port, hostname, fn) {
    if (
      typeof port !== 'undefined' &&
      typeof this.options.port !== 'undefined' &&
      port !== this.options.port
    ) {
      this.options.port = port;

      this.logger.warn(
        'The "port" specified in options is different from the port passed as an argument. Will be used from arguments.'
      );
    }

    if (!this.options.port) {
      this.options.port = port;
    }

    if (
      typeof hostname !== 'undefined' &&
      typeof this.options.host !== 'undefined' &&
      hostname !== this.options.host
    ) {
      this.options.host = hostname;

      this.logger.warn(
        'The "host" specified in options is different from the host passed as an argument. Will be used from arguments.'
      );
    }

    if (!this.options.host) {
      this.options.host = hostname;
    }

    this.options.host = Server.getHostname(this.options.host);

    return Server.getFreePort(this.options.port)
      .then((foundPort) => {
        this.options.port = foundPort;

        return this.server.listen(
          this.options.port,
          this.options.host,
          (error) => {
            if (Boolean(this.options.hot) || this.options.liveReload) {
              this.createWebSocketServer();
            }

            if (this.options.bonjour) {
              this.runBonjour();
            }

            this.logStatus();

            if (fn) {
              fn.call(this.server, error);
            }

            if (typeof this.options.onListening === 'function') {
              this.options.onListening(this);
            }
          }
        );
      })
      .catch((error) => {
        if (fn) {
          fn.call(this.server, error);
        }
      });
  }

  close(callback) {
    if (this.webSocketServer) {
      this.webSocketServer.close();
      this.webSocketConnections = [];
    }

    const prom = Promise.all(
      this.staticWatchers.map((watcher) => watcher.close())
    );
    this.staticWatchers = [];

    this.server.kill(() => {
      // watchers must be closed before closing middleware
      prom.then(() => {
        this.middleware.close(callback);
      });
    });
  }

  getStats(statsObj) {
    const stats = Server.DEFAULT_STATS;

    const configArr = getCompilerConfigArray(this.compiler);
    const statsOption = getStatsOption(configArr);

    if (typeof statsOption === 'object' && statsOption.warningsFilter) {
      stats.warningsFilter = statsOption.warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  use() {
    // eslint-disable-next-line prefer-spread
    this.app.use.apply(this.app, arguments);
  }

  setContentHeaders(req, res, next) {
    let { headers } = this.options;
    if (headers) {
      if (typeof headers === 'function') {
        headers = headers(req, res, this.middleware.context);
      }
      // eslint-disable-next-line guard-for-in
      for (const name in headers) {
        res.setHeader(name, headers[name]);
      }
    }

    next();
  }

  checkHostHeader(headers) {
    return this.checkHeader(headers, 'host');
  }

  checkOriginHeader(headers) {
    return this.checkHeader(headers, 'origin');
  }

  checkHeader(headers, headerToCheck) {
    // allow user to opt out of this security check, at their own risk
    // by explicitly enabling allowedHosts
    if (this.options.allowedHosts === 'all') {
      return true;
    }

    if (!headerToCheck) {
      headerToCheck = 'host';
    }

    // get the Host header and extract hostname
    // we don't care about port not matching
    const hostHeader = headers[headerToCheck];

    if (!hostHeader) {
      return false;
    }

    // use the node url-parser to retrieve the hostname from the host-header.
    const hostname = url.parse(
      // if hostHeader doesn't have scheme, add // for parsing.
      /^(.+:)?\/\//.test(hostHeader) ? hostHeader : `//${hostHeader}`,
      false,
      true
    ).hostname;

    // always allow requests with explicit IPv4 or IPv6-address.
    // A note on IPv6 addresses:
    // hostHeader will always contain the brackets denoting
    // an IPv6-address in URLs,
    // these are removed from the hostname in url.parse(),
    // so we have the pure IPv6-address in hostname.
    // always allow localhost host, for convenience (hostname === 'localhost')
    // allow hostname of listening address  (hostname === this.options.host)
    const isValidHostname =
      ipaddr.IPv4.isValid(hostname) ||
      ipaddr.IPv6.isValid(hostname) ||
      hostname === 'localhost' ||
      hostname === this.options.host;

    if (isValidHostname) {
      return true;
    }

    const allowedHosts = this.options.allowedHosts;

    // always allow localhost host, for convenience
    // allow if hostname is in allowedHosts
    if (Array.isArray(allowedHosts) && allowedHosts.length) {
      for (let hostIdx = 0; hostIdx < allowedHosts.length; hostIdx++) {
        const allowedHost = allowedHosts[hostIdx];

        if (allowedHost === hostname) {
          return true;
        }

        // support "." as a subdomain wildcard
        // e.g. ".example.com" will allow "example.com", "www.example.com", "subdomain.example.com", etc
        if (allowedHost[0] === '.') {
          // "example.com"  (hostname === allowedHost.substring(1))
          // "*.example.com"  (hostname.endsWith(allowedHost))
          if (
            hostname === allowedHost.substring(1) ||
            hostname.endsWith(allowedHost)
          ) {
            return true;
          }
        }
      }
    }

    // Also allow if `client.webSocketURL.hostname` provided
    if (typeof this.options.client.webSocketURL !== 'undefined') {
      return this.options.client.webSocketURL.hostname === hostname;
    }

    // disallow
    return false;
  }

  sendMessage(webSocketConnections, type, data) {
    webSocketConnections.forEach((webSocketConnection) => {
      this.webSocketServer.send(
        webSocketConnection,
        JSON.stringify({ type, data })
      );
    });
  }

  serveMagicHtml(req, res, next) {
    this.middleware.waitUntilValid(() => {
      const _path = req.path;

      try {
        const filename = this.middleware.getFilenameFromUrl(`${_path}.js`);
        const isFile = this.middleware.context.outputFileSystem
          .statSync(filename)
          .isFile();

        if (!isFile) {
          return next();
        }

        // Serve a page that executes the javascript
        const queries = req._parsedUrl.search || '';
        const responsePage = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="${_path}.js${queries}"></script></body></html>`;

        res.send(responsePage);
      } catch (error) {
        return next();
      }
    });
  }

  // Send stats to a socket or multiple sockets
  sendStats(webSocketConnections, stats, force) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);

    if (shouldEmit) {
      this.sendMessage(webSocketConnections, 'still-ok');

      return;
    }

    this.sendMessage(webSocketConnections, 'hash', stats.hash);

    if (stats.errors.length > 0 || stats.warnings.length > 0) {
      if (stats.warnings.length > 0) {
        this.sendMessage(webSocketConnections, 'warnings', stats.warnings);
      }

      if (stats.errors.length > 0) {
        this.sendMessage(webSocketConnections, 'errors', stats.errors);
      }
    } else {
      this.sendMessage(webSocketConnections, 'ok');
    }
  }

  watchFiles(watchPath, watchOptions) {
    // duplicate the same massaging of options that watchpack performs
    // https://github.com/webpack/watchpack/blob/master/lib/DirectoryWatcher.js#L49
    // this isn't an elegant solution, but we'll improve it in the future
    // eslint-disable-next-line no-undefined
    const usePolling =
      typeof watchOptions.usePolling !== 'undefined'
        ? watchOptions.usePolling
        : Boolean(watchOptions.poll);
    const interval =
      // eslint-disable-next-line no-nested-ternary
      typeof watchOptions.interval !== 'undefined'
        ? watchOptions.interval
        : typeof watchOptions.poll === 'number'
        ? watchOptions.poll
        : // eslint-disable-next-line no-undefined
          undefined;

    const finalWatchOptions = {
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      atomic: false,
      alwaysStat: true,
      ignorePermissionErrors: true,
      ignored: watchOptions.ignored,
      usePolling,
      interval,
    };

    const chokidar = require('chokidar');

    const watcher = chokidar.watch(watchPath, finalWatchOptions);

    // disabling refreshing on changing the content
    if (this.options.liveReload) {
      watcher.on('change', (item) => {
        this.sendMessage(this.webSocketConnections, 'static-changed', item);
      });
    }

    this.staticWatchers.push(watcher);
  }

  invalidate(callback) {
    if (this.middleware) {
      this.middleware.invalidate(callback);
    }
  }
}

const mergeExports = (obj, exports) => {
  const descriptors = Object.getOwnPropertyDescriptors(exports);

  for (const name of Object.keys(descriptors)) {
    const descriptor = descriptors[name];

    if (descriptor.get) {
      const fn = descriptor.get;

      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        get: fn,
      });
    } else if (typeof descriptor.value === 'object') {
      Object.defineProperty(obj, name, {
        configurable: false,
        enumerable: true,
        writable: false,
        value: mergeExports({}, descriptor.value),
      });
    } else {
      throw new Error(
        'Exposed values must be either a getter or an nested object'
      );
    }
  }

  return Object.freeze(obj);
};

module.exports = mergeExports(Server, {
  get schema() {
    return schema;
  },
  // TODO compatibility with webpack v4, remove it after drop
  cli: {
    get getArguments() {
      return () => require('../bin/cli-flags');
    },
    get processArguments() {
      return require('../bin/process-arguments');
    },
  },
});
