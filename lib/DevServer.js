'use strict';

require('./polyfills');

const EventEmitter = require('events');
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
  host: 'localhost',
  info: true,
  inline: true,
  port: 8080
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

    this.app = app.bind(this)(options);
    this.devMiddleware = devMiddleware(compiler, options);
    this.watchers = [];
    this.websocketProxies = [];


    features(this);

    if (options.https) {
      this.server = https(this.app, options);
    } else {
      this.server = http(this.app);
    }

    // Proxy websockets without the initial http request
    // https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
    this.websocketProxies.forEach((proxy) => {
      this.server.on('upgrade', proxy.upgrade);
    });

    this.wss = new WebSocket.Server({ server: this.server });
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
    const wss = this.wss;
    const { host, port, socket } = this.options;

    const returnValue = this.server.listen(socket || port, host, (err) => {
      this.emit('listening');

      this.options.activeHostname = host;

      if (err) {
        log.error(err, err.stack);
      }

      wss.on('connection', (ws) => {
        this.emit('ws-connected', ws);

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

          // emit the same events we're sending through websockets, so interested
          // parties can tune in via API without connecitng a client socket
          const payld = args[0];
          if (payld && payld.type) {
            this.emit(`ws-${payld.type}`, payld.data);
          }
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
