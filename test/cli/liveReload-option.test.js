'use strict';

const { testBin } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-live-reload'];

describe('"liveReload" CLI option', () => {
  it('should work using "--live-reload"', async () => {
    const { exitCode } = await testBin(['--live-reload', '--port', port]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-live-reload"', async () => {
    const { exitCode } = await testBin(['--no-live-reload', '--port', port]);

    expect(exitCode).toEqual(0);
  });
});
