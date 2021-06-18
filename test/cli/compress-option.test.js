'use strict';

const { testBin } = require('../helpers/test-bin');

describe('compress option', () => {
  it('--compress', async () => {
    const { exitCode } = await testBin('--compress');

    expect(exitCode).toEqual(0);
  });

  it('--no-compress', async () => {
    const { exitCode } = await testBin('--no-compress');

    expect(exitCode).toEqual(0);
  });
});
