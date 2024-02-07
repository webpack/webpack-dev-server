"use strict";

const fs = require("fs");
const Server = require("../../lib/Server");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-bonjour"];

const defaultCertificateDir = Server.findCacheDir();

describe('"bonjour" CLI option', () => {
  beforeEach(async () => {
    fs.rmSync(defaultCertificateDir, { recursive: true, force: true });
  });

  it('should work using "--bonjour"', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--bonjour",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });

  it('should work using "--bonjour and --server-type=https"', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--bonjour",
      "--server-type=https",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true }),
    ).toMatchSnapshot();
  });

  it('should work using "--no-bonjour"', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--no-bonjour",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
