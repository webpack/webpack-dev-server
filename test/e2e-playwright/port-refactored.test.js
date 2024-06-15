"use strict";

const webpack = require("webpack");
const { test } = require("@playwright/test");
const { describe } = require("@playwright/test");
const { expect } = require("@playwright/test");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").port;

describe("port", () => {
  const ports = [
    "<not-specified>",
    // eslint-disable-next-line no-undefined
    // undefined,
    // "auto",
    // port,
    // `${port}`,
    // 0,
    // "-1",
    // "99999",
  ];

  for (const testedPort of ports) {
    test(`should work using "${testedPort}" port `, async () => {
      const compiler = webpack(config);
      const devServerOptions = {};

      let usedPort;

      if (
        testedPort === "<not-specified>" ||
        typeof testedPort === "undefined"
      ) {
        process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;
        usedPort = port;
      } else if (testedPort === "auto") {
        process.env.WEBPACK_DEV_SERVER_BASE_PORT = port;
        devServerOptions.port = testedPort;
        usedPort = port;
      } else {
        devServerOptions.port = testedPort;
        usedPort = testedPort;
      }

      const server = new Server(devServerOptions, compiler);

      // Error [ERR_REQUIRE_ESM]: require() of ES Module /Users/mahdi/tmp/webpack-dev-server/node_modules/p-retry/index.js from /Users/mahdi/tmp/webpack-dev-server/lib/Server.js not supported.
      // Instead change the require of index.js in /Users/mahdi/tmp/webpack-dev-server/lib/Server.js to a dynamic import() which is available in all CommonJS modules.
      //     at /Users/mahdi/tmp/webpack-dev-server/lib/Server.js:451:80
      //     at async Server.getFreePort (/Users/mahdi/tmp/webpack-dev-server/lib/Server.js:451:21)
      //     at async Server.start (/Users/mahdi/tmp/webpack-dev-server/lib/Server.js:2545:27)
      //     at async /Users/mahdi/tmp/webpack-dev-server/test/e2e-playwright/port-refactored.test.js:47:9
      //     at async /Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/workerMain.js:336:9
      //     at async /Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/testInfo.js:297:11
      //     at async TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/timeoutManager.js:53:14)
      //     at async TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/testInfo.js:295:7)
      //     at async /Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/workerMain.js:328:7
      //     at async /Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/testInfo.js:297:11
      //     at async TimeoutManager.withRunnable (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/timeoutManager.js:41:27)
      //     at async TestInfoImpl._runAsStage (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/testInfo.js:295:7)
      //     at async WorkerMain._runTest (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/workerMain.js:278:5)
      //     at async WorkerMain.runTestGroup (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/worker/workerMain.js:202:11)
      //     at async process.<anonymous> (/Users/mahdi/tmp/webpack-dev-server/node_modules/playwright/lib/common/process.js:94:22)
      let errored;

      try {
        await server.start();
      } catch (error) {
        errored = error;
      }

      if (testedPort === "-1" || testedPort === "99999") {
        const errorMessageRegExp = new RegExp(
          `options.port should be >= 0 and < 65536`,
        );

        try {
          expect(errored.message).toMatch(errorMessageRegExp);
        } catch (error) {
          throw error;
        } finally {
          await server.stop();
        }

        return;
      }

      const address = server.server.address();

      if (testedPort === 0) {
        expect(typeof address.port).toBe("number");
      } else {
        expect(address.port).toBe(Number(usedPort));
      }

      const { page, browser } = await runBrowser();

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

        await page.goto(`http://127.0.0.1:${address.port}/`, {
          waitUntil: "networkidle0",
        });

        expect(
          consoleMessages.map((message) => message.text()),
        ).toMatchSnapshot("console messages");
        expect(pageErrors).toMatchSnapshot("page errors");
      } catch (error) {
        throw error;
      } finally {
        await browser.close();
        await server.stop();
      }

      if (
        testedPort === "<not-specified>" ||
        typeof testedPort === "undefined"
      ) {
        delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
      }
    });
  }
});
