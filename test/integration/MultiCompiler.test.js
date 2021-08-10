"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/multi-compiler-config/webpack.config");
const port = require("../ports-map")["multi-compiler"];

describe("multi compiler", () => {
  let server;
  let req;

  beforeAll(async () => {
    const compiler = webpack(config);

    server = new Server({ port }, compiler);

    await new Promise((resolve, reject) => {
      server.listen(port, "127.0.0.1", (error) => {
        if (error) {
          reject(error);

          return;
        }

        resolve();
      });
    });

    req = request(server.app);
  });

  afterAll(async () => {
    await server.stop();
  });

  it("should handle GET request to bundle", async () => {
    const response = await req.get("/main.js");

    expect(response.headers["content-type"]).toEqual(
      "application/javascript; charset=utf-8"
    );
    expect(response.status).toEqual(200);
  });
});
