"use strict";

const path = require("path");
const webpack = require("webpack");
const request = require("supertest");
const Server = require("../../lib/Server");
const config = require("../fixtures/historyapifallback-config/webpack.config");
const config2 = require("../fixtures/historyapifallback-2-config/webpack.config");
const config3 = require("../fixtures/historyapifallback-3-config/webpack.config");
const port = require("../ports-map")["history-api-fallback-option"];

describe("historyApiFallback option", () => {
  let server;
  let req;

  describe("as boolean", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: true,
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
      await server.stop();
    });

    it("request to directory", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.headers["content-type"]).toEqual(
        "text/html; charset=utf-8"
      );
      expect(response.status).toEqual(200);
      expect(response.text).toContain("Heyyy");
    });
  });

  describe("as object", () => {
    beforeAll(async () => {
      const compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: {
            index: "/bar.html",
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
      await server.stop();
    });

    it("request to directory", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
    });
  });

  describe("as object with static", () => {
    beforeAll(async () => {
      const compiler = webpack(config2);

      server = new Server(
        {
          static: path.resolve(
            __dirname,
            "../fixtures/historyapifallback-2-config"
          ),
          historyApiFallback: {
            index: "/bar.html",
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
      await server.stop();
    });

    it("historyApiFallback should take preference above directory index", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
    });

    it("request to directory", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
    });

    it("static file should take preference above historyApiFallback", async () => {
      const response = await req.get("/random-file").accept("html");

      expect(response.status).toEqual(200);
      expect(response.body.toString().trim()).toEqual("Random file");
    });
  });

  describe("as object with static set to false", () => {
    beforeAll(async () => {
      const compiler = webpack(config3);

      server = new Server(
        {
          static: false,
          historyApiFallback: {
            index: "/bar.html",
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
      await server.stop();
    });

    it("historyApiFallback should work and ignore static content", async () => {
      const response = await req.get("/index.html").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("In-memory file");
    });
  });

  describe("as object with static and rewrites", () => {
    beforeAll(async () => {
      const compiler = webpack(config2);

      server = new Server(
        {
          port,
          static: path.resolve(
            __dirname,
            "../fixtures/historyapifallback-2-config"
          ),
          historyApiFallback: {
            rewrites: [
              {
                from: /other/,
                to: "/other.html",
              },
              {
                from: /.*/,
                to: "/bar.html",
              },
            ],
          },
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
      await server.stop();
    });

    it("historyApiFallback respect rewrites for index", async () => {
      const response = await req.get("/").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
    });

    it("historyApiFallback respect rewrites and shows index for unknown urls", async () => {
      const response = await req.get("/acme").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
    });

    it("historyApiFallback respect any other specified rewrites", async () => {
      const response = await req.get("/other").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Other file");
    });
  });

  describe('as object with the "verbose" option', () => {
    let consoleSpy;

    beforeAll(async () => {
      consoleSpy = jest.spyOn(global.console, "log");

      const compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: {
            index: "/bar.html",
            verbose: true,
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
      consoleSpy.mockRestore();

      await server.stop();
    });

    it("request to directory and log", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Rewriting",
        "GET",
        "/foo",
        "to",
        "/bar.html"
      );
    });
  });

  describe('as object with the "logger" option', () => {
    let consoleSpy;

    beforeAll(async () => {
      consoleSpy = jest.spyOn(global.console, "log");

      const compiler = webpack(config);

      server = new Server(
        {
          historyApiFallback: {
            index: "/bar.html",
            logger: consoleSpy,
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
      consoleSpy.mockRestore();

      await server.stop();
    });

    it("request to directory and log", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("Foobar");
      expect(consoleSpy).toHaveBeenCalledWith(
        "Rewriting",
        "GET",
        "/foo",
        "to",
        "/bar.html"
      );
    });
  });

  describe("in-memory files", () => {
    beforeAll(async () => {
      const compiler = webpack(config3);

      server = new Server(
        {
          static: path.resolve(
            __dirname,
            "../fixtures/historyapifallback-3-config"
          ),
          historyApiFallback: true,
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
      await server.stop();
    });

    it("should take precedence over static files", async () => {
      const response = await req.get("/foo").accept("html");

      expect(response.status).toEqual(200);
      expect(response.text).toContain("In-memory file");
    });
  });
});
