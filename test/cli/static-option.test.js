"use strict";

const { describe, it } = require("node:test");
const { expect } = require("expect");
const { normalizeStderr, testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-static"];

describe('"static" CLI option', () => {
  it('should work using "--static"', async (t) => {
    const { exitCode, stderr } = await testBin(["--port", port, "--static"]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static new-static"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static",
      "new-static",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static new-static --static other-static"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static",
      "new-static",
      "--static",
      "other-static",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-reset"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-reset",
      "--static",
      "new-static-after-reset",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-reset --static-directory new-static-directory"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-reset",
      "--static-directory",
      "new-static-directory",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-directory static-dir"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-directory",
      "static-dir",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-public-path /public"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-public-path",
      "/public",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-public-path-reset"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-public-path-reset",
      "--static-public-path",
      "/new-public",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-serve-index"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-serve-index",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--no-static-serve-index"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-static-serve-index",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--static-watch"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--static-watch",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--no-static-watch"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-static-watch",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });
});
