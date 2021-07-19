"use strict";

const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").logging;

describe("logging", () => {
  const webSocketServers = [
    { webSocketServer: "ws" },
    { webSocketServer: "sockjs" },
  ];

  const cases = [
    {
      title: "should work and log message about live reloading is enabled",
      devServerOptions: {
        hot: false,
      },
    },
    {
      title:
        "should work and log messages about hot and live reloading is enabled",
      devServerOptions: {
        hot: true,
      },
    },
    {
      title: "should work and log messages about hot is enabled",
      devServerOptions: {
        liveReload: false,
      },
    },
    {
      title:
        "should work and log messages about hot and live reloading is enabled",
      devServerOptions: {
        liveReload: true,
      },
    },
    {
      title:
        "should work and do not log messages about hot and live reloading is enabled",
      devServerOptions: {
        liveReload: false,
        hot: false,
      },
    },
    {
      title:
        "should work and log messages about hot and live reloading is enabled",
      devServerOptions: {
        liveReload: true,
        hot: true,
      },
    },
    {
      title: "should work and log warnings by default",
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
      },
    },
    {
      title: "should work and log errors by default",
      webpackOptions: {
        plugins: [
          {
            apply(compiler) {
              compiler.hooks.thisCompilation.tap(
                "warnings-webpack-plugin",
                (compilation) => {
                  compilation.errors.push(new Error("Error from compilation"));
                }
              );
            },
          },
        ],
      },
    },
    {
      title: 'should work when the "client.logging" is "info"',
      devServerOptions: {
        client: {
          logging: "info",
        },
      },
    },
    {
      title: 'should work when the "client.logging" is "log"',
      devServerOptions: {
        client: {
          logging: "log",
        },
      },
    },
    {
      title: 'should work when the "client.logging" is "verbose"',
      devServerOptions: {
        client: {
          logging: "verbose",
        },
      },
    },
    {
      title: 'should work when the "client.logging" is "none"',
      devServerOptions: {
        client: {
          logging: "none",
        },
      },
    },
    {
      title: "should work and log only error",
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
                  compilation.errors.push(new Error("Error from compilation"));
                }
              );
            },
          },
        ],
      },
      devServerOptions: {
        client: {
          logging: "error",
        },
      },
    },
    {
      title: "should work and log warning and errors",
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
                  compilation.errors.push(new Error("Error from compilation"));
                }
              );
            },
          },
        ],
      },
      devServerOptions: {
        client: {
          logging: "warn",
        },
      },
    },
    {
      title: "should work and log static changes",
      devServerOptions: {
        static: path.resolve(__dirname, "../fixtures/client-config/static"),
      },
    },
  ];

  webSocketServers.forEach((webSocketServer) => {
    cases.forEach((testCase) => {
      it(`${testCase.title} (${
        webSocketServer.webSocketServer || "default"
      })`, async () => {
        const compiler = webpack({ ...config, ...testCase.webpackOptions });
        const devServerOptions = {
          host: "0.0.0.0",
          port,
          ...testCase.devServerOptions,
        };
        const server = new Server(devServerOptions, compiler);

        await new Promise((resolve, reject) => {
          server.listen(
            devServerOptions.port,
            devServerOptions.host,
            (error) => {
              if (error) {
                reject(error);

                return;
              }

              resolve();
            }
          );
        });

        const { page, browser } = await runBrowser();

        const consoleMessages = [];

        page.on("console", (message) => {
          consoleMessages.push(message);
        });

        await page.goto(`http://localhost:${port}/main`, {
          waitUntil: "networkidle0",
        });

        if (testCase.devServerOptions && testCase.devServerOptions.static) {
          fs.writeFileSync(
            path.join(testCase.devServerOptions.static, "./foo.txt"),
            "Text"
          );

          await page.waitForNavigation({
            waitUntil: "networkidle0",
          });
        }

        expect(
          consoleMessages.map((message) =>
            message
              .text()
              .replace(/\\/g, "/")
              .replace(
                new RegExp(process.cwd().replace(/\\/g, "/"), "g"),
                "<cwd>"
              )
          )
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
});
