'use strict';

const fs = require('fs');
const path = require('path');
const url = require('url');
const http = require('http');
const https = require('https');
const ipaddr = require('ipaddr.js');
const internalIp = require('internal-ip');
const killable = require('killable');
const chokidar = require('chokidar');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');
const compress = require('compression');
const serveIndex = require('serve-index');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const getFilenameFromUrl = require('webpack-dev-middleware/dist/utils/getFilenameFromUrl')
  .default;
const { validate } = require('schema-utils');
const normalizeOptions = require('./utils/normalizeOptions');
const updateCompiler = require('./utils/updateCompiler');
const getCertificate = require('./utils/getCertificate');
const colors = require('./utils/colors');
const runOpen = require('./utils/runOpen');
const runBonjour = require('./utils/runBonjour');
const routes = require('./utils/routes');
const getSocketServerImplementation = require('./utils/getSocketServerImplementation');
const getCompilerConfigArray = require('./utils/getCompilerConfigArray');
const getStatsOption = require('./utils/getStatsOption');
const getColorsOption = require('./utils/getColorsOption');
const setupExitSignals = require('./utils/setupExitSignals');
const findPort = require('./utils/findPort');
const schema = require('./options.json');

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = true;
}

class Server {
  constructor(compiler, options = {}) {
    validate(schema, options, 'webpack Dev Server');

    this.compiler = compiler;
    this.options = options;
    this.logger = this.compiler.getInfrastructureLogger('webpack-dev-server');
    this.sockets = [];
    this.staticWatchers = [];
    // Keep track of websocket proxies for external websocket upgrade.
    this.websocketProxies = [];
    // this value of ws can be overwritten for tests
    this.wsHeartbeatInterval = 30000;

    normalizeOptions(this.compiler, this.options);
    updateCompiler(this.compiler, this.options);

    this.SocketServerImplementation = getSocketServerImplementation(
      this.options
    );

    if (this.options.client.progress) {
      this.setupProgressPlugin();
    }

    this.setupHooks();
    this.setupApp();
    this.setupCheckHostRoute();
    this.setupDevMiddleware();

    // Should be after `webpack-dev-middleware`, otherwise other middlewares might rewrite response
    routes(this);

    this.setupWatchFiles();
    this.setupFeatures();
    this.setupHttps();
    this.createServer();

    killable(this.server);
    setupExitSignals(this);

    // Proxy WebSocket without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    // eslint-disable-next-line func-names
    this.websocketProxies.forEach(function (wsProxy) {
      this.server.on('upgrade', wsProxy.upgrade);
    }, this);
  }

  setupProgressPlugin() {
    new webpack.ProgressPlugin((percent, msg, addInfo) => {
      percent = Math.floor(percent * 100);

      if (percent === 100) {
        msg = 'Compilation completed';
      }

      if (addInfo) {
        msg = `${msg} (${addInfo})`;
      }

      this.sockWrite(this.sockets, 'progress-update', { percent, msg });

      if (this.server) {
        this.server.emit('progress-update', { percent, msg });
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
      this.sockWrite(this.sockets, 'invalid');
    };

    const addHooks = (compiler) => {
      const { compile, invalid, done } = compiler.hooks;

      compile.tap('webpack-dev-server', invalidPlugin);
      invalid.tap('webpack-dev-server', invalidPlugin);
      done.tap('webpack-dev-server', (stats) => {
        this.sendStats(this.sockets, this.getStats(stats));
        this.stats = stats;
      });
    };

    if (this.compiler.compilers) {
      this.compiler.compilers.forEach(addHooks);
    } else {
      addHooks(this.compiler);
    }
  }

  setupCheckHostRoute() {
    this.app.all('*', (req, res, next) => {
      if (this.checkHost(req.headers)) {
        return next();
      }

      res.send('Invalid Host header');
    });
  }

  setupDevMiddleware() {
    // middleware for serving webpack bundle
    this.middleware = webpackDevMiddleware(this.compiler, this.options.dev);
  }

  setupCompressFeature() {
    this.app.use(compress());
  }

  setupProxyFeature() {
    /**
     * Assume a proxy configuration specified as:
     * proxy: {
     *   'context': { options }
     * }
     * OR
     * proxy: {
     *   'context': 'target'
     * }
     */
    if (!Array.isArray(this.options.proxy)) {
      if (Object.prototype.hasOwnProperty.call(this.options.proxy, 'target')) {
        this.options.proxy = [this.options.proxy];
      } else {
        this.options.proxy = Object.keys(this.options.proxy).map((context) => {
          let proxyOptions;
          // For backwards compatibility reasons.
          const correctedContext = context
            .replace(/^\*$/, '**')
            .replace(/\/\*$/, '');

          if (typeof this.options.proxy[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: this.options.proxy[context],
            };
          } else {
            proxyOptions = Object.assign({}, this.options.proxy[context]);
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

          const configs = getCompilerConfigArray(this.compiler);
          const configWithDevServer =
            configs.find((config) => config.devServer) || configs[0];

          proxyOptions.logLevel = getLogLevelForProxy(
            configWithDevServer.infrastructureLogging.level
          );
          proxyOptions.logProvider = () => this.logger;

          return proxyOptions;
        });
      }
    }

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
        this.websocketProxies.push(proxyMiddleware);
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
    const fallback =
      typeof this.options.historyApiFallback === 'object'
        ? this.options.historyApiFallback
        : null;

    // Fall back to /index.html if nothing else matches.
    this.app.use(historyApiFallback(fallback));
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

  setupHttps() {
    // if the user enables http2, we can safely enable https
    if (
      (this.options.http2 && !this.options.https) ||
      this.options.https === true
    ) {
      this.options.https = {
        requestCert: false,
      };
    }

    if (this.options.https) {
      for (const property of ['ca', 'pfx', 'key', 'cert']) {
        const value = this.options.https[property];
        const isBuffer = value instanceof Buffer;

        if (value && !isBuffer) {
          let stats = null;

          try {
            stats = fs.lstatSync(fs.realpathSync(value)).isFile();
          } catch (error) {
            // ignore error
          }

          // It is file
          this.options.https[property] = stats
            ? fs.readFileSync(path.resolve(value))
            : value;
        }
      }

      let fakeCert;

      if (!this.options.https.key || !this.options.https.cert) {
        fakeCert = getCertificate(this.logger);
      }

      this.options.https.key = this.options.https.key || fakeCert;
      this.options.https.cert = this.options.https.cert || fakeCert;
    }
  }

  createServer() {
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

  createSocketServer() {
    this.socketServer = new this.SocketServerImplementation(this);

    this.socketServer.onConnection((connection, headers) => {
      if (!connection) {
        return;
      }

      if (!headers) {
        this.logger.warn(
          'transportMode.server implementation must pass headers to the callback of onConnection(f) ' +
            'via f(connection, headers) in order for clients to pass a headers security check'
        );
      }

      if (!headers || !this.checkHost(headers) || !this.checkOrigin(headers)) {
        this.sockWrite([connection], 'error', 'Invalid Host/Origin header');

        this.socketServer.close(connection);

        return;
      }

      this.sockets.push(connection);

      this.socketServer.onConnectionClose(connection, () => {
        const idx = this.sockets.indexOf(connection);

        if (idx >= 0) {
          this.sockets.splice(idx, 1);
        }
      });

      if (this.options.client.logging) {
        this.sockWrite([connection], 'logging', this.options.client.logging);
      }

      if (this.options.hot === true || this.options.hot === 'only') {
        this.sockWrite([connection], 'hot');
      }

      if (this.options.liveReload) {
        this.sockWrite([connection], 'liveReload');
      }

      if (this.options.client.progress) {
        this.sockWrite([connection], 'progress', this.options.client.progress);
      }

      if (this.options.client.overlay) {
        this.sockWrite([connection], 'overlay', this.options.client.overlay);
      }

      if (!this.stats) {
        return;
      }

      this.sendStats([connection], this.getStats(this.stats), true);
    });
  }

  showStatus() {
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

    if (this.hostname) {
      if (this.hostname === 'localhost') {
        localhost = prettyPrintUrl('localhost');
      } else {
        let isIP;

        try {
          isIP = ipaddr.parse(this.hostname);
        } catch (error) {
          // Ignore
        }

        if (!isIP) {
          server = prettyPrintUrl(this.hostname);
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

    if (
      this.options.dev &&
      typeof this.options.dev.publicPath !== 'undefined'
    ) {
      this.logger.info(
        `webpack output is served from '${colors.info(
          useColor,
          this.options.dev.publicPath === 'auto'
            ? '/'
            : this.options.dev.publicPath
        )}' URL`
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
      this.logger.info(
        'Broadcasting "http" with subtype of "webpack" via ZeroConf DNS (Bonjour)'
      );
    }

    if (this.options.open) {
      const openTarget = prettyPrintUrl(this.hostname || 'localhost');

      runOpen(openTarget, this.options.open, this.logger);
    }
  }

  listen(port, hostname, fn) {
    if (hostname === 'local-ip') {
      this.hostname = internalIp.v4.sync() || internalIp.v6.sync() || '0.0.0.0';
    } else if (hostname === 'local-ipv4') {
      this.hostname = internalIp.v4.sync() || '0.0.0.0';
    } else if (hostname === 'local-ipv6') {
      this.hostname = internalIp.v6.sync() || '::';
    } else {
      this.hostname = hostname;
    }

    if (typeof port !== 'undefined' && port !== this.options.port) {
      this.logger.warn(
        'The port specified in options and the port passed as an argument is different.'
      );
    }

    return (
      findPort(port || this.options.port)
        // eslint-disable-next-line no-shadow
        .then((port) => {
          this.port = port;
          return this.server.listen(port, this.hostname, (error) => {
            if (this.options.hot || this.options.liveReload) {
              this.createSocketServer();
            }

            if (this.options.bonjour) {
              runBonjour(this.options);
            }

            this.showStatus();

            if (fn) {
              fn.call(this.server, error);
            }

            if (typeof this.options.onListening === 'function') {
              this.options.onListening(this);
            }
          });
        })
        .catch((error) => {
          if (fn) {
            fn.call(this.server, error);
          }
        })
    );
  }

  close(cb) {
    this.sockets.forEach((socket) => {
      this.socketServer.close(socket);
    });

    this.sockets = [];

    const prom = Promise.all(
      this.staticWatchers.map((watcher) => watcher.close())
    );
    this.staticWatchers = [];

    this.server.kill(() => {
      // watchers must be closed before closing middleware
      prom.then(() => {
        this.middleware.close(cb);
      });
    });
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
    if (this.options.headers) {
      // eslint-disable-next-line guard-for-in
      for (const name in this.options.headers) {
        res.setHeader(name, this.options.headers[name]);
      }
    }

    next();
  }

  checkHost(headers) {
    return this.checkHeaders(headers, 'host');
  }

  checkOrigin(headers) {
    return this.checkHeaders(headers, 'origin');
  }

  checkHeaders(headers, headerToCheck) {
    // allow user to opt out of this security check, at their own risk
    // by explicitly disabling firewall
    if (!this.options.firewall) {
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
    // allow hostname of listening address  (hostname === this.hostname)
    const isValidHostname =
      ipaddr.IPv4.isValid(hostname) ||
      ipaddr.IPv6.isValid(hostname) ||
      hostname === 'localhost' ||
      hostname === this.hostname;

    if (isValidHostname) {
      return true;
    }

    const allowedHosts = this.options.firewall;

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

    // also allow public hostname if provided
    if (typeof this.options.public === 'string') {
      const idxPublic = this.options.public.indexOf(':');
      const publicHostname =
        idxPublic >= 0
          ? this.options.public.substr(0, idxPublic)
          : this.options.public;

      if (hostname === publicHostname) {
        return true;
      }
    }

    // disallow
    return false;
  }

  sockWrite(sockets, type, data) {
    sockets.forEach((socket) => {
      this.socketServer.send(socket, JSON.stringify({ type, data }));
    });
  }

  serveMagicHtml(req, res, next) {
    const _path = req.path;

    try {
      const filename = getFilenameFromUrl(
        this.middleware.context,
        `${_path}.js`
      );
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
  }

  // send stats to a socket or multiple sockets
  sendStats(sockets, stats, force) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);

    if (shouldEmit) {
      return this.sockWrite(sockets, 'still-ok');
    }

    this.sockWrite(sockets, 'hash', stats.hash);

    if (stats.errors.length > 0) {
      this.sockWrite(sockets, 'errors', stats.errors);
    } else if (stats.warnings.length > 0) {
      this.sockWrite(sockets, 'warnings', stats.warnings);
    } else {
      this.sockWrite(sockets, 'ok');
    }
  }

  watchFiles(watchPath, watchOptions) {
    // duplicate the same massaging of options that watchpack performs
    // https://github.com/webpack/watchpack/blob/master/lib/DirectoryWatcher.js#L49
    // this isn't an elegant solution, but we'll improve it in the future
    // eslint-disable-next-line no-undefined
    const usePolling = watchOptions.poll ? true : undefined;
    const interval =
      typeof watchOptions.poll === 'number'
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

    const watcher = chokidar.watch(watchPath, finalWatchOptions);

    // disabling refreshing on changing the content
    if (this.options.liveReload) {
      watcher.on('change', () => {
        this.sockWrite(this.sockets, 'content-changed');
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

module.exports = Server;
