'use strict';

const path = require('path');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

const httpsCertificateDirectory = path.resolve(
  __dirname,
  '../fixtures/https-certificate'
);

describe('"https" CLI option', () => {
  it('--https', async () => {
    const { exitCode, stderr } = await testBin(['--https']);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('https options', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, 'server.pfx');
    const key = path.join(httpsCertificateDirectory, 'server.key');
    const cert = path.join(httpsCertificateDirectory, 'server.crt');
    const cacert = path.join(httpsCertificateDirectory, 'ca.pem');
    const passphrase = 'webpack-dev-server';

    const { exitCode, stderr } = await testBin(
      `--https-key ${key} --https-pfx ${pfxFile} --https-passphrase ${passphrase} --https-cert ${cert} --https-cacert ${cacert}`
    );

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  // For https://github.com/webpack/webpack-dev-server/issues/3306
  it('https and other related options', async () => {
    const pfxFile = path.join(httpsCertificateDirectory, 'server.pfx');
    const key = path.join(httpsCertificateDirectory, 'server.key');
    const cert = path.join(httpsCertificateDirectory, 'server.crt');
    const passphrase = 'webpack-dev-server';

    const { exitCode, stderr } = await testBin(
      `--https-key ${key} --https-pfx ${pfxFile} --https-passphrase ${passphrase} --https-cert ${cert}`
    );

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('--https-request-cert', async () => {
    const { exitCode, stderr } = await testBin(['--https-request-cert']);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('--no-https-request-cert', async () => {
    const { exitCode, stderr } = await testBin(['--no-https-request-cert']);

    expect(exitCode).toEqual(0);
    expect(
      normalizeStderr(stderr, { ipv6: true, https: true })
    ).toMatchSnapshot();
  });

  it('--no-https', async () => {
    const { exitCode, stderr } = await testBin(['--no-https']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot();
  });
});
