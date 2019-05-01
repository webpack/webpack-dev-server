'use strict';

/* eslint-disable
  import/order,
  no-shadow,
  no-undefined,
  func-names
*/
const fs = require('fs');
const path = require('path');

const ip = require('ip');
const tls = require('tls');
const url = require('url');
const http = require('http');
const https = require('https');
const sockjs = require('sockjs');

const semver = require('semver');

const killable = require('killable');

const del = require('del');
const chokidar = require('chokidar');

const express = require('express');

const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');

const updateCompiler = require('./utils/updateCompiler');
const createLogger = require('./utils/createLogger');
const createCertificate = require('./utils/createCertificate');
const createFeatures = require('./utils/createFeatures');
const routes = require('./utils/routes');

const validateOptions = require('schema-utils');
const schema = require('./options.json');

// Workaround for sockjs@~0.3.19
// sockjs will remove Origin header, however Origin header is required for checking host.
// See https://github.com/webpack/webpack-dev-server/issues/1604 for more information
{
  // eslint-disable-next-line global-require
  const SockjsSession = require('sockjs/lib/transport').Session;
  const decorateConnection = SockjsSession.prototype.decorateConnection;
  SockjsSession.prototype.decorateConnection = function(req) {
    decorateConnection.call(this, req);
    const connection = this.connection;
    if (
      connection.headers &&
      !('origin' in connection.headers) &&
      'origin' in req.headers
    ) {
      connection.headers.origin = req.headers.origin;
    }
  };
}

// Workaround for node ^8.6.0, ^9.0.0
// DEFAULT_ECDH_CURVE is default to prime256v1 in these version
// breaking connection when certificate is not signed with prime256v1
// change it to auto allows OpenSSL to select the curve automatically
// See https://github.com/nodejs/node/issues/16196 for more infomation
if (semver.satisfies(process.version, '8.6.0 - 9')) {
  tls.DEFAULT_ECDH_CURVE = 'auto';
}

class Server {
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

  constructor(compiler, options = {}, _log) {
    this.log = _log || createLogger(options);

    validateOptions(schema, options, 'webpack Dev Server');

    if (options.lazy && !options.filename) {
      throw new Error("'filename' option must be set in lazy mode.");
    }

    // if the user enables http2, we can safely enable https
    if (options.http2 && !options.https) {
      options.https = true;
    }

    updateCompiler(compiler, options);

    this.originalStats =
      options.stats && Object.keys(options.stats).length ? options.stats : {};

    this.hot = options.hot || options.hotOnly;
    this.headers = options.headers;
    this.progress = options.progress;

    this.serveIndex = options.serveIndex;

    this.clientOverlay = options.overlay;
    this.clientLogLevel = options.clientLogLevel;

    this.publicHost = options.public;
    this.allowedHosts = options.allowedHosts;
    this.disableHostCheck = !!options.disableHostCheck;

    this.sockets = [];

    if (!options.watchOptions) {
      options.watchOptions = {};
    }
    // ignoring node_modules folder by default
    options.watchOptions.ignored = options.watchOptions.ignored || [
      /node_modules/,
    ];
    this.watchOptions = options.watchOptions;

    this.contentBaseWatchers = [];
    // Replace leading and trailing slashes to normalize path
    this.sockPath = `/${
      options.sockPath
        ? options.sockPath.replace(/^\/|\/$/g, '')
        : 'sockjs-node'
    }`;

    // Listening for events
    const invalidPlugin = () => {
      this.sockWrite(this.sockets, 'invalid');
    };

    if (this.progress) {
      const progressPlugin = new webpack.ProgressPlugin(
        (percent, msg, addInfo) => {
          percent = Math.floor(percent * 100);

          if (percent === 100) {
            msg = 'Compilation completed';
          }

          if (addInfo) {
            msg = `${msg} (${addInfo})`;
          }

          this.sockWrite(this.sockets, 'progress-update', { percent, msg });
        }
      );

      progressPlugin.apply(compiler);
    }

    const addHooks = (compiler) => {
      const { compile, invalid, done } = compiler.hooks;

      compile.tap('webpack-dev-server', invalidPlugin);
      invalid.tap('webpack-dev-server', invalidPlugin);
      done.tap('webpack-dev-server', (stats) => {
        this._sendStats(this.sockets, this.getStats(stats));
        this._stats = stats;
      });
    };

    if (compiler.compilers) {
      compiler.compilers.forEach(addHooks);
    } else {
      addHooks(compiler);
    }

    // Init express server
    // eslint-disable-next-line
    const app = (this.app = new express());

    // ref: https://github.com/webpack/webpack-dev-server/issues/1575
    // ref: https://github.com/webpack/webpack-dev-server/issues/1724
    // remove this when send@^0.16.3
    if (express.static && express.static.mime && express.static.mime.types) {
      express.static.mime.types.wasm = 'application/wasm';
    }

    app.all('*', (req, res, next) => {
      if (this.checkHost(req.headers)) {
        return next();
      }

      res.send('Invalid Host header');
    });

    const wdmOptions = { logLevel: this.log.options.level };

    // middleware for serving webpack bundle
    this.middleware = webpackDevMiddleware(
      compiler,
      Object.assign({}, options, wdmOptions)
    );

    // set express routes
    routes(app, this.middleware, options);

    const contentBase =
      options.contentBase !== undefined ? options.contentBase : process.cwd();

    // Keep track of websocket proxies for external websocket upgrade.
    const websocketProxies = [];

    const features = createFeatures.call(this, {
      app,
      compiler,
      options,
      contentBase,
      websocketProxies,
    });

    const defaultFeatures = ['setup', 'before', 'headers', 'middleware'];

    if (options.proxy) {
      defaultFeatures.push('proxy', 'middleware');
    }

    if (contentBase !== false) {
      defaultFeatures.push('contentBaseFiles');
    }

    if (options.watchContentBase) {
      defaultFeatures.push('watchContentBase');
    }

    if (options.historyApiFallback) {
      defaultFeatures.push('historyApiFallback', 'middleware');

      if (contentBase !== false) {
        defaultFeatures.push('contentBaseFiles');
      }
    }

    defaultFeatures.push('magicHtml');

    // checking if it's set to true or not set (Default : undefined => true)
    this.serveIndex = this.serveIndex || this.serveIndex === undefined;

    const shouldHandleServeIndex = contentBase && this.serveIndex;

    if (shouldHandleServeIndex) {
      defaultFeatures.push('contentBaseIndex');
    }

    // compress is placed last and uses unshift so that it will be the first middleware used
    if (options.compress) {
      defaultFeatures.unshift('compress');
    }

    if (options.after) {
      defaultFeatures.push('after');
    }

    (options.features || defaultFeatures).forEach((feature) => {
      features[feature]();
    });

    if (options.https) {
      // for keep supporting CLI parameters
      if (typeof options.https === 'boolean') {
        options.https = {
          ca: options.ca,
          pfx: options.pfx,
          key: options.key,
          cert: options.cert,
          passphrase: options.pfxPassphrase,
          requestCert: options.requestCert || false,
        };
      }

      for (const property of ['ca', 'pfx', 'key', 'cert']) {
        const value = options.https[property];
        const isBuffer = value instanceof Buffer;

        if (value && !isBuffer) {
          let stats = null;

          try {
            stats = fs.lstatSync(fs.realpathSync(value)).isFile();
          } catch (error) {
            // ignore error
          }

          if (stats) {
            // It is file
            options.https[property] = fs.readFileSync(path.resolve(value));
          } else {
            options.https[property] = value;
          }
        }
      }

      let fakeCert;

      if (!options.https.key || !options.https.cert) {
        // Use a self-signed certificate if no certificate was configured.
        // Cycle certs every 24 hours
        const certPath = path.join(__dirname, '../ssl/server.pem');

        let certExists = fs.existsSync(certPath);

        if (certExists) {
          const certTtl = 1000 * 60 * 60 * 24;
          const certStat = fs.statSync(certPath);

          const now = new Date();

          // cert is more than 30 days old, kill it with fire
          if ((now - certStat.ctime) / certTtl > 30) {
            this.log.info(
              'SSL Certificate is more than 30 days old. Removing.'
            );

            del.sync([certPath], { force: true });

            certExists = false;
          }
        }

        if (!certExists) {
          this.log.info('Generating SSL Certificate');

          const attrs = [{ name: 'commonName', value: 'localhost' }];

          const pems = createCertificate(attrs);

          fs.writeFileSync(certPath, pems.private + pems.cert, {
            encoding: 'utf8',
          });
        }

        fakeCert = fs.readFileSync(certPath);
      }

      options.https.key = options.https.key || fakeCert;
      options.https.cert = options.https.cert || fakeCert;

      // Only prevent HTTP/2 if http2 is explicitly set to false
      const isHttp2 = options.http2 !== false;

      // note that options.spdy never existed. The user was able
      // to set options.https.spdy before, though it was not in the
      // docs. Keep options.https.spdy if the user sets it for
      // backwards compatability, but log a deprecation warning.
      if (options.https.spdy) {
        // for backwards compatability: if options.https.spdy was passed in before,
        // it was not altered in any way
        this.log.warn(
          'Providing custom spdy server options is deprecated and will be removed in the next major version.'
        );
      } else {
        // if the normal https server gets this option, it will not affect it.
        options.https.spdy = {
          protocols: ['h2', 'http/1.1'],
        };
      }

      // `spdy` is effectively unmaintained, and as a consequence of an
      // implementation that extensively relies on Node’s non-public APIs, broken
      // on Node 10 and above. In those cases, only https will be used for now.
      // Once express supports Node's built-in HTTP/2 support, migrating over to
      // that should be the best way to go.
      // The relevant issues are:
      // - https://github.com/nodejs/node/issues/21665
      // - https://github.com/webpack/webpack-dev-server/issues/1449
      // - https://github.com/expressjs/express/issues/3388
      if (semver.gte(process.version, '10.0.0') || !isHttp2) {
        if (options.http2) {
          // the user explicitly requested http2 but is not getting it because
          // of the node version.
          this.log.warn(
            'HTTP/2 is currently unsupported for Node 10.0.0 and above, but will be supported once Express supports it'
          );
        }
        this.listeningApp = https.createServer(options.https, app);
      } else {
        /* eslint-disable global-require */
        // The relevant issues are:
        // https://github.com/spdy-http2/node-spdy/issues/350
        // https://github.com/webpack/webpack-dev-server/issues/1592
        this.listeningApp = require('spdy').createServer(options.https, app);
        /* eslint-enable global-require */
      }
    } else {
      this.listeningApp = http.createServer(app);
    }

    killable(this.listeningApp);

    // Proxy websockets without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    websocketProxies.forEach(function(wsProxy) {
      this.listeningApp.on('upgrade', wsProxy.upgrade);
    }, this);
  }

  getStats(statsObj) {
    const stats = Server.DEFAULT_STATS;

    if (this.originalStats.warningsFilter) {
      stats.warningsFilter = this.originalStats.warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  use() {
    // eslint-disable-next-line
    this.app.use.apply(this.app, arguments);
  }

  setContentHeaders(req, res, next) {
    if (this.headers) {
      // eslint-disable-next-line
      for (const name in this.headers) {
        // eslint-disable-line
        res.setHeader(name, this.headers[name]);
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
    // allow user to opt-out this security check, at own risk
    if (this.disableHostCheck) {
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
    if (ip.isV4Format(hostname) || ip.isV6Format(hostname)) {
      return true;
    }
    // always allow localhost host, for convience
    if (hostname === 'localhost') {
      return true;
    }
    // allow if hostname is in allowedHosts
    if (this.allowedHosts && this.allowedHosts.length) {
      for (let hostIdx = 0; hostIdx < this.allowedHosts.length; hostIdx++) {
        const allowedHost = this.allowedHosts[hostIdx];

        if (allowedHost === hostname) {
          return true;
        }

        // support "." as a subdomain wildcard
        // e.g. ".example.com" will allow "example.com", "www.example.com", "subdomain.example.com", etc
        if (allowedHost[0] === '.') {
          // "example.com"
          if (hostname === allowedHost.substring(1)) {
            return true;
          }
          // "*.example.com"
          if (hostname.endsWith(allowedHost)) {
            return true;
          }
        }
      }
    }

    // allow hostname of listening adress
    if (hostname === this.hostname) {
      return true;
    }

    // also allow public hostname if provided
    if (typeof this.publicHost === 'string') {
      const idxPublic = this.publicHost.indexOf(':');

      const publicHostname =
        idxPublic >= 0 ? this.publicHost.substr(0, idxPublic) : this.publicHost;

      if (hostname === publicHostname) {
        return true;
      }
    }

    // disallow
    return false;
  }

  // delegate listen call and init sockjs
  listen(port, hostname, fn) {
    this.hostname = hostname;

    return this.listeningApp.listen(port, hostname, (err) => {
      const socket = sockjs.createServer({
        // Use provided up-to-date sockjs-client
        sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
        // Limit useless logs
        log: (severity, line) => {
          if (severity === 'error') {
            this.log.error(line);
          } else {
            this.log.debug(line);
          }
        },
      });

      socket.on('connection', (connection) => {
        if (!connection) {
          return;
        }

        if (
          !this.checkHost(connection.headers) ||
          !this.checkOrigin(connection.headers)
        ) {
          this.sockWrite([connection], 'error', 'Invalid Host/Origin header');

          connection.close();

          return;
        }

        this.sockets.push(connection);

        connection.on('close', () => {
          const idx = this.sockets.indexOf(connection);

          if (idx >= 0) {
            this.sockets.splice(idx, 1);
          }
        });

        if (this.hot) {
          this.sockWrite([connection], 'hot');
        }

        if (this.progress) {
          this.sockWrite([connection], 'progress', this.progress);
        }

        if (this.clientOverlay) {
          this.sockWrite([connection], 'overlay', this.clientOverlay);
        }

        if (this.clientLogLevel) {
          this.sockWrite([connection], 'log-level', this.clientLogLevel);
        }

        if (!this._stats) {
          return;
        }

        this._sendStats([connection], this.getStats(this._stats), true);
      });

      socket.installHandlers(this.listeningApp, {
        prefix: this.sockPath,
      });

      if (fn) {
        fn.call(this.listeningApp, err);
      }
    });
  }

  close(cb) {
    this.sockets.forEach((socket) => {
      socket.close();
    });

    this.sockets = [];

    this.contentBaseWatchers.forEach((watcher) => {
      watcher.close();
    });

    this.contentBaseWatchers = [];

    this.listeningApp.kill(() => {
      this.middleware.close(cb);
    });
  }

  // eslint-disable-next-line
  sockWrite(sockets, type, data) {
    sockets.forEach((socket) => {
      socket.write(JSON.stringify({ type, data }));
    });
  }

  serveMagicHtml(req, res, next) {
    const _path = req.path;

    try {
      const isFile = this.middleware.fileSystem
        .statSync(this.middleware.getFilenameFromUrl(`${_path}.js`))
        .isFile();

      if (!isFile) {
        return next();
      }
      // Serve a page that executes the javascript
      res.write(
        '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="'
      );
      res.write(_path);
      res.write('.js');
      res.write(req._parsedUrl.search || '');

      res.end('"></script></body></html>');
    } catch (err) {
      return next();
    }
  }

  // send stats to a socket or multiple sockets
  _sendStats(sockets, stats, force) {
    if (
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted)
    ) {
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

  _watch(watchPath) {
    // duplicate the same massaging of options that watchpack performs
    // https://github.com/webpack/watchpack/blob/master/lib/DirectoryWatcher.js#L49
    // this isn't an elegant solution, but we'll improve it in the future
    const usePolling = this.watchOptions.poll ? true : undefined;
    const interval =
      typeof this.watchOptions.poll === 'number'
        ? this.watchOptions.poll
        : undefined;

    const options = {
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      atomic: false,
      alwaysStat: true,
      ignorePermissionErrors: true,
      ignored: this.watchOptions.ignored,
      usePolling,
      interval,
    };

    const watcher = chokidar.watch(watchPath, options);

    watcher.on('change', () => {
      this.sockWrite(this.sockets, 'content-changed');
    });

    this.contentBaseWatchers.push(watcher);
  }

  invalidate() {
    if (this.middleware) {
      this.middleware.invalidate();
    }
  }
}

// Export this logic,
// so that other implementations,
// like task-runners can use it
Server.addDevServerEntrypoints = require('./utils/addEntries');

module.exports = Server;
