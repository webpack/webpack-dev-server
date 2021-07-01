'use strict';

const { testBin } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-compress'];

describe('"compress" CLI option', () => {
  it('should work using "--compress"', async () => {
    const { exitCode } = await testBin(['--port', port, '--compress']);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-compress"', async () => {
    const { exitCode } = await testBin(['--port', port, '--no-compress']);

    expect(exitCode).toEqual(0);
  });
});
