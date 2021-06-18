'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('http2 option', () => {
  it('--http2', async () => {
    const { exitCode, stderr } = await testBin(['--http2']);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('--no-http2', async () => {
    const { exitCode, stderr } = await testBin(['--no-http2']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
