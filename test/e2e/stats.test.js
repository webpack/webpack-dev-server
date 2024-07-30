"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const config = require("../fixtures/client-config/webpack.config");
const HTMLGeneratorPlugin = require("../helpers/html-generator-plugin");
const port = require("../ports-map").stats;

test.describe("stats", () => {
  const cases = [
    {
      title: 'should work when "stats" is not specified',
      webpackOptions: {},
    },
    {
      title: 'should work using "{}" value for the "stats" option',
      webpackOptions: {
        stats: {},
      },
    },
    {
      title: 'should work using "undefined" value for the "stats" option',
      webpackOptions: {
        // eslint-disable-next-line no-undefined
        stats: undefined,
      },
    },
    {
      title: 'should work using "false" value for the "stats" option',
      webpackOptions: {
        stats: false,
      },
    },
    {
      title: 'should work using "errors-only" value for the "stats" option',
      webpackOptions: {
        stats: "errors-only",
      },
    },
    {
      title:
        'should work using "{ assets: false }" value for the "stats" option',
      webpackOptions: {
        stats: {
          assets: false,
        },
      },
    },
    {
      title:
        'should work using "{ colors: { green: "\u001b[32m" }}" value for the "stats" option',
      webpackOptions: {
        stats: {
          colors: {
            green: "\u001b[32m",
          },
        },
      },
    },
    {
      title:
        'should work using "{ warningsFilter: \'test\' }" value for the "stats" option',
      webpackOptions: {
        plugins: [
          {
            apply(compiler) {
              compiler.hooks.thisCompilation.tap(
                "warnings-webpack-plugin",
                (compilation) => {
                  compilation.warnings.push(
                    new Error("Warning from compilation"),
                  );
                },
              );
            },
          },
          new HTMLGeneratorPlugin(),
        ],
        stats: { warningsFilter: /Warning from compilation/ },
      },
    },
  ];

  if (webpack.version.startsWith("5")) {
    cases.push({
      title: 'should work and respect the "ignoreWarnings" option',
      webpackOptions: {
        plugins: [
          {
            apply(compiler) {
              compiler.hooks.thisCompilation.tap(
                "warnings-webpack-plugin",
                (compilation) => {
                  compilation.warnings.push(
                    new Error("Warning from compilation"),
                  );
                },
              );
            },
          },
          new HTMLGeneratorPlugin(),
        ],
        ignoreWarnings: [/Warning from compilation/],
      },
    });
  }

  cases.forEach((testCase) => {
    test(testCase.title, async ({ page }) => {
      const compiler = webpack({ ...config, ...testCase.webpackOptions });
      const devServerOptions = {
        port,
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      try {
        const consoleMessages = [];

        page.on("console", (message) => {
          consoleMessages.push(message);
        });

        await page.goto(`http://localhost:${port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text())
        ).toMatchSnapshotWithArray("console messages");
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }
    });
  });
});
