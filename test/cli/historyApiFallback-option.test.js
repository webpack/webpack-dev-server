'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-history-api-fallback'];

describe('"historyApiFallback" CLI option', () => {
  it('should work using "--history-api-fallback"', async () => {
    const { exitCode, stderr } = await testBin([
      '--history-api-fallback',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });

  it('should work using "--no-history-api-fallback"', async () => {
    const { exitCode, stderr } = await testBin([
      '--no-history-api-fallback',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
