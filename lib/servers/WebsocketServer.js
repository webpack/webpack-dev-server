'use strict';

/* eslint-disable
  class-methods-use-this
*/
const ws = require('ws');
const BaseServer = require('./BaseServer');

module.exports = class WebsocketServer extends BaseServer {
  constructor(server) {
    super(server);

    this.webSocketServer = new ws.Server({
      ...this.server.options.webSocketServer.options,
      noServer: true,
    });

    this.server.server.on('upgrade', (req, sock, head) => {
      if (!this.webSocketServer.shouldHandle(req)) {
        return;
      }

      this.webSocketServer.handleUpgrade(req, sock, head, (connection) => {
        this.webSocketServer.emit('connection', connection, req);
      });
    });

    this.webSocketServer.on('error', (err) => {
      this.server.logger.error(err.message);
    });

    const noop = () => {};

    setInterval(() => {
      this.webSocketServer.clients.forEach((socket) => {
        if (socket.isAlive === false) {
          return socket.terminate();
        }

        socket.isAlive = false;
        socket.ping(noop);
      });
    }, this.server.webSocketHeartbeatInterval);
  }

  send(connection, message) {
    // prevent cases where the server is trying to send data while connection is closing
    if (connection.readyState !== 1) {
      return;
    }

    connection.send(message);
  }

  close(connection) {
    connection.close();
  }

  // f should be passed the resulting connection and the connection headers
  onConnection(f) {
    this.webSocketServer.on('connection', (connection, req) => {
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
