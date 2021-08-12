"use strict";

const path = require("path");
const http2 = require("http2");
const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/contentbase-config/webpack.config");
const port = require("../ports-map")["http2-option"];

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/contentbase-config/public"
);

describe('"http2" option', () => {
  let server;
  let req;

  describe("http2 works with https", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: staticDirectory,
          https: true,
          http2: true,
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

    it("confirm http2 client can connect", (done) => {
      const client = http2.connect(`https://localhost:${port}`, {
        rejectUnauthorized: false,
      });

      client.on("error", (err) => console.error(err));

      const http2Req = client.request({ ":path": "/" });

      http2Req.on("response", (headers) => {
        expect(headers[":status"]).toEqual(200);
      });

      http2Req.setEncoding("utf8");

      let data = "";

      http2Req.on("data", (chunk) => {
        data += chunk;
      });
      http2Req.on("end", () => {
        expect(data).toEqual(expect.stringMatching(/Heyo/));
        done();
      });
      http2Req.end();
    });
  });

  describe("server works with http2 option, but without https option", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: staticDirectory,
          http2: true,
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

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Heyo");
    });
  });

  describe("https without http2 disables HTTP/2", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          static: staticDirectory,
          https: true,
          http2: false,
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

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Heyo");
      expect(response.res.httpVersion).not.toEqual("2.0");
    });
  });
});
