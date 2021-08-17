"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["setup-exit-signals-option"];

describe("setupExitSignals option", () => {
  let server;
  let exitSpy;
  let killSpy;
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

    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});
    stdinResumeSpy = jest
      .spyOn(process.stdin, "resume")
      .mockImplementation(() => {});
    killSpy = jest.spyOn(server.server, "kill");
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

  it.each(signals)("should close and exit on %s", (signal, done) => {
    process.emit(signal);

    setTimeout(() => {
      expect(killSpy.mock.calls.length).toEqual(1);
      expect(exitSpy.mock.calls.length).toEqual(1);

      done();
    }, 1000);
  });
});
