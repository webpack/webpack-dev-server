"use strict";

const path = require("path");
const { promisify } = require("util");
const rimraf = require("rimraf");
const Server = require("../../lib/Server");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-https"];

const del = promisify(rimraf);
const httpsCertificateDirectory = path.resolve(
  __dirname,
  "../fixtures/https-certificate"
);

const defaultCertificateDir = Server.findCacheDir();

describe('"https" CLI option', () => {
  beforeEach(async () => {
    await del(defaultCertificateDir);
  });

  it('should work using "--https"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--https"]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--https-key <path> --https-pfx <path> --https-passphrase webpack-dev-server --https-cert <path> --https-cacert <path>"', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, "server.pfx");
    const key = path.join(httpsCertificateDirectory, "server.key");
    const cert = path.join(httpsCertificateDirectory, "server.crt");
    const cacert = path.join(httpsCertificateDirectory, "ca.pem");
    const passphrase = "webpack-dev-server";

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--https-key",
      key,
      "--https-pfx",
      pfxFile,
      "--https-passphrase",
      passphrase,
      "--https-cert",
      cert,
      "--https-cacert",
      cacert,
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--https-key <path> --https-pfx <path> --https-passphrase webpack-dev-server --https-cert <path> --https-ca <path>"', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, "server.pfx");
    const key = path.join(httpsCertificateDirectory, "server.key");
    const cert = path.join(httpsCertificateDirectory, "server.crt");
    const ca = path.join(httpsCertificateDirectory, "ca.pem");
    const passphrase = "webpack-dev-server";

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--https-key",
      key,
      "--https-pfx",
      pfxFile,
      "--https-passphrase",
      passphrase,
      "--https-cert",
      cert,
      "--https-ca",
      ca,
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--https-key-reset --https-key <path> --https-pfx-reset --https-pfx <path> --https-passphrase webpack-dev-server --https-cert-reset  --https-cert <path> --https-ca-reset --https-ca <path>"', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, "server.pfx");
    const key = path.join(httpsCertificateDirectory, "server.key");
    const cert = path.join(httpsCertificateDirectory, "server.crt");
    const ca = path.join(httpsCertificateDirectory, "ca.pem");
    const passphrase = "webpack-dev-server";

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--https-key-reset",
      "--https-key",
      key,
      "--https-pfx-reset",
      "--https-pfx",
      pfxFile,
      "--https-passphrase",
      passphrase,
      "--https-cert-reset",
      "--https-cert",
      cert,
      "--https-ca-reset",
      "--https-ca",
      ca,
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should warn using "--https-cacert" and "--https-ca" together', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, "server.pfx");
    const key = path.join(httpsCertificateDirectory, "server.key");
    const cert = path.join(httpsCertificateDirectory, "server.crt");
    const cacert = path.join(httpsCertificateDirectory, "ca.pem");
    const passphrase = "webpack-dev-server";

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--https-key",
      key,
      "--https-pfx",
      pfxFile,
      "--https-passphrase",
      passphrase,
      "--https-cert",
      cert,
      "--https-cacert",
      cacert,
      "--https-ca",
      cacert,
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  // For https://github.com/webpack/webpack-dev-server/issues/3306
  it('should work using "--https-key <path> --https-pfx <path> --https-passphrase webpack-dev-server --https-cert <path>"', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, "server.pfx");
    const key = path.join(httpsCertificateDirectory, "server.key");
    const cert = path.join(httpsCertificateDirectory, "server.crt");
    const passphrase = "webpack-dev-server";

    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--https-key",
      key,
      "--https-pfx",
      pfxFile,
      "--https-passphrase",
      passphrase,
      "--https-cert",
      cert,
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--https-request-cert"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--https-request-cert",
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--no-https-request-cert"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--no-https-request-cert",
    ]);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('should work using "--no-https"', async () => {
    const { exitCode, stderr } = await testBin(["--port", port, "--no-https"]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
