"use strict";

const { describe, it } = require("node:test");
const { expect } = require("expect");
const { normalizeStderr, testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-history-api-fallback"];

describe('"historyApiFallback" CLI option', () => {
  it('should work using "--history-api-fallback"', async (t) => {
    const { exitCode, stderr } = await testBin(
      ["--port", port, "--history-api-fallback"],
      {
        outputKillStr: /404s will fallback/,
      },
    );

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--no-history-api-fallback"', async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-history-api-fallback",
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });
});
