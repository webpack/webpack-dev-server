"use strict";

const { normalizeStderr, testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-colors"];

const colorsDefaultStats = require.resolve(
  "../fixtures/cli-colors-default-stats/webpack.config",
);
const colorsDisabled = require.resolve(
  "../fixtures/cli-colors-disabled/webpack.config",
);
const colorsEnabled = require.resolve(
  "../fixtures/cli-colors-enabled/webpack.config",
);

describe("colors", () => {
  it("should work use colors by default", async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--color",
      colorsDefaultStats,
    ]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    expect(stderr).toContain("\u001B[");
  });

  it('should work use colors using "--color"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--color"]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    expect(stderr).toContain("\u001B[");
  });

  it('should work do not use colors using "--no-color"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--no-color"]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    expect(stderr).not.toContain("\u001B[");
  });

  it("should work use colors using configuration with enabled colors", async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--config",
      colorsEnabled,
    ]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    expect(stderr).toContain("\u001B[");
  });

  it("should work and do not use colors using configuration with disabled colors", async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--config",
      colorsDisabled,
    ]);

    expect(exitCode).toBe(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
    expect(stderr).not.toContain("\u001B[");
  });
});
