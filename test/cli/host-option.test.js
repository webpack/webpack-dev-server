"use strict";

const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-host"];
const Server = require("../../lib/Server");

const localIPv4 = Server.internalIPSync("v4");
const localIPv6 = Server.internalIPSync("v6");

describe('"host" CLI option', () => {
  it('should work using "--host 0.0.0.0" (IPv4)', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "0.0.0.0",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--host ::" (IPv6)', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "::",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--host ::1" (IPv6)', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "::1",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host localhost"', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "localhost",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host 127.0.0.1" (IPv4)', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "127.0.0.1",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host ::1" (IPv6)', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "::1",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it(`should work using "--host <IPv4>"`, async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      localIPv4,
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it.skip(`should work using "--host <IPv6>"`, async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      localIPv6,
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host local-ip"', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "local-ip",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host local-ipv4"', async () => {
    const { exitCode, killed, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "local-ipv4",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });
});
