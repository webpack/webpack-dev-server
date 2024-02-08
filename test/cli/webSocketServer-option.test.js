"use strict";

const { testBin } = require("../helpers/test-bin");
const port = require("../ports-map")["cli-web-socket-server"];

describe('"webSocketServer" CLI option', () => {
  it('should work using "--web-socket-server-type ws"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--web-socket-server-type",
      "ws",
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--web-socket-server-type sockjs"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--web-socket-server-type",
      "sockjs",
    ]);

    expect(exitCode).toEqual(0);
  });

  it('should work using "--no-web-socket-server"', async () => {
    const { exitCode } = await testBin([
      "--port",
      port,
      "--no-web-socket-server",
    ]);

    expect(exitCode).toEqual(0);
  });
});
