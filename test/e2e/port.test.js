"use strict";

const webpack = require("webpack");
const Server = require("../../lib/Server");
const config = require("../fixtures/client-config/webpack.config");
const runBrowser = require("../helpers/run-browser");
const port = require("../ports-map").port;

describe("port", () => {
  const ports = [
    "<not-specified>",
    // eslint-disable-next-line no-undefined
    undefined,
    "auto",
    port,
    `${port}`,
  ];

  for (const testedPort of ports) {
    it(`should work using "${testedPort}" port `, async () => {
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

      await server.start();

      const address = server.server.address();

      expect(address.port).toBe(Number(usedPort));

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

      await page.goto(`http://127.0.0.1:${usedPort}/main`, {
        waitUntil: "networkidle0",
      });

      expect(consoleMessages.map((message) => message.text())).toMatchSnapshot(
        "console messages"
      );
      expect(pageErrors).toMatchSnapshot("page errors");

      await browser.close();
      await server.stop();

      if (
        testedPort === "<not-specified>" ||
        typeof testedPort === "undefined"
      ) {
        delete process.env.WEBPACK_DEV_SERVER_BASE_PORT;
      }
    });
  }
});
