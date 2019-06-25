'use strict';

const http = require('http');

const TestUnixSocket = class TestUnixSocket {
  constructor() {
    this.server = http.createServer();
    this.sockets = new Set();
    this.server.on('connection', (socket) => {
      this.sockets.add(socket);
      socket.on('close', () => {
        this.sockets.delete(socket);
      });
    });
  }

  close(done) {
    if (this.server.listening) {
      // get rid of connected sockets
      for (const socket of this.sockets.values()) {
        socket.destroy();
      }
      this.server.close(done);
    } else {
      done();
    }
  }
};

module.exports = TestUnixSocket;
