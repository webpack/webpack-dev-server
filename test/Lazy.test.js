'use strict';

const testServer = require('./helpers/test-server');
const config = require('./fixtures/simple-config/webpack.config');

describe('Lazy', () => {
  afterEach(testServer.close);

  it('without filename option it should throw an error', () => {
    expect(() => {
      testServer.start(config, {
        lazy: true,
      });
    }).toThrow(/'filename' option must be set/);
  });

  it('with filename option should not throw an error', (done) => {
    testServer.startBeforeCompilation(
      config,
      {
        lazy: true,
        filename: 'bundle.js',
      },
      done
    );
  });
});
