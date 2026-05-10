"use strict";

const path = require("node:path");
const { describe, it } = require("node:test");
const { expect } = require("expect");
const { normalizeStderr, testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-watch-files"];

describe('"watchFiles" CLI option', () => {
  it('should work using "--watch-files <value>"', async (t) => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files",
      watchDirectory,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--watch-files <value> --watch-files <other-value>"', async (t) => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");
    const watchOtherDirectory = path.resolve(
      __dirname,
      "../fixtures/static/simple-config",
    );

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files",
      watchDirectory,
      "--watch-files",
      watchOtherDirectory,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--watch-files-reset --watch-files <static>"', async (t) => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files-reset",
      "--watch-files",
      watchDirectory,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });
});
