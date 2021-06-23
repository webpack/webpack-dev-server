'use strict';

/* eslint-disable
  class-methods-use-this
*/
const WebSocket = require('ws');
const BaseServer = require('./BaseServer');

module.exports = class WebsocketServer extends BaseServer {
  static heartbeatInterval = 30000;

  constructor(server) {
    super(server);

    this.implementation = new WebSocket.Server({
      ...this.server.options.webSocketServer.options,
      noServer: true,
    });

    this.server.server.on('upgrade', (req, sock, head) => {
      if (!this.implementation.shouldHandle(req)) {
        return;
      }

      this.implementation.handleUpgrade(req, sock, head, (connection) => {
        this.implementation.emit('connection', connection, req);
      });
    });

    this.implementation.on('error', (err) => {
      this.server.logger.error(err.message);
    });

    const noop = () => {};

    const interval = setInterval(() => {
      this.implementation.clients.forEach((socket) => {
        if (socket.isAlive === false) {
          return socket.terminate();
        }

        socket.isAlive = false;
        socket.ping(noop);
      });
    }, WebsocketServer.heartbeatInterval);

    this.implementation.on('close', () => {
      clearInterval(interval);
    });
  }

  send(connection, message) {
    // Prevent cases where the server is trying to send data while connection is closing
    if (connection.readyState === WebSocket.OPEN) {
      connection.send(message);
    }
  }

  close(callback) {
    this.implementation.close(callback);
  }

  closeConnection(connection) {
    connection.close();
  }

  // f should be passed the resulting connection and the connection headers
  onConnection(f) {
    this.implementation.on('connection', (connection, req) => {
      connection.isAlive = true;
      connection.on('pong', () => {
        connection.isAlive = true;
      });
      f(connection, req.headers);
    });
  }

  onConnectionClose(connection, f) {
    connection.on('close', f);
  }
};
