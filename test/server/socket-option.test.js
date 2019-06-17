'use strict';

const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');

describe('socket', () => {
  const socketPath = path.join('.', 'socket-option.webpack.sock');
  let server = null;

  describe('path to a non-existent file', () => {
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          socket: socketPath,
        },
        done
      );
    });

    it('should work as Unix socket', (done) => {
      if (process.platform === 'win32') {
        done();
      } else {
        const clientSocket = new net.Socket();
        clientSocket.connect({ path: socketPath }, () => {
          // this means the connection was made successfully
          expect(true).toBeTruthy();
          fs.unlink(socketPath, done);
        });
      }
    });

    afterAll(testServer.close);
  });

  describe('path to existent, unused file', () => {
    beforeAll((done) => {
      fs.writeFileSync(socketPath, '');
      server = testServer.start(
        config,
        {
          socket: socketPath,
        },
        done
      );
    });

    it('should work as Unix socket', (done) => {
      if (process.platform === 'win32') {
        fs.unlink(socketPath, done);
      } else {
        const clientSocket = new net.Socket();
        clientSocket.connect({ path: socketPath }, () => {
          // this means the connection was made successfully
          expect(true).toBeTruthy();
          fs.unlink(socketPath, done);
        });
      }
    });

    afterAll(testServer.close);
  });

  describe('path to existent file with listening server', () => {
    let dummyServer;
    const sockets = new Set();
    beforeAll((done) => {
      dummyServer = http.createServer();
      dummyServer.listen(socketPath, 511, () => {
        done();
      });
      dummyServer.on('connection', (socket) => {
        sockets.add(socket);
        socket.on('close', () => {
          sockets.delete(socket);
        });
      });
    });

    it('should work as Unix socket', (done) => {
      if (process.platform === 'win32') {
        done();
      } else {
        server = testServer.start(
          config,
          {
            socket: socketPath,
          },
          (err) => {
            expect(err).not.toBeNull();
            expect(err).not.toBeUndefined();
            expect(err.message).toEqual('This socket is already used');
            server.close(done);
          }
        );
      }
    });

    afterAll((done) => {
      // get rid of connected sockets on the dummyServer
      for (const socket of sockets.values()) {
        socket.destroy();
      }
      dummyServer.close(() => {
        fs.unlink(socketPath, done);
      });
    });
  });
});
