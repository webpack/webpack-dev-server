"use strict";

const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map").target;

describe("target", () => {
  const targets = [
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
  ];

  for (const target of targets) {
    test(`should work using "${target}" target`, async ({ page }) => {
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

      try {
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

        expect(
          JSON.stringify(consoleMessages.map((message) => message.text())),
        ).toMatchSnapshot();

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
              /require is not defined|global is not defined/.test(pageError),
            ).length === 1;

          expect(hasRequireOrGlobalError).toBe(true);
        } else {
          expect(JSON.stringify(pageErrors)).toMatchSnapshot();
        }
      } catch (error) {
        throw error;
      } finally {
        await server.stop();
      }
    });
  }
});
