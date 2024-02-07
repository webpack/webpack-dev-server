"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-hot"];

describe('"hot" CLI option', () => {
  it('should work using "--hot"', async () => {
    const { exitCode, killed, stdout } = await testBin(
      ["--port", port, "--hot", "--stats=detailed"],
      {
        outputKillStr: /webpack\/hot\/dev-server\.js/,
      },
    );

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(stdout).toContain("webpack/hot/dev-server.js");
  });

  it('should work using "--no-hot"', async () => {
    const { exitCode, killed, stdout } = await testBin(
      ["--port", port, "--no-hot", "--stats=detailed"],
      {
        outputKillStr: /webpack\/hot\/dev-server\.js/,
      },
    );

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(stdout).not.toContain("webpack/hot/dev-server.js");
  });

  it('should work using "--hot only"', async () => {
    const { exitCode, killed, stdout } = await testBin(
      ["--port", port, "--hot", "only"],
      {
        outputKillStr: /\/hot\/only-dev-server\.js/,
      },
    );

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(stdout).toContain("/hot/only-dev-server.js");
  });
});
