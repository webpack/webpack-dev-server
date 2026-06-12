import { describe, it } from "node:test";
import { expect } from "expect";
import { testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const port = portsMap["cli-compress"];

describe('"compress" CLI option', () => {
  it('should work using "--compress"', async () => {
    const { exitCode } = await testBin(["--port", port, "--compress"]);

    expect(exitCode).toBe(0);
  });

  it('should work using "--no-compress"', async () => {
    const { exitCode } = await testBin(["--port", port, "--no-compress"]);

    expect(exitCode).toBe(0);
  });
});
