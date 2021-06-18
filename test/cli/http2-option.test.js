'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('"http2" CLI option', () => {
  it('should work using "--http2"', async () => {
    const { exitCode, stderr } = await testBin(['--http2']);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--no-http2"', async () => {
    const { exitCode, stderr } = await testBin(['--no-http2']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
