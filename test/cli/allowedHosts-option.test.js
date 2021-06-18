'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"allowedHosts" CLI option', () => {
  it('should work using "--allowed-hosts auto"', async () => {
    const { exitCode } = await testBin(['--allowed-hosts', 'auto']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts all"', async () => {
    const { exitCode } = await testBin(['--allowed-hosts', 'all']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts testhouse.com"', async () => {
    const { exitCode } = await testBin(['--allowed-hosts', 'testhouse.com']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts testhost.com --allowed-hosts testhost1.com"', async () => {
    const { exitCode } = await testBin([
      '--allowed-hosts',
      'testhost.com',
      '--allowed-hosts',
      'testhost1.com',
    ]);

    expect(exitCode).toEqual(0);
  });
});
