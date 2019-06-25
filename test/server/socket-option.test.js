'use strict';

const net = require('net');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const testServer = require('../helpers/test-server');
const TestUnixSocket = require('../helpers/test-unix-socket');
const { skipTestOnWindows } = require('../helpers/conditional-test');
const config = require('../fixtures/simple-config/webpack.config');
const Server = require('../../lib/Server');

describe('socket', () => {
  const socketPath = path.join('.', 'socket-option.webpack.sock');
  let server = null;

  describe('path to a non-existent file', () => {
    let err;
    beforeAll((done) => {
      server = testServer.start(
        config,
        {
          socket: socketPath,
        },
        (e) => {
          err = e;
          done();
        }
      );
    });

    it('should work as Unix socket or error on windows', (done) => {
      if (process.platform === 'win32') {
        expect(err.code).toEqual('EACCES');
        done();
      } else {
        const clientSocket = new net.Socket();
        clientSocket.connect({ path: socketPath }, () => {
          // this means the connection was made successfully
          expect(true).toBeTruthy();
          done();
        });
      }
    });

    afterAll((done) => {
      testServer.close(() => {
        fs.unlink(socketPath, done);
      });
    });
  });

  describe('path to existent, unused file', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

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
      const clientSocket = new net.Socket();
      clientSocket.connect({ path: socketPath }, () => {
        // this means the connection was made successfully
        expect(true).toBeTruthy();
        done();
      });
    });

    afterAll((done) => {
      testServer.close(() => {
        fs.unlink(socketPath, done);
      });
    });
  });

  describe('path to existent file with listening server', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

    let testUnixSocket;
    beforeAll((done) => {
      testUnixSocket = new TestUnixSocket();
      testUnixSocket.server.listen(socketPath, 511, () => {
        done();
      });
    });

    it('should throw already used error', (done) => {
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
    });

    afterAll((done) => {
      testUnixSocket.close(() => {
        fs.unlink(socketPath, done);
      });
    });
  });

  describe('path to existent, unused file', () => {
    let devServer;
    const options = {
      socket: socketPath,
    };
    beforeAll(() => {
      fs.writeFileSync(socketPath, '');
    });

    // this test is significant because previously the callback was called
    // twice if a file at the given socket path already existed, but
    // could be removed
    it('should only call server.listen callback once', (done) => {
      const compiler = webpack(config);

      devServer = new Server(compiler, options);
      const onListen = jest.fn();
      // eslint-disable-next-line no-undefined
      devServer.listen(options.socket, undefined, onListen);
      setTimeout(() => {
        expect(onListen).toBeCalledTimes(1);
        done();
      }, 10000);
    });

    afterAll((done) => {
      devServer.close(done);
    });
  });
});
