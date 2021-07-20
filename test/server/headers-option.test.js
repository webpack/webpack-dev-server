"use strict";

const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map")["headers-option"];

describe("headers option", () => {
  let server;
  let req;

  describe("as a string", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          headers: { "X-Foo": "1" },
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

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("GET request with headers", async () => {
      const response = await req.get("/main.js");

      expect(response.headers["x-foo"]).toEqual("1");
      expect(response.status).toEqual(200);
    });
  });

  describe("as an array", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          headers: { "X-Bar": ["key1=value1", "key2=value2"] },
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

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("GET request with headers as an array", async () => {
      // https://github.com/webpack/webpack-dev-server/pull/1650#discussion_r254217027
      const expected = "key1=value1, key2=value2";
      const response = await req.get("/main.js");

      expect(response.headers["x-bar"]).toEqual(expected);
      expect(response.status).toEqual(200);
    });
  });

  describe("as a function", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          headers: () => {
            return { "X-Bar": ["key1=value1", "key2=value2"] };
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

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("GET request with headers as a function", async () => {
      // https://github.com/webpack/webpack-dev-server/pull/1650#discussion_r254217027
      const expected = "key1=value1, key2=value2";
      const response = await req.get("/main.js");

      expect(response.headers["x-bar"]).toEqual(expected);
      expect(response.status).toEqual(200);
    });
  });

  describe("dev middleware headers take precedence for dev middleware output files", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          headers: { "X-Foo": "1" },
          devMiddleware: {
            headers: { "X-Foo": "2" },
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

      req = request(server.app);
    });

    afterAll(async () => {
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });

    it("GET request with headers", async () => {
      const response = await req.get("/main.js");

      expect(response.headers["x-foo"]).toEqual("2");
      expect(response.status).toEqual(200);
    });
  });
});
