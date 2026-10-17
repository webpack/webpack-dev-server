import { describe, it } from "node:test";
import { expect } from "expect";
import { testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const port = portsMap["cli-hot"];

describe('"hot" CLI option', () => {
  it('should work using "--hot"', async () => {
    const { exitCode, stdout } = await testBin(
      ["--port", port, "--hot", "--stats=detailed"],
      {
        outputKillStr: /compiled successfully/,
      },
    );

    expect(exitCode).toBe(0);
    // What a build does to the page is said in the client's entry.
    expect(stdout).toMatch(/[?&]apply=hmr&/);
  });

  it('should work using "--no-hot"', async () => {
    const { exitCode, stdout } = await testBin(
      ["--port", port, "--no-hot", "--stats=detailed"],
      {
        outputKillStr: /compiled successfully/,
      },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/[?&]apply=reload&/);
    expect(stdout).not.toMatch(/[?&]apply=hmr/);
  });

  it('should work using "--hot only"', async () => {
    const { exitCode, stdout } = await testBin(
      ["--port", port, "--hot", "only", "--stats=detailed"],
      {
        outputKillStr: /compiled successfully/,
      },
    );

    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/[?&]apply=hmr-only&/);
  });
});
