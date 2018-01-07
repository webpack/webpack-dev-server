'use strict';

require('./polyfills');

const EventEmitter = require('events');
const killable = require('killable');
const supportsColor = require('supports-color');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const weblog = require('webpack-log');
const WebSocket = require('ws');
const app = require('./app');
const features = require('./features');
const OptionsValidationError = require('./OptionsValidationError');
const optionsSchema = require('./schemas/options.json');
const plugins = require('./plugins');
const { http, https } = require('./server');
const { send, sendStats } = require('./util');

const defaults = {
  clientLogLevel: 'info',
  contentBase: process.cwd(),
  host: 'localhost',
  info: true,
  inline: true,
  port: 8080,
  watchOptions: {}
};

module.exports = class DevServer extends EventEmitter {
  constructor(compiler, opts) {
    super();
    const options = Object.assign({}, defaults, opts);
    const validationErrors = webpack.validateSchema(optionsSchema, options);

    if (validationErrors.length) {
      throw new OptionsValidationError(validationErrors);
    } else if (options.lazy && !options.filename) {
      throw new Error('`filename` option must be set in lazy mode.');
    }

    options.color = supportsColor;
    options.clientStats = { errorDetails: false };
    options.disableHostCheck = !!options.disableHostCheck;

    if ((options.logLevel && options.logLevel === 'warning') || options.info === false) {
      options.logLevel = 'warn';
    } else if (options.quiet) {
      options.logLevel = 'silent';
    }

    const log = weblog({
      name: 'wds',
      logLevel: options.logLevel,
      logTime: options.logTime
    });

    this.log = log;
    this.options = options;
    this.app = app.bind(this)(options);
    this.websocketProxies = [];

    if (options.https) {
      this.server = https(this.app, log, options);
    } else {
      this.server = http(this.app);
    }

    // Proxy websockets without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    this.websocketProxies.forEach((proxy) => {
      this.server.on('upgrade', proxy.upgrade);
    });

    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('error', (err) => {
      log.error('WebSocket Server Error', err);
    });

    this.wss.on('listening', () => {
      log.info('WebSocket Server Attached and Listening');
    });

    plugins(compiler, this);

    this.devMiddleware = devMiddleware(compiler, options);
    this.watchers = [];

    features(this);
    killable(this.server);
  }

  close(callback) {
    this.wss.close();

    this.server.close(() => {
      this.devMiddleware.close(() => {
        this.emit('closed');
        if (callback) {
          callback();
        }
      });
    });

    for (const watcher of this.watchers) {
      watcher.close();
    }

    this.watchers = [];
  }

  listen(callback) {
    const { log, wss } = this;
    const { host, port, socket } = this.options;

    const returnValue = this.server.listen(socket || port, host, () => {
      this.emit('listening');

      this.options.activeHostname = host;

      wss.on('connection', (ws) => {
        this.emit('ws-connected', ws);

        ws.on('error', (err) => {
          // Ignore network errors like `ECONNRESET`, `EPIPE`, etc.
          if (err.errno) return;

          log.error(err, err.stack);
        });

        send(ws, this, 'options', this.options);

        if (this.stats) {
          sendStats(ws, this, {
            force: true,
            stats: this.stats.toJson(this.options.clientStats)
          });
        }
      });

      if (callback) {
        callback.call(this.server);
      }
    });

    return returnValue;
  }

  use(...args) {
    this.app.use.apply(this.app, args); // eslint-disable-line prefer-spread
  }
};
