'use strict';

const testServer = require('../helpers/test-server');
const config = require('../fixtures/simple-config/webpack.config');

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
      },
      done
    );
  });

  afterAll(testServer.close);

  it('should runs onListening callback', () => {
    expect(onListeningIsRunning).toBe(true);
  });
});
