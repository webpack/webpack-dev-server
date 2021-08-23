"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-magic-html"];

describe('"liveReload" CLI option', () => {
  it('should work using "--magic-html"', async () => {
    const { exitCode } = await testBin(["--port", port, "--magic-html"]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-magic-html"', async () => {
    const { exitCode } = await testBin(["--port", port, "--no-magic-html"]);

    expect(exitCode).toEqual(0);
  });
});
