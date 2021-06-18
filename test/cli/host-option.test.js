'use strict';

const internalIp = require('internal-ip');
const { testBin, normalizeStderr } = require('../helpers/test-bin');

const localIPv4 = internalIp.v4.sync();
const localIPv6 = internalIp.v6.sync();

describe('"host" CLI option', () => {
  it('--host 0.0.0.0 (IPv4)', async () => {
    const { exitCode, stderr } = await testBin(['--host', '0.0.0.0']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--host :: (IPv6)', async () => {
    const { exitCode, stderr } = await testBin(['--host', '::']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot('stderr');
  });

  it('--host ::1 (IPv6)', async () => {
    const { exitCode, stderr } = await testBin(['--host', '::1']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it('--host localhost', async () => {
    const { exitCode, stderr } = await testBin(['--host', 'localhost']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it('--host 127.0.0.1 (IPv4)', async () => {
    const { exitCode, stderr } = await testBin(['--host', '127.0.0.1']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it('--host 0:0:0:0:0:FFFF:7F00:0001 (IPv6)', async () => {
    const { exitCode, stderr } = await testBin([
      '--host',
      '0:0:0:0:0:FFFF:7F00:0001',
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it(`--host <IPv4>`, async () => {
    const { exitCode, stderr } = await testBin(['--host', localIPv4]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it.skip(`--host <IPv6>`, async () => {
    const { exitCode, stderr } = await testBin(['--host', localIPv6]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it('--host <local-ip>', async () => {
    const { exitCode, stderr } = await testBin(['--host', 'local-ip']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });

  it('--host <local-ipv4>', async () => {
    const { exitCode, stderr } = await testBin(['--host', 'local-ipv4']);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot('stderr');
  });
});
