'use strict';

const testServer = require('./helpers/test-server');
const config = require('./fixtures/simple-config/webpack.config');

describe('Before And After options', () => {
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

  it('should handle before route', () => {
    expect(onListeningIsRunning).toBe(true);
  });
});
