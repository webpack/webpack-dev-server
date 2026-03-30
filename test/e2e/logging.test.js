import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import fs from "graceful-fs";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import HTMLGeneratorPlugin from "../helpers/html-generator-plugin.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = portsMap.logging;

describe("logging", () => {
  const webSocketServers = [{ webSocketServer: "ws" }];

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
                    new Error("Warning from compilation"),
                  );
                },
              );
            },
          },
          new HTMLGeneratorPlugin(),
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
                },
              );
            },
          },
          new HTMLGeneratorPlugin(),
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
                    new Error("Warning from compilation"),
                  );
                  compilation.errors.push(new Error("Error from compilation"));
                },
              );
            },
          },
          new HTMLGeneratorPlugin(),
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
                    new Error("Warning from compilation"),
                  );
                  compilation.errors.push(new Error("Error from compilation"));
                },
              );
            },
          },
          new HTMLGeneratorPlugin(),
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

  for (const webSocketServer of webSocketServers) {
    for (const testCase of cases) {
      it(`${testCase.title} (${
        webSocketServer.webSocketServer || "default"
      })`, async (t) => {
        const compiler = webpack({ ...config, ...testCase.webpackOptions });
        const devServerOptions = {
          port,
          ...testCase.devServerOptions,
        };
        const server = new Server(devServerOptions, compiler);

        await server.start();

        const { page, browser } = await runBrowser();

        try {
          const consoleMessages = [];

          page.on("console", (message) => {
            consoleMessages.push(message);
          });

          await page.goto(`http://localhost:${port}/`, {
            waitUntil: "networkidle0",
          });

          if (testCase.devServerOptions && testCase.devServerOptions.static) {
            fs.writeFileSync(
              path.join(testCase.devServerOptions.static, "./foo.txt"),
              "Text",
            );

            await page.waitForNavigation({
              waitUntil: "networkidle0",
            });
          }

          t.assert.snapshot(
            consoleMessages.map((message) =>
              message
                .text()
                .replaceAll("\\", "/")
                .replaceAll(
                  new RegExp(process.cwd().replaceAll("\\", "/"), "g"),
                  "<cwd>",
                ),
            ),
          );
        } finally {
          await browser.close();
          await server.stop();
        }
      });
    }
  }

  describe("plugin mode", () => {
    const pluginCases = [
      {
        title:
          "should work and log messages about hot and live reloading is enabled",
        devServerOptions: {
          hot: true,
        },
      },
      {
        title: "should work and log message about live reloading is enabled",
        devServerOptions: {
          hot: false,
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
        title: "should work and log warnings by default",
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
                    compilation.errors.push(
                      new Error("Error from compilation"),
                    );
                  },
                );
              },
            },
            new HTMLGeneratorPlugin(),
          ],
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
    ];

    for (const testCase of pluginCases) {
      it(`${testCase.title}`, async (t) => {
        const compiler = webpack({ ...config, ...testCase.webpackOptions });
        const devServerOptions = {
          port,
          ...testCase.devServerOptions,
        };
        const server = new Server(devServerOptions);

        server.apply(compiler);

        await compile(compiler, port);

        const { page, browser } = await runBrowser();

        try {
          const consoleMessages = [];

          page.on("console", (message) => {
            consoleMessages.push(message);
          });

          await page.goto(`http://127.0.0.1:${port}/`, {
            waitUntil: "networkidle0",
          });

          t.assert.snapshot(
            consoleMessages.map((message) =>
              message
                .text()
                .replaceAll("\\", "/")
                .replaceAll(
                  new RegExp(process.cwd().replaceAll("\\", "/"), "g"),
                  "<cwd>",
                ),
            ),
          );
        } finally {
          await browser.close();
          await new Promise((resolve) => {
            compiler.close(resolve);
          });
        }
      });
    }
  });
});
