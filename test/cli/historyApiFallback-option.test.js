'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('"historyApiFallback" CLI option', () => {
  it('--history-api-fallback', async () => {
    const { exitCode, stderr } = await testBin(['--history-api-fallback']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });

  it('--no-history-api-fallback', async () => {
    const { exitCode, stderr } = await testBin(['--no-history-api-fallback']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
