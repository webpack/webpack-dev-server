"use strict";

const path = require("path");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-watch-files"];

describe('"watchFiles" CLI option', () => {
  it('should work using "--watch-files <value>"', async () => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files",
      watchDirectory,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--watch-files <value> --watch-files <other-value>"', async () => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");
    const watchOtherDirectory = path.resolve(
      __dirname,
      "../fixtures/static/simple-config"
    );

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files",
      watchDirectory,
      "--watch-files",
      watchOtherDirectory,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--watch-files-reset --watch-files <static>"', async () => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files-reset",
      "--watch-files",
      watchDirectory,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });
});
