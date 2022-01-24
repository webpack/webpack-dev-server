"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const isWebpack5 = require("../helpers/isWebpack5");
const port = require("../ports-map").target;

describe("target", () => {
  const targets = isWebpack5
    ? [
        false,
        "browserslist:defaults",
        "web",
        "webworker",
        "node",
        "async-node",
        "electron-main",
        "electron-preload",
        "electron-renderer",
        "nwjs",
        "node-webkit",
        "es5",
        ["web", "es5"],
      ]
    : [
        "web",
        "webworker",
        "node",
        "async-node",
        "electron-main",
        "electron-preload",
        "electron-renderer",
        "node-webkit",
      ];

  for (const target of targets) {
    it(`should work using "${target}" target`, async () => {
      const compiler = webpack({
        ...config,
        target,
        ...(target === false || target === "es5"
          ? {
              output: { chunkFormat: "array-push", path: "/" },
            }
          : {}),
      });
      const devServerOptions = {
        port,
      };
      const server = new Server(devServerOptions, compiler);

      await server.start();

      const { page, browser } = await runBrowser();

      const pageErrors = [];
      const consoleMessages = [];

      page
        .on("console", (message) => {
          consoleMessages.push(message);
        })
        .on("pageerror", (error) => {
          pageErrors.push(error);
        });

      await page.goto(`http://127.0.0.1:${port}/`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );

      if (
        target === "node" ||
        target === "async-node" ||
        target === "electron-main" ||
        target === "electron-preload" ||
        target === "electron-renderer" ||
        target === "nwjs" ||
        target === "node-webkit"
      ) {
        const hasRequireOrGlobalError =
          pageErrors.filter((pageError) =>
            /require is not defined|global is not defined/.test(pageError)
          ).length === 1;

        expect(hasRequireOrGlobalError).toBe(true);
      } else {
        expect(pageErrors).toMatchSnapshot("page errors");
      }

      await browser.close();
      await server.stop();
    });
  }
});
