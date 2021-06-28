'use strict';

const { testBin } = require('../helpers/test-bin');
const port = require('../ports-map')['cli-hot'];

describe('"hot" CLI option', () => {
  it('should work using "--hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--hot',
      '--stats=detailed',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('webpack/hot/dev-server.js');
  });

  it('should work using "--no-hot"', async () => {
    const { exitCode, stdout } = await testBin([
      '--no-hot',
      '--stats=detailed',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).not.toContain('webpack/hot/dev-server.js');
  });

  it('should work using "--hot only"', async () => {
    const { exitCode, stdout } = await testBin([
      '--hot',
      'only',
      '--port',
      port,
    ]);

    expect(exitCode).toEqual(0);
    expect(stdout).toContain('/hot/only-dev-server.js');
  });
});
