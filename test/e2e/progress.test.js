"use strict";

const path = require("path");
const fs = require("graceful-fs");
const webpack = require("webpack");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const reloadConfig = require("../fixtures/reload-config-2/webpack.config");
const port = require("../ports-map").progress;

const cssFilePath = path.resolve(
  __dirname,
  "../fixtures/reload-config-2/main.css",
);

test.describe("progress", () => {
  test("should work and log progress in a browser console", async ({
    page,
  }) => {
    fs.writeFileSync(cssFilePath, "body { background-color: rgb(0, 0, 255); }");

    const compiler = webpack(reloadConfig);
    const devServerOptions = {
      port,
      client: {
        progress: true,
      },
    };
    const server = new Server(devServerOptions, compiler);

    await server.start();

    try {
      const consoleMessages = [];

      try {
        let doHotUpdate = false;

        page
          .on("console", (message) => {
            consoleMessages.push(message);
          })
          .on("request", (interceptedRequest) => {
            if (/\.hot-update\.(json|js)$/.test(interceptedRequest.url())) {
              doHotUpdate = true;
            }
          });

        await page.goto(`http://localhost:${port}/`, {
          waitUntil: "networkidle0",
        });

        fs.writeFileSync(
          cssFilePath,
          "body { background-color: rgb(255, 0, 0); }",
        );

        await new Promise((resolve) => {
          const timer = setInterval(() => {
            if (doHotUpdate) {
              clearInterval(timer);

              resolve();
            }
          }, 100);
        });
      } catch (error) {
        throw error;
      }

      const progressConsoleMessage = consoleMessages.filter((message) =>
        /^\[webpack-dev-server\] (\[[a-zA-Z]+\] )?[0-9]{1,3}% - /.test(
          message.text(),
        ),
      );

      expect(progressConsoleMessage.length > 0).toBe(true);
    } catch (error) {
      throw error;
    } finally {
      fs.unlinkSync(cssFilePath);

      await server.stop();
    }
  });
});
