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

    await new Promise((resolve, reject) => {
      server.listen(port, "127.0.0.1", (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });
  });

  afterAll(async () => {
    await server.stop();
  });

  it("should runs onListening callback", () => {
    expect(onListeningIsRunning).toBe(true);
  });
});
