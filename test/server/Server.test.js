"use strict";

const { relative, sep } = require("path");
const webpack = require("webpack");
const sockjs = require("sockjs/lib/transport");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map").server;
const isWebpack5 = require("../helpers/isWebpack5");

jest.mock("sockjs/lib/transport");

const baseDevConfig = {
  port,
  host: "localhost",
  static: false,
};

describe("Server", () => {
  describe("sockjs has decorateConnection", () => {
    it("add decorateConnection", () => {
      expect(typeof sockjs.Session.prototype.decorateConnection).toEqual(
        "function"
      );
    });
  });

  describe("DevServerPlugin", () => {
    let entries;

    function getEntries(server) {
      if (isWebpack5) {
        server.middleware.context.compiler.hooks.afterEmit.tap(
          "webpack-dev-server",
          (compilation) => {
            const mainDeps = compilation.entries.get("main").dependencies;
            const globalDeps = compilation.globalEntry.dependencies;

            entries = globalDeps
              .concat(mainDeps)
              .map((dep) => relative(".", dep.request).split(sep));
          }
        );
      } else {
        entries = server.middleware.context.compiler.options.entry.map((p) =>
          relative(".", p).split(sep)
        );
      }
    }

    it("add hot option", (done) => {
      const compiler = webpack(config);
      const server = new Server({ ...baseDevConfig, hot: true }, compiler);

      compiler.hooks.done.tap("webpack-dev-server", () => {
        expect(entries).toMatchSnapshot();

        server.stopCallback(done);
      });

      server.startCallback((error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });

    it("add hot-only option", (done) => {
      const compiler = webpack(config);
      const server = new Server({ ...baseDevConfig, hot: "only" }, compiler);

      compiler.hooks.done.tap("webpack-dev-server", () => {
        expect(entries).toMatchSnapshot();

        server.stopCallback(done);
      });

      server.startCallback((error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });
    });

    // TODO: remove this after plugin support is published
    it("should create and run server with old parameters order and log deprecation warning", (done) => {
      const compiler = webpack(config);
      const util = require("util");
      const utilSpy = jest.spyOn(util, "deprecate");

      const server = new Server(compiler, baseDevConfig);

      expect(utilSpy.mock.calls[0][1]).toBe(
        "Using 'compiler' as the first argument is deprecated. Please use 'options' as the first argument and 'compiler' as the second argument."
      );

      compiler.hooks.done.tap("webpack-dev-server", () => {
        expect(entries).toMatchSnapshot("oldparam");

        server.stopCallback(done);
      });

      server.startCallback((error) => {
        if (error) {
          throw error;
        }

        getEntries(server);
      });

      utilSpy.mockRestore();
    });
  });

  // issue: https://github.com/webpack/webpack-dev-server/issues/1724
  describe("express.static.mime.types", () => {
    it("should success even if mime.types doesn't exist", async () => {
      // expect.assertions(1);

      jest.mock("express", () => {
        const data = jest.requireActual("express");
        const { static: st } = data;
        const { mime } = st;

        delete mime.types;

        expect(typeof mime.types).toEqual("undefined");

        return { ...data, static: { ...st, mime } };
      });

      const compiler = webpack(config);
      const server = new Server(baseDevConfig, compiler);

      let hasStats = false;

      compiler.hooks.done.tap("webpack-dev-server", (s) => {
        const output = server.getStats(s);

        expect(output.errors.length).toEqual(0);

        hasStats = true;
      });

      await server.start();

      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (hasStats) {
            resolve();

            clearInterval(interval);
          }
        }, 100);
      });

      await server.stop();
    });
  });

  describe("checkHostHeader", () => {
    let compiler;
    let server;

    beforeEach(() => {
      compiler = webpack(config);
    });

    afterEach(async () => {
      await server.stop();
    });

    it("should allow access for every requests using an IP", () => {
      const options = {};

      const tests = [
        "192.168.1.123",
        "192.168.1.2:8080",
        "[::1]",
        "[::1]:8080",
        "[ad42::1de2:54c2:c2fa:1234]",
        "[ad42::1de2:54c2:c2fa:1234]:8080",
      ];

      server = new Server(options, compiler);

      tests.forEach((test) => {
        const headers = { host: test };

        if (!server.checkHeader(headers, "host")) {
          throw new Error("Validation didn't pass");
        }
      });
    });

    it('should allow urls with scheme for checking origin when the "option.client.webSocketURL" is object', () => {
      const options = {
        client: {
          webSocketURL: {
            hostname: "test.host",
          },
        },
      };
      const headers = {
        origin: "https://test.host",
      };

      server = new Server(options, compiler);

      if (!server.checkHeader(headers, "origin")) {
        throw new Error("Validation didn't fail");
      }
    });
  });

  describe("WEBPACK_SERVE environment variable", () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      // this is important - it clears the cache
      jest.resetModules();

      process.env = { ...OLD_ENV };

      delete process.env.WEBPACK_SERVE;
    });

    afterEach(() => {
      process.env = OLD_ENV;
    });

    it("should be present", () => {
      expect(process.env.WEBPACK_SERVE).toBeUndefined();

      require("../../lib/Server");

      expect(process.env.WEBPACK_SERVE).toBe(true);
    });
  });
});
