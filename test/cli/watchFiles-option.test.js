import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { expect } from "expect";
import { normalizeStderr, testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap["cli-watch-files"];

describe('"watchFiles" CLI option', () => {
  it('should work using "--watch-files <value>"', async (t) => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files",
      watchDirectory,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--watch-files <value> --watch-files <other-value>"', async (t) => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");
    const watchOtherDirectory = path.resolve(
      __dirname,
      "../fixtures/static/simple-config",
    );

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files",
      watchDirectory,
      "--watch-files",
      watchOtherDirectory,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });

  it('should work using "--watch-files-reset --watch-files <static>"', async (t) => {
    const watchDirectory = path.resolve(__dirname, "../fixtures/static/static");

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--watch-files-reset",
      "--watch-files",
      watchDirectory,
    ]);

    expect(exitCode).toBe(0);
    t.assert.snapshot(normalizeStderr(stderr, { ipv6: true }));
  });
});
