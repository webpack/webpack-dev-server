'use strict';

require('./polyfills');

const supportsColor = require('supports-color');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const WebSocket = require('ws');
const app = require('./app');
const features = require('./features');
const log = require('./log');
const OptionsValidationError = require('./OptionsValidationError');
const optionsSchema = require('./schemas/options.json');
const plugins = require('./plugins');
const { http, https } = require('./server');
const { sendStats } = require('./util');

const defaults = {
  clientLogLevel: 'info',
  contentBase: process.cwd(),
  info: true,
  inline: true,
  host: 'localhost'
};

module.exports = class DevServer {
  constructor(compiler, opts) {
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

    if (options.logLevel) {
      if (options.logLevel === 'warning') {
        log.setLevel('warn');
      } else {
        log.setLevel(options.logLevel);
      }
    }

    if (options.quiet) {
      log.setLevel('silent');
    } else if (options.info === false) {
      log.setLevel('warn');
    }

    this.log = log;
    this.options = options;

    plugins(compiler, this);

    this.devMiddleware = devMiddleware(compiler, options);
    this.app = app.bind(this)(options);

    features(this);

    if (options.https) {
      this.server = https(this.app, options);
    } else {
      this.server = http(this.app);
    }

    this.wss = new WebSocket.Server({ server: this.server });
  }

  close(callback) {
    this.wss.close();

    this.server.close(() => {
      this.middleware.close(callback);
    });

    if (this.contentBaseWatchers) {
      for (const watcher of this.contentBaseWatchers) {
        watcher.close();
      }
    }

    this.contentBaseWatchers = [];
  }

  listen(callback) {
    const wss = this.wss;
    const { host, port } = this.options;
    const returnValue = this.server.listen(port, host, (err) => {
      this.options.activeHostname = host;

      if (err) {
        log.error(err, err.stack);
      }

      wss.on('connection', (ws) => {
        this.socket = ws;
        this.socket.payload = payload;

        function payload(type, data) {
          return JSON.stringify({ type, data });
        }

        const originalSend = ws.send;

        ws.send = function send() {
          if (ws.readyState !== WebSocket.OPEN) {
            return;
          }

          const args = Array.prototype.slice.call(arguments);
          const cb = function cb(error) {
            // we'll occasionally get an Error('not open'); here
            if (error) {
              // wait a half second and try again
              setTimeout(() => {
                log.debug('ws.send: retrying:', args);
                originalSend.apply(ws, args);
              }, 500);
            }
          };

          args.push(cb);
          log.debug('ws.send:', args);
          originalSend.apply(ws, args);
        };

        ws.send(payload('options', this.options));

        if (this.stats) {
          sendStats(this.socket, {
            force: true,
            stats: this.stats.toJson(this.options.clientStats)
          });
        }
      });

      if (callback) {
        callback.call(this.server, err);
      }
    });

    return returnValue;
  }

  use() {
    this.app.use.apply(this.app, arguments); // eslint-disable-line prefer-spread
  }
};
