"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["setup-exit-signals-option"];

describe("setupExitSignals option", () => {
  let server;
  let doExit;
  let exitSpy;
  let stopCallbackSpy;
  let stdinResumeSpy;

  const signals = ["SIGINT", "SIGTERM"];

  beforeEach(async () => {
    const compiler = webpack(config);

    server = new Server(
      {
        setupExitSignals: true,
        port,
      },
      compiler
    );

    await server.start();

    doExit = false;

    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {
      doExit = true;
    });
    stdinResumeSpy = jest
      .spyOn(process.stdin, "resume")
      .mockImplementation(() => {});
    stopCallbackSpy = jest.spyOn(server, "stopCallback");
  });

  afterEach(async () => {
    exitSpy.mockReset();
    stdinResumeSpy.mockReset();
    signals.forEach((signal) => {
      process.removeAllListeners(signal);
    });
    process.stdin.removeAllListeners("end");

    await server.stop();
  });

  it.each(signals)("should close and exit on %s", async (signal) => {
    process.emit(signal);

    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (doExit) {
          expect(stopCallbackSpy.mock.calls.length).toEqual(1);

          clearInterval(interval);

          resolve();
        }
      }, 100);
    });
  });
});
