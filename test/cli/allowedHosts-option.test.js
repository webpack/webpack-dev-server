'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"allowedHosts" CLI option', () => {
  it('--allowed-hosts auto', async () => {
    const { exitCode } = await testBin(['--allowed-hosts', 'auto']);

    expect(exitCode).toEqual(0);
  });

  it('--allowed-hosts all', async () => {
    const { exitCode } = await testBin(['--allowed-hosts', 'all']);

    expect(exitCode).toEqual(0);
  });

  it('--allowed-hosts string', async () => {
    const { exitCode } = await testBin(['--allowed-hosts', 'testhouse.com']);

    expect(exitCode).toEqual(0);
  });

  it('--allowed-hosts multiple', async () => {
    const { exitCode } = await testBin([
      '--allowed-hosts',
      'testhost.com',
      '--allowed-hosts',
      'testhost1.com',
    ]);

    expect(exitCode).toEqual(0);
  });
});
