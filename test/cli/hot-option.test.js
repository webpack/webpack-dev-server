'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"hot" CLI option', () => {
  it('should work using "--hot"', async () => {
    const { exitCode, stdout } = await testBin(['--hot', '--stats=detailed']);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('webpack/hot/dev-server.js');
  });

  it('should work using "--no-hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-hot',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should work using "--hot only"', async () => {
    const { exitCode, stdout } = await testBin(['--hot', 'only']);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('/hot/only-dev-server.js');
  });
});
