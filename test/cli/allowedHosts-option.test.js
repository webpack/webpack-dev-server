'use strict';

const { testBin } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-allowed-hosts'];

describe('"allowedHosts" CLI option', () => {
  it('should work using "--allowed-hosts auto"', async () => {
    const { exitCode } = await testBin([
      '--allowed-hosts',
      'auto',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts all"', async () => {
    const { exitCode } = await testBin([
      '--allowed-hosts',
      'all',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts testhouse.com"', async () => {
    const { exitCode } = await testBin([
      '--allowed-hosts',
      'testhouse.com',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts testhost.com --allowed-hosts testhost1.com"', async () => {
    const { exitCode } = await testBin([
      '--allowed-hosts',
      'testhost.com',
      '--allowed-hosts',
      'testhost1.com',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
  });
});
