"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").stats;

global.console.log = jest.fn();

describe("stats", () => {
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
        'should work using "{ assets: false }" value for the "stats" option',
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
                    new Error("Warning from compilation")
                  );
                }
              );
            },
          },
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
                    new Error("Warning from compilation")
                  );
                }
              );
            },
          },
        ],
        ignoreWarnings: [/Warning from compilation/],
      },
    });
  }

  cases.forEach((testCase) => {
    it(testCase.title, async () => {
      const compiler = webpack({ ...config, ...testCase.webpackOptions });
      const devServerOptions = {
        host: "127.0.0.1",
        port,
      };
      const server = new Server(devServerOptions, compiler);

      await new Promise((resolve, reject) => {
        server.listen(devServerOptions.port, devServerOptions.host, (error) => {
          if (error) {
            reject(error);

            return;
          }

          resolve();
        });
      });

      const { page, browser } = await runBrowser();

      const consoleMessages = [];

      page.on("console", (message) => {
        consoleMessages.push(message);
      });

      await page.goto(`http://localhost:${port}/main`, {
        waitUntil: "networkidle0",
      });

      expect(
        consoleMessages.map((message) => message.text())
      ).toMatchSnapshot();

      await browser.close();
      await new Promise((resolve) => {
        server.close(() => {
          resolve();
        });
      });
    });
  });
});
