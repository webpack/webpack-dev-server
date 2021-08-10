"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config-other/webpack.config");
const port = require("../ports-map")["compress-option"];

describe("compress option", () => {
  let server;
  let req;

  describe("enabled by default when not specified", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server({ port }, compiler);

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("request to bundle file", async () => {
      const response = await req.get("/main.js");

      expect(response.headers["content-encoding"]).toEqual("gzip");
      expect(response.status).toEqual(200);
    });
  });

  describe("as a true", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          compress: true,
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

    it("request to bundle file", async () => {
      const response = await req.get("/main.js");

      expect(response.headers["content-encoding"]).toEqual("gzip");
      expect(response.status).toEqual(200);
    });
  });

  describe("as a false", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          compress: false,
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

    it("request to bundle file", async () => {
      const response = await req.get("/main.js");

      // eslint-disable-next-line no-undefined
      expect(response.headers["content-encoding"]).toEqual(undefined);
      expect(response.status).toEqual(200);
    });
  });
});
