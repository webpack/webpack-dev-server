'use strict';

const { testBin } = require('../helpers/test-bin');

describe('"hot" CLI option', () => {
  it('--hot', async () => {
    const { exitCode, stdout } = await testBin(['--hot', '--stats=detailed']);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('webpack/hot/dev-server.js');
  });

  it('--no-hot', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-hot',
      '--stats=detailed',
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('--hot only', async () => {
    const { exitCode, stdout } = await testBin(['--hot', 'only']);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('/hot/only-dev-server.js');
  });
});
