"use strict";

const net = require("net");
const util = require("util");
const getPort = require("../../lib/getPort");

it("it should bind to the preferred port", async () => {
  const preferredPort = 8080;
  const port = await getPort(8080);
  expect(port).toBe(preferredPort);
});

it("should pick the next port if the preferred port is unavailable", async () => {
  const preferredPort = 8345;
  const server = net.createServer();
  server.unref();
  await util.promisify(server.listen.bind(server))(preferredPort);
  const port = await getPort(preferredPort);
  server.close();
  expect(port).toBe(preferredPort + 1);
});

it("should reject privileged ports", async () => {
  try {
    await getPort(80);
  } catch (e) {
    expect(e.message).toBeDefined();
  }
});

it("should reject too high port numbers", async () => {
  try {
    await getPort(65536);
  } catch (e) {
    expect(e.message).toBeDefined();
  }
});

describe("when passing a host", () => {
  it("should bind to the preferred port", async () => {
    const preferredPort = 8080;
    const port = await getPort(8080, "127.0.0.1");
    expect(port).toBe(preferredPort);
  });

  it("should pick the next port if the preferred port is unavailable", async () => {
    const preferredPort = 8345;
    const server = net.createServer();
    server.unref();
    await util.promisify(server.listen.bind(server))(preferredPort);
    const port = await getPort(preferredPort, "0.0.0.0");
    server.close();
    expect(port).toBe(preferredPort + 1);
  });
});
