"use strict";

const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-http2"];

describe('"http2" CLI option', () => {
  it('should work using "--http2"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--http2"]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--no-http2"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--no-http2"]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
