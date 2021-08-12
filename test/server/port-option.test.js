"use strict";

const path = require("path");
const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["port-option"];

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/contentbase-config"
);

describe('"port" option', () => {
  let server = null;
  let req = null;

  describe("is not be specified", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      process.env.WEBPACK_DEV_SERVER_BASE_PORT = 10020;

      server = new Server(
        {
          port,
          static: {
            directory: staticDirectory,
            watch: false,
          },
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;

      await server.stop();
    });

    it("server address", () => {
      const address = server.server.address();

      expect(address.address).toBe("::");
      // Random port
      expect(address.port).toBeDefined();
    });

    it("then Request to index", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
    });
  });

  describe("is undefined", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      process.env.WEBPACK_DEV_SERVER_BASE_PORT = 10030;

      server = new Server(
        {
          // eslint-disable-next-line no-undefined
          port: undefined,
          static: {
            directory: staticDirectory,
            watch: false,
          },
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;

      await server.stop();
    });

    it("server address", () => {
      const address = server.server.address();

      expect(address.address).toBe("::");
      // Random port
      expect(address.port).toBeDefined();
    });

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
    });
  });

  describe("is auto", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      process.env.WEBPACK_DEV_SERVER_BASE_PORT = 10040;

      server = new Server(
        {
          port: "auto",
          static: {
            directory: staticDirectory,
            watch: false,
          },
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;

      await server.stop();
    });

    it("server address", () => {
      const address = server.server.address();

      expect(address.address).toBe("::");
      // Random port
      expect(address.port).toBeDefined();
    });

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
    });
  });

  describe('is "33333"', () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          port: "33333",
          static: {
            directory: staticDirectory,
            watch: false,
          },
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("server address", () => {
      const address = server.server.address();

      expect(address.address).toBe("::");
      expect(address.port).toBe(33333);
    });

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
    });
  });

  describe("is 33333", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          port: 33333,
          static: {
            directory: staticDirectory,
            watch: false,
          },
        },
        compiler
      );

      await server.start();

      req = request(server.app);
    });

    afterAll(async () => {
      await server.stop();
    });

    it("server address", () => {
      const address = server.server.address();

      expect(address.address).toBe("::");
      expect(address.port).toBe(33333);
    });

    it("Request to index", async () => {
      const response = await req.get("/");

      expect(response.statusCode).toEqual(200);
    });
  });
});
