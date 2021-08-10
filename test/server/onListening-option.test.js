"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["on-listening-option"];

describe("onListening option", () => {
  let server;
  let onListeningIsRunning = false;

  beforeAll(async () => {
    const compiler = webpack(config);

    server = new Server(
      {
        onListening: (devServer) => {
          if (!devServer) {
            throw new Error("webpack-dev-server is not defined");
          }

          onListeningIsRunning = true;
        },
        port,
      },
      compiler
    );

    await server.start();
  });

  afterAll(async () => {
    await server.stop();
  });

  it("should runs onListening callback", () => {
    expect(onListeningIsRunning).toBe(true);
  });
});
