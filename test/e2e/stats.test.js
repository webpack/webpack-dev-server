import { describe, test } from "node:test";

import { spyOn } from "jest-mock";
import webpack from "webpack";
import Server from "../../lib/Server.js";
import config from "../fixtures/client-config/webpack.config.js";
import HTMLGeneratorPlugin from "../helpers/html-generator-plugin.js";
import runBrowser from "../helpers/run-browser.js";
import portsMap from "../ports-map.js";

const port = portsMap.stats;

spyOn(globalThis.console, "log").mockImplementation();

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
            green: "\u001B[32m",
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

  for (const testCase of cases) {
    test(testCase.title, async (t) => {
      const compiler = webpack({ ...config, ...testCase.webpackOptions });
      const devServerOptions = {
        port,
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

        t.assert.snapshot(consoleMessages.map((message) => message.text()));
      } finally {
        await browser.close();
        await server.stop();
      }
    });
  }
});
