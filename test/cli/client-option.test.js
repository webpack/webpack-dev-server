"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-client"];

describe('"client" CLI option', () => {
  it('should work using "--client-web-socket-transport sockjs"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-transport",
      "sockjs",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-web-socket-transport ws"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-transport",
      "ws",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-overlay"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-overlay",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--no-client-overlay"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--no-client-overlay",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-overlay-errors"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-overlay-errors",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--no-client-overlay-errors"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--no-client-overlay-errors",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-overlay-warnings"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-overlay-warnings",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--no-client-overlay-warnings"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--no-client-overlay-warnings",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-logging"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-logging",
      "verbose",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-progress"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-progress",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--no-client-progress"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--no-client-progress",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-reconnect"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-reconnect",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-reconnect <value>"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-reconnect",
      5,
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--no-client-reconnect"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--no-client-reconnect",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-web-socket-url"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-url",
      "ws://myhost.com:8080/foo/test",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-web-socket-url-protocol"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-url-protocol",
      "ws:",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-web-socket-url-hostname"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-url-hostname",
      "0.0.0.0",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-web-socket-url-pathname"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-url-pathname",
      "/ws",
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });

  it('should work using "--client-web-socket-url-port"', async () => {
    const { exitCode, killed } = await testBin([
      "--port",
      port,
      "--client-web-socket-url-port",
      8080,
    ]);

    expect(exitCode).toEqual(killed ? 1 : 0);
  });
});
