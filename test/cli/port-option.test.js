import { describe, it } from "node:test";
import { expect } from "expect";
import { normalizeStderr, testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const port = portsMap["cli-port-option"];

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
