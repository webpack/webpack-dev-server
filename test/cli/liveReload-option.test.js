"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-live-reload"];

describe('"liveReload" CLI option', () => {
  it('should work using "--live-reload"', async () => {
    const { exitCode } = await testBin(["--port", port, "--live-reload"]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-live-reload"', async () => {
    const { exitCode } = await testBin(["--port", port, "--no-live-reload"]);

    expect(exitCode).toEqual(0);
  });
});
