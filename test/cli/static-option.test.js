"use strict";

const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-static"];

describe('"static" CLI option', () => {
  it('should work using "--static"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--static"]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static new-static"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static",
      "new-static",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static new-static --static other-static"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static",
      "new-static",
      "--static",
      "other-static",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-reset"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-reset",
      "--static",
      "new-static-after-reset",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-reset --static-directory new-static-directory"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-reset",
      "--static-directory",
      "new-static-directory",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-directory static-dir"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-directory",
      "static-dir",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-public-path /public"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-public-path",
      "/public",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-public-path-reset"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-public-path-reset",
      "--static-public-path",
      "/new-public",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-serve-index"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-serve-index",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--no-static-serve-index"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-static-serve-index",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--static-watch"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-watch",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--no-static-watch"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-static-watch",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });
});
