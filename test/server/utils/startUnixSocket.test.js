'use strict';

const net = require('net');
const fs = require('fs');
const path = require('path');
const TestUnixSocket = require('../../helpers/test-unix-socket');
const { skipTestOnWindows } = require('../../helpers/conditional-test');
const startUnixSocket = require('../../../lib/utils/startUnixSocket');

describe('startUnixSocket', () => {
  const socketPath = path.join('.', 'startUnixSocket.webpack.sock');
  let testUnixSocket = null;

  describe('path to a non-existent file', () => {
    let err;
    beforeAll((done) => {
      testUnixSocket = new TestUnixSocket();
      startUnixSocket(testUnixSocket.server, socketPath, (e) => {
        err = e;
        done();
      });
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
      testUnixSocket.close(() => {
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
      testUnixSocket = new TestUnixSocket();
      startUnixSocket(testUnixSocket.server, socketPath, done);
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
      testUnixSocket.close(() => {
        fs.unlink(socketPath, done);
      });
    });
  });

  describe('path to existent file with listening server', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

    let dummyUnixSocket;
    beforeAll((done) => {
      dummyUnixSocket = new TestUnixSocket();
      dummyUnixSocket.server.listen(socketPath, 511, () => {
        done();
      });
    });

    it('should throw already used error', (done) => {
      testUnixSocket = new TestUnixSocket();
      startUnixSocket(testUnixSocket.server, socketPath, (err) => {
        expect(err).not.toBeNull();
        expect(err).not.toBeUndefined();
        expect(err.message).toEqual('This socket is already used');
        testUnixSocket.close(done);
      });
    });

    afterAll((done) => {
      dummyUnixSocket.close(() => {
        fs.unlink(socketPath, done);
      });
    });
  });

  describe('path to existent, unused file', () => {
    beforeAll(() => {
      fs.writeFileSync(socketPath, '');
      testUnixSocket = new TestUnixSocket();
    });

    // this test is significant because previously the callback was called
    // twice if a file at the given socket path already existed, but
    // could be removed
    it('should only call server.listen callback once', (done) => {
      const userCallback = jest.fn();
      startUnixSocket(testUnixSocket.server, socketPath, userCallback);
      setTimeout(() => {
        expect(userCallback).toBeCalledTimes(1);
        done();
      }, 10000);
    });

    afterAll((done) => {
      testUnixSocket.close(done);
    });
  });
});
