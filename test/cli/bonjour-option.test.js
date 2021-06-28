'use strict';

const { testBin, normalizeStderr } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-bonjour'];

describe('"bonjour" CLI option', () => {
  it('should work using "--bonjour"', async () => {
    const { exitCode, stderr } = await testBin(['--bonjour', '--port', port]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });

  it('should work using "--bonjour and --https"', async () => {
    const { exitCode, stderr } = await testBin([
      '--bonjour',
      '--https',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--no-bonjour"', async () => {
    const { exitCode, stderr } = await testBin([
      '--no-bonjour',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
