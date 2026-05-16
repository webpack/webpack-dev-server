import { describe, it } from "node:test";
import { expect } from "expect";
import { testBin } from "../helpers/test-bin.js";
import portsMap from "../ports-map.js";

const port = portsMap["cli-allowed-hosts"];

describe('"allowedHosts" CLI option', () => {
  it('should work using "--allowed-hosts auto"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--allowed-hosts",
      "auto",
    ]);

    expect(exitCode).toBe(0);
  });

  it('should work using "--allowed-hosts all"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--allowed-hosts",
      "all",
    ]);

    expect(exitCode).toBe(0);
  });

  it('should work using "--allowed-hosts testhouse.com"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--allowed-hosts",
      "testhouse.com",
    ]);

    expect(exitCode).toBe(0);
  });

  it('should work using "--allowed-hosts testhost.com --allowed-hosts testhost1.com"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--allowed-hosts",
      "testhost.com",
      "--allowed-hosts",
      "testhost1.com",
    ]);

    expect(exitCode).toBe(0);
  });
});
