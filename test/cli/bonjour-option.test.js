'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('bonjour option', () => {
  it('--bonjour', async () => {
    const { exitCode, stderr } = await testBin(['--bonjour']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });

  it('--bonjour and --https', async () => {
    const { exitCode, stderr } = await testBin(['--bonjour', '--https']);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('--no-bonjour', async () => {
    const { exitCode, stderr } = await testBin(['--no-bonjour']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
