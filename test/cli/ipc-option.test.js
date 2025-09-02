"use strict";

const os = require("node:os");
const path = require("node:path");
const { normalizeStderr, testBin } = require("../helpers/test-bin");

describe('"ipc" CLI option', () => {
  it('should work using "--ipc"', async () => {
    const { exitCode, stderr } = await testBin(["--ipc"]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--ipc=<string>"', async () => {
    const isWindows = process.platform === "win32";
    const pipePrefix = isWindows ? "\\\\.\\pipe\\" : os.tmpdir();
    const pipeName = "webpack-dev-server.cli.sock";
    const ipc = path.join(pipePrefix, pipeName);

    const { exitCode, stderr } = await testBin(["--ipc", ipc]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });
});
