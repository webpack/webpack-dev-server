'use strict';

const { testBin } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-compress'];

describe('"compress" CLI option', () => {
  it('should work using "--compress"', async () => {
    const { exitCode } = await testBin(['--compress', '--port', port]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-compress"', async () => {
    const { exitCode } = await testBin(['--no-compress', '--port', port]);

    expect(exitCode).toEqual(0);
  });
});
