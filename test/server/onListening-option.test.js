'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');
const port = require('../ports-map')['onListening-option'];

describe('onListening option', () => {
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

  it('should runs onListening callback', () => {
    expect(onListeningIsRunning).toBe(true);
  });
});
