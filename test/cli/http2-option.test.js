"use strict";

const del = require("del");
const Server = require("../../lib/Server");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-http2"];

const defaultCertificateDir = Server.findCacheDir();

describe('"http2" CLI option', () => {
  beforeEach(async () => {
    await del([defaultCertificateDir]);
  });

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
