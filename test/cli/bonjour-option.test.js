"use strict";

const del = require("del");
const Server = require("../../lib/Server");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-bonjour"];

const defaultCertificateDir = Server.findCacheDir();

describe('"bonjour" CLI option', () => {
  beforeEach(async () => {
    await del([defaultCertificateDir]);
  });

  it('should work using "--bonjour"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--bonjour"]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });

  it('should work using "--bonjour and --https"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--bonjour",
      "--https",
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--no-bonjour"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-bonjour",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
