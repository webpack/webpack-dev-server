"use strict";

const { describe, it } = require("node:test");
const { expect } = require("expect");
const { normalizeStderr, testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-port-option"];

describe('"port" CLI option', () => {
  it('should work using "--port <string>"', async (t) => {
    const { exitCode, stderr } = await testBin(["--port", port]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--port auto"', async (t) => {
    const { exitCode, stderr } = await testBin(["--port", "auto"]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });
});
