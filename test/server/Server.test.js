"use strict";

const { relative, sep } = require("path");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/simple-config/webpack.config");
const port = require("../ports-map").server;
const isWebpack5 = require("../helpers/isWebpack5");

const baseDevConfig = {
  port,
  host: "localhost",
  static: false,
};

describe("Server", () => {
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
});
