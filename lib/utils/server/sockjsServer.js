'use strict';

/* eslint-disable
  class-methods-use-this
*/
const sockjs = require('sockjs');
const BaseServer = require('./baseServer');

module.exports = class SockjsServer extends BaseServer {
  // options has: error (function), debug (function), server (http/s server), path (string)
  constructor(options) {
    super();
    this.socket = sockjs.createServer({
      // Use provided up-to-date sockjs-client
      sockjs_url: '/__webpack_dev_server__/sockjs.bundle.js',
      // Limit useless logs
      log: (severity, line) => {
        if (severity === 'error') {
          options.error(line);
          // this.log.error(line);
        } else {
          options.debug(line);
          // this.log.debug(line);
        }
      },
    });

    this.socket.installHandlers(options.server, {
      prefix: options.path,
    });
  }

  send(connection, message) {
    connection.write(message);
  }

  close(connection) {
    connection.close();
  }

  // f should return the resulting connection
  onConnection(f) {
    this.socket.on('connection', f);
  }
};
