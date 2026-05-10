"use strict";

const os = require("node:os");
const path = require("node:path");
const { describe, it } = require("node:test");
const { expect } = require("expect");
const { normalizeStderr, testBin } = require("../helpers/test-bin");

describe('"ipc" CLI option', () => {
  it('should work using "--ipc"', async (t) => {
    const { exitCode, stderr } = await testBin(["--ipc"]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr));
  });

  it('should work using "--ipc=<string>"', async (t) => {
    const isWindows = process.platform === "win32";
    const pipePrefix = isWindows ? "\\\\.\\pipe\\" : os.tmpdir();
    const pipeName = "webpack-dev-server.cli.sock";
    const ipc = path.join(pipePrefix, pipeName);

    const { exitCode, stderr } = await testBin(["--ipc", ipc]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr));
  });
});
