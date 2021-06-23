'use strict';

const path = require('path');
const os = require('os');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

describe('"ipc" CLI option', () => {
  it('should work using "--ipc"', async () => {
    const { exitCode, stderr } = await testBin(['--ipc']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it('should work using "--ipc=<string>"', async () => {
    const ipc = path.resolve(os.tmpdir(), 'webpack-dev-server.socket');

    const { exitCode, stderr } = await testBin(['--ipc', ipc]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });
});
