"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/mime-types-config/webpack.config");
const port = require("../ports-map")["mine-types-option"];

describe('"mimeTypes" option', () => {
  describe("as an object with a remapped type", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          devMiddleware: {
            mimeTypes: {
              js: "application/octet-stream",
            },
          },
          port,
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("requests file with different js mime type", async () => {
      const response = await req.get("/main.js");

      expect(response.status).toEqual(200);
      expect(response.headers["content-type"]).toEqual(
        "application/octet-stream"
      );
    });
  });

  describe("as an object with a custom type", () => {
    let server;
    let req;

    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          devMiddleware: {
            mimeTypes: {
              custom: "text/html",
            },
          },
          port,
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("requests file with custom mime type", async () => {
      const response = await req.get("/file.custom");

      expect(response.status).toEqual(200);
      expect(response.headers["content-type"]).toEqual(
        "text/html; charset=utf-8"
      );
    });
  });
});
