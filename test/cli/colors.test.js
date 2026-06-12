import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { expect } from "expect";
import { normalizeStderr, testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const port = portsMap["cli-colors"];

const colorsDefaultStats = fileURLToPath(
  import.meta.resolve("../fixtures/cli-colors-default-stats/webpack.config.js"),
);
const colorsDisabled = fileURLToPath(
  import.meta.resolve("../fixtures/cli-colors-disabled/webpack.config.js"),
);
const colorsEnabled = fileURLToPath(
  import.meta.resolve("../fixtures/cli-colors-enabled/webpack.config.js"),
);

describe("colors", () => {
  it("should work use colors by default", async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--color",
      colorsDefaultStats,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    expect(stderr).toContain("\u001B[");
  });

  it('should work use colors using "--color"', async (t) => {
    const { exitCode, stderr } = await testBin(["--port", port, "--color"]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    expect(stderr).toContain("\u001B[");
  });

  it('should work do not use colors using "--no-color"', async (t) => {
    const { exitCode, stderr } = await testBin(["--port", port, "--no-color"]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    expect(stderr).not.toContain("\u001B[");
  });

  it("should work use colors using configuration with enabled colors", async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--config",
      colorsEnabled,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    expect(stderr).toContain("\u001B[");
  });

  it("should work and do not use colors using configuration with disabled colors", async (t) => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--config",
      colorsDisabled,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
    expect(stderr).not.toContain("\u001B[");
  });
});
