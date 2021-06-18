'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"liveReload" CLI option', () => {
  it('--live-reload', async () => {
    const { exitCode } = await testBin(['--live-reload']);

    expect(exitCode).toEqual(0);
  });

  it('--no-live-reload', async () => {
    const { exitCode } = await testBin(['--no-live-reload']);

    expect(exitCode).toEqual(0);
  });
});
