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
    const isWindows = process.platform === 'win32';
    const localRelative = path.relative(process.cwd(), `${os.tmpdir()}/`);
    const pipePrefix = isWindows ? '\\\\.\\pipe\\' : localRelative;
    const pipeName = `webpack-dev-server.cli.sock`;
    const ipc = path.join(pipePrefix, pipeName);

    const { exitCode, stderr } = await testBin(['--ipc', ipc]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });
});
