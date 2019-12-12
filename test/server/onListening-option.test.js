'use strict';

const { unlink } = require('fs');
const { join } = require('path');
const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['onListening-option'];
const { skipTestOnWindows } = require('../helpers/conditional-test');

describe('onListening option', () => {
  describe('with host and port', () => {
    let onListeningIsRunning = false;

    beforeAll((done) => {
      testServer.start(
        config,
        {
          onListening: (devServer) => {
            if (!devServer) {
              throw new Error('webpack-dev-server is not defined');
            }

            onListeningIsRunning = true;
          },
          port,
        },
        done
      );
    });

    afterAll(testServer.close);

    it('should run onListening callback', () => {
      expect(onListeningIsRunning).toBe(true);
    });
  });

  describe('with Unix socket', () => {
    if (skipTestOnWindows('Unix sockets are not supported on Windows')) {
      return;
    }

    const socketPath = join('.', 'onListening.webpack.sock');
    let onListeningIsRunning = false;

    beforeAll((done) => {
      testServer.start(
        config,
        {
          onListening: (devServer) => {
            if (!devServer) {
              throw new Error('webpack-dev-server is not defined');
            }

            onListeningIsRunning = true;
          },
          socket: socketPath,
        },
        done
      );
    });

    afterAll(testServer.close);

    it('should run onListening callback', (done) => {
      expect(onListeningIsRunning).toBe(true);

      unlink(socketPath, done);
    });
  });
});
