"use strict";

const path = require("path");
const webpack = require("webpack");
const { test } = require("../helpers/playwright-test");
const { expect } = require("../helpers/playwright-custom-expects");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const port = require("../ports-map").app;

const staticDirectory = path.resolve(
  __dirname,
  "../fixtures/static-config/public",
);

const apps = [
  ["express", () => require("express")()],
  ["connect", () => require("connect")()],
  ["connect (async)", () => require("connect")()],
];

const servers = ["http", "https", "spdy", "http2"];

test.describe("app option", () => {
  for (const [appName, app] of apps) {
    for (const server of servers) {
      if (appName === "express" && server === "http2") {
        // eslint-disable-next-line no-continue
        continue;
      }

      let compiler;
      let devServer;
      let pageErrors;
      let consoleMessages;

      test.describe(`should work using "${appName}" application and "${server}" server`, () => {
        test.beforeEach(async () => {
          compiler = webpack(config);

          devServer = new Server(
            {
              static: {
                directory: staticDirectory,
                watch: false,
              },
              app,
              server,
              port,
            },
            compiler,
          );

          await devServer.start();

          pageErrors = [];
          consoleMessages = [];
        });

        test.afterEach(async () => {
          await devServer.stop();
        });

        test("should handle GET request to index route (/)", async ({
          browser,
        }) => {
          const context = await browser.newContext({
            ignoreHTTPSErrors: true,
          });
          const page = await context.newPage();

          page
            .on("console", (message) => {
              consoleMessages.push(message);
            })
            .on("pageerror", (error) => {
              pageErrors.push(error);
            });

          const pageUrl =
            server === "https" || server === "spdy" || server === "http2"
              ? `https://127.0.0.1:${port}/`
              : `http://127.0.0.1:${port}/`;

          const response = await page.goto(pageUrl, {
            waitUntil: "networkidle0",
          });

          const HTTPVersion = await page.evaluate(
            () => performance.getEntries()[0].nextHopProtocol,
          );

          if (server === "spdy" || server === "http2") {
            expect(HTTPVersion).toEqual("h2");
          } else {
            expect(HTTPVersion).toEqual("http/1.1");
          }

          expect(response.status()).toEqual(200);
          await expect(page).toHaveScreenshot();
          expect(
            consoleMessages.map((message) => message.text()),
          ).toMatchSnapshotWithArray("console messages");
          expect(pageErrors).toMatchSnapshotWithArray("page errors");
        });
      });
    }
  }
});
