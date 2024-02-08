"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-allowed-hosts"];

describe('"allowedHosts" CLI option', () => {
  it('should work using "--allowed-hosts auto"', async () => {
    const foo = await testBin(["--port", port, "--allowed-hosts", "auto"]);

    console.log(foo);

    expect(foo.exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts all"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--allowed-hosts",
      "all",
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--allowed-hosts testhouse.com"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--allowed-hosts",
      "testhouse.com",
    ]);

    expect(exitCode).toEqual(0);
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

    expect(exitCode).toEqual(0);
  });
});
