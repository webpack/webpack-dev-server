"use strict";

const os = require("os");
const { testBin, normalizeStderr } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-host"];
const Server = require("../../lib/Server");

const localIPv4 = Server.findIp("v4", false);
const localIPv6 = Server.findIp("v6", false);

describe('"host" CLI option', () => {
  it('should work using "--host 0.0.0.0" (IPv4)', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "0.0.0.0",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--host ::" (IPv6)', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "::",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr, { ipv6: true })).toMatchSnapshot("stderr");
  });

  it('should work using "--host ::1" (IPv6)', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "::1",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host localhost"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "localhost",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host 127.0.0.1" (IPv4)', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "127.0.0.1",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host ::1" (IPv6)', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "::1",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it(`should work using "--host <IPv4>"`, async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      localIPv4,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it.skip(`should work using "--host <IPv6>"`, async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      localIPv6,
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host local-ip"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "local-ip",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });

  it('should work using "--host local-ip" take the first network found', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "local-ip",
    ]);

    expect(exitCode).toEqual(0);
    jest.spyOn(os, "networkInterfaces").mockImplementation(() => {
      return {
        lo: [
          {
            address: "127.0.0.1",
            netmask: "255.0.0.0",
            family: "IPv4",
            mac: "00:00:00:00:00:00",
            internal: true,
            cidr: "127.0.0.1/8",
          },
          {
            address: "::1",
            netmask: "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff",
            family: "IPv6",
            mac: "00:00:00:00:00:00",
            internal: true,
            cidr: "::1/128",
            scopeid: 0,
          },
        ],
        enp6s0: [
          {
            address: "192.168.1.15",
            netmask: "255.255.255.0",
            family: "IPv4",
            mac: "50:eb:f6:97:9f:6f",
            internal: false,
            cidr: "192.168.1.15/24",
          },
          {
            address: "2a01:cb0c:1623:6800:4ff8:723c:1a4b:fe5d",
            netmask: "ffff:ffff:ffff:ffff::",
            family: "IPv6",
            mac: "50:eb:f6:97:9f:6f",
            internal: false,
            cidr: "2a01:cb0c:1623:6800:4ff8:723c:1a4b:fe5d/64",
            scopeid: 0,
          },
          {
            address: "2a01:cb0c:1623:6800:9acc:408c:ee87:27cf",
            netmask: "ffff:ffff:ffff:ffff::",
            family: "IPv6",
            mac: "50:eb:f6:97:9f:6f",
            internal: false,
            cidr: "2a01:cb0c:1623:6800:9acc:408c:ee87:27cf/64",
            scopeid: 0,
          },
          {
            address: "fe80::bf2a:e5e2:8f9:4336",
            netmask: "ffff:ffff:ffff:ffff::",
            family: "IPv6",
            mac: "50:eb:f6:97:9f:6f",
            internal: false,
            cidr: "fe80::bf2a:e5e2:8f9:4336/64",
            scopeid: 2,
          },
        ],
        "br-9bb0264f9b1c": [
          {
            address: "172.19.0.1",
            netmask: "255.255.0.0",
            family: "IPv4",
            mac: "02:42:e4:c8:6e:5f",
            internal: false,
            cidr: "172.19.0.1/16",
          },
          {
            address: "fe80::42:e4ff:fec8:6e5f",
            netmask: "ffff:ffff:ffff:ffff::",
            family: "IPv6",
            mac: "02:42:e4:c8:6e:5f",
            internal: false,
            cidr: "fe80::42:e4ff:fec8:6e5f/64",
            scopeid: 4,
          },
        ],
        "br-a52e5d90701f": [
          {
            address: "172.18.0.1",
            netmask: "255.255.0.0",
            family: "IPv4",
            mac: "02:42:f6:7e:a2:45",
            internal: false,
            cidr: "172.18.0.1/16",
          },
          {
            address: "fe80::42:f6ff:fe7e:a245",
            netmask: "ffff:ffff:ffff:ffff::",
            family: "IPv6",
            mac: "02:42:f6:7e:a2:45",
            internal: false,
            cidr: "fe80::42:f6ff:fe7e:a245/64",
            scopeid: 5,
          },
        ],
        docker0: [
          {
            address: "172.17.0.1",
            netmask: "255.255.0.0",
            family: "IPv4",
            mac: "02:42:3e:89:61:cf",
            internal: false,
            cidr: "172.17.0.1/16",
          },
        ],
      };
    });
    expect(stderr.indexOf("172.17.0.1") === -1);
    expect(stderr.indexOf("192.168.1.15") > -1);
  });

  it('should work using "--host local-ipv4"', async () => {
    const { exitCode, stderr } = await testBin([
      "--port",
      port,
      "--host",
      "local-ipv4",
    ]);

    expect(exitCode).toEqual(0);
    expect(normalizeStderr(stderr)).toMatchSnapshot("stderr");
  });
});
