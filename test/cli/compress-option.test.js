'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"compress" CLI option', () => {
  it('should work using "--compress"', async () => {
    const { exitCode } = await testBin('--compress');

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-compress"', async () => {
    const { exitCode } = await testBin('--no-compress');

    expect(exitCode).toEqual(0);
  });
});
